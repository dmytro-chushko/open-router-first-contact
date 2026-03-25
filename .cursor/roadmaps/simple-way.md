# Простий шлях: OpenRouter SDK + MVP чату

Короткий план імплементації «простого варіанту» з офіційним `@openrouter/sdk`, узгоджений з [general.md](./general.md).

**MVP:** одне вікно чату, одна базова модель, **без стрімінгу**, без БД і без auth; API-ключ лише на бекенді.

---

## Що вже є в репозиторії

| Область | Стан |
|--------|------|
| Монорепо | Turborepo + pnpm, `dev` / `build` / `lint` / `check-types` |
| `apps/web` | Next.js, стартовий шаблон; сторінки чату немає |
| `apps/api` | NestJS, `GET /api` (hello); чат-модуля та OpenRouter немає |
| `@repo/api-contracts` | Контракт: `POST /chat`, body `messages` + опційно `model`, `temperature`; відповідь `{ message: { role: 'assistant', content } }` |
| Swagger | OpenAPI з контракту на `/api-docs`, глобальний префікс `api` |
| `packages/openrouter-client` | Не обов’язково для MVP — SDK достатньо в `apps/api` |

**Немає:** `@openrouter/sdk` у залежностях, інтеграції OpenRouter у коді.

**Увага:** `AppConfigService` використовується в `main.ts`, але має бути зареєстрований разом із `ConfigModule` у `AppModule`, інакше bootstrap може падати.

---

## Фаза A — Бекенд

1. **Залежності** — додати `@openrouter/sdk` у `apps/api`.

2. **Env** — `OPENROUTER_API_KEY` (і `.env.example` без секретів). Опційно: заголовки OpenRouter `HTTP-Referer`, `X-Title` через env або константи.

3. **Конфіг** — дефолтна модель (наприклад `openai/gpt-4.1-mini` або актуальний дешевий аналог з [openrouter.ai/models](https://openrouter.ai/models)). Вирівняти `PORT` / `API_URL` у `AppConfigService` з реальним портом Nest і з тим URL, який використовуватиме фронт.

4. **Bootstrap** — `ConfigModule.forRoot({ isGlobal: true })`, `AppConfigService` у `providers` (і `exports` за потреби).

5. **OpenRouterModule + OpenRouterService** — singleton-клієнт `new OpenRouter({ apiKey, defaultHeaders })`; метод `complete(messages, model?)` з `stream: false`, повернення тексту з `choices[0]?.message?.content`; обробка порожньої відповіді та помилок API.

6. **Chat endpoint** — `POST /api/chat` (узгодити з контрактом і Swagger). Валідація тіла через `chatCompletionBodySchema` з `@repo/api-contracts`. Відповідь у форматі `chatCompletionResponseSchema`.

7. **CORS** — `enableCors` для origin фронту (наприклад `http://localhost:3000`), якщо API на іншому порту.

---

## Фаза B — Фронтенд

8. **Env** — наприклад `NEXT_PUBLIC_API_URL` → базовий URL API з `/api`.

9. **Сторінка чату** — наприклад `app/chat/page.tsx`: локальний state повідомлень; Send → `POST .../chat` з `{ messages }`; відобразити відповідь assistant; стани loading / error.

10. **(Опційно)** Типи з Zod-інференсу `@repo/api-contracts` на клієнті.

---

## Фаза C — Перевірка

11. `pnpm dev`, перевірка Swagger `POST /chat`, повний цикл у UI.

---

## Після MVP (з general.md)

- Стрімінг (`stream: true`, SSE / fetch stream).
- Postgres, історія діалогів.
- Окремий пакет `openrouter-client`, якщо SDK потрібен не лише в API.
- Вибір моделі, rate limiting, auth.
