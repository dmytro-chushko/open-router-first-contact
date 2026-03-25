# Загальна ідея

**Мета:** невеликий, але реалістичний продукт — чат з AI (як ChatGPT/Gemini), на базі:

- **OpenRouter API** як «шлюз» до різних моделей
- **Turborepo** як монорепо для організації коду
- **Next.js + React** як фронтенд
- **NestJS + PostgreSQL** як бекенд для історії чатів, користувачів тощо

Нижче — поетапний гайд: від архітектури до перших кроків у коді.

---

## 1. Архітектура проєкту

### Рівень 1 — Монорепо (Turborepo)

**Структура (приблизно):**

| Пакет / app                  | Призначення                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `apps/web`                   | Next.js застосунок (UI чату)                                                      |
| `apps/api`                   | NestJS API (автентифікація, зберігання історії, обмеження, billing, якщо захочеш) |
| `packages/openrouter-client` | Невеликий SDK-обгортка для OpenRouter (спільна між web і api, якщо треба)         |
| `packages/ui`                | Спільні React-компоненти (кнопки, layout, інпут чату тощо)                        |
| `packages/config`            | Спільні ESLint/TSConfig та інші конфіги                                           |

### Потік запиту

1. Користувач у `apps/web` вводить повідомлення.
2. **web** відправляє його на **apps/api** (`POST /chat`).
3. **api:**
   - додає запис у БД (Postgres);
   - викликає OpenRouter (чат-комплішин, бажано стрімінгом);
   - повертає стрім респонсу на фронт.
4. **web** показує стрімований текст, оновлюючи UI.

---

## 2. Вибір моделі в OpenRouter

На старті важливо:

- невисока ціна / доступність;
- достатній рівень якості для діалогу.

**Рекомендації:**

- **Базова модель:** щось на кшталт `openai/gpt-4.1-mini` або аналог серед дешевших моделей (на OpenRouter можна відфільтрувати «cheap / fast»).
- **Потужніша (експерименти):** `openai/gpt-4.1` / `anthropic/claude-3.7-sonnet` (або актуальні аналоги — див. [openrouter.ai/models](https://openrouter.ai/models)).
- **Альтернатива:** Free Models Router (якщо доступний) для безкоштовних тестів — не розраховувати на production.

**Порада:** у коді зроби конфіг з дефолтною моделлю + пресетами, наприклад:

```ts
// псевдокод
const MODEL_PRESETS = {
  default: 'openai/gpt-4.1-mini',
  reasoning: 'anthropic/claude-3.7-sonnet',
  cheap: 'qwen/qwen2.5-7b-instruct',
};
```

---

## 3. Як працювати з OpenRouter (базова інтеграція)

Два основні варіанти:

1. **Офіційний SDK:** `@openrouter/sdk`
2. **`fetch` / `axios`** на `https://openrouter.ai/api/v1/chat/completions`

Для старту зручніше **SDK**:

```ts
import { OpenRouter } from '@openrouter/sdk';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://your-app-url.com',
    'X-Title': 'My AI Chat App',
  },
});

export async function askModel(messages) {
  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4.1-mini',
    messages,
    stream: false, // для старту без стрімінгу
  });
  return completion.choices[0]?.message?.content;
}
```

**Env** (корінь монорепо, `.env`):

```env
OPENROUTER_API_KEY=sk-or-...
```

---

## 4. Технологічна стратегія: що де реалізувати

### Фронтенд (`apps/web`, Next.js)

- **UI чату:** список повідомлень (user / assistant), інпут + «Send», статус «thinking…»; пізніше — вибір моделі, temperature, системні промпти.
- **Роутинг:** одна сторінка `/chat`.
- **Виклики API:** `fetch("/api/chat")` або до `apps/api` за URL (наприклад `http://localhost:4000/chat`).

### Бекенд (`apps/api`, NestJS)

- **ChatModule:** `POST /chat` — приймає `messages`, опційно `model`; викликає OpenRouter; повертає відповідь.
- **Persistence (пізніше):** Postgres через Prisma/TypeORM; таблиці `users`, `conversations`, `messages`.
- **Rate limiting / auth (пізніше):** JWT/Session, ліміти на запити.

---

## 5. Перші кроки (практичний план)

### Крок 1 — Ініціалізація Turborepo

У корені:

```bash
npx create-turbo@latest
# або обери шаблон з Next.js, потім додай NestJS в apps/api
```

Перевір наявність:

- `turbo.json`
- `apps/*`
- `package.json` з workspaces

### Крок 2 — Додати NestJS як `apps/api`

```bash
npx @nestjs/cli new api
# потім перенеси в apps/api і підлаштуй package.json скрипти
```

У `turbo.json`: таски `dev`, `build`, `lint` для `web` і `api`.

### Крок 3 — Простий chat endpoint через OpenRouter

У `apps/api`:

- `OpenRouterModule` + `OpenRouterService` (інкапсуляція SDK).
- `ChatController`:

```ts
@Post("chat")
async chat(@Body() dto: ChatDto) {
  // dto.messages: [{ role: "user" | "assistant" | "system", content: string }]
  return this.chatService.getCompletion(dto.messages, dto.model);
}
```

У чат-сервісі — виклик OpenRouter SDK (див. вище).

### Крок 4 — Простий UI в Next.js

У `apps/web`:

- Сторінка `app/chat/page.tsx` (app router) або `pages/chat.tsx`.
- Локальний `state` для `messages`; при відправці — user у масив, `fetch` до `api/chat`, додати assistant.

---

## 6. Поступовий розвиток (що робити далі)

Коли базовий «echo» чат працює:

| Напрям           | Дії                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Стрімінг**     | Бекенд: `stream: true` у OpenRouter. Фронт: `ReadableStream` / `EventSource` / `fetch` зі стрімом. |
| **Історія**      | Postgres (Docker або локально), Prisma/TypeORM у `apps/api`, `conversationId`, `messages`.         |
| **Вибір моделі** | Dropdown з конфігу, `model` у `POST /chat`.                                                        |
| **Advanced**     | TanStack AI / LangChain поверх OpenRouter; мультимодальність; ролі, ліміти, платіжка.              |

---

## 7. З чого почати прямо зараз

1. **MVP:** одне вікно чату, одна базова модель (наприклад `openai/gpt-4.1-mini`), без реєстрації та БД.
2. **Підняти** Turborepo + Next.js + NestJS; переконатися, що `turbo dev` запускає обидва застосунки.
3. **OpenRouter на бекенді:** `OPENROUTER_API_KEY`, один метод, що повертає відповідь моделі на промпт.
4. **Простий UI:** одна сторінка, інпут, список повідомлень, підключення до API.

---

Коли будеш готовий до імплементації (ініціалізація Turborepo, конкретні файли, DTO, фронт чи бек) — напиши, який крок першим; можна детально розписати структуру файлів і сигнатури.
