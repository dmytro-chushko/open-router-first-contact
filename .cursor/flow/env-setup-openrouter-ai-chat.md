## Мета

Цей документ описує єдиний флоу налаштування робочого середовища для pet‑проєкту:

- **Монорепо на Turborepo**
- **Next.js (FSD, Tailwind, shadcn/ui)** як фронтенд
- **NestJS** як бекенд
- **Спільний контракт і клієнти на TS‑REST**
- **Інтеграція з OpenRouter** для роботи з AI‑моделями

Документ призначений бути живим — його можна й потрібно доповнювати в міру розвитку проєкту.

---

## 1. Базова структура монорепо (Turborepo)

### 1.1. Вихідні умови

- Встановлений **Node.js ≥ 18**
- Встановлений **pnpm** (використовується як пакетний менеджер для монорепо)
- Репозиторій вже ініціалізований як Turborepo за допомогою `npx create-turbo@latest`

Поточна структура (спрощено):

- `apps/web` – Next.js app (фронт)
- `apps/docs` – Next.js app (документація/пісочниця)
- `packages/ui` – спільні UI‑компоненти
- `packages/eslint-config`, `packages/typescript-config` – спільні конфіги

> Цей документ **не запускає команди**, а лише фіксує флоу, як треба робити.

---

## 2. Фронтенд: Next.js + FSD + Tailwind + shadcn/ui

### 2.1. Загальна ідея фронта

- Базова платформа — `apps/web` (Next.js 16, App Router).
- Архітектура — **Feature‑Sliced Design (FSD)**:
  - `app/` – точки входу/роутинг
  - `shared/` – базові UI‑компоненти, утиліти, api‑клієнти
  - `entities/`, `features/`, `widgets/`, `pages/` – як класичний FSD‑поділ
- Стильова система:
  - **Tailwind CSS** як утилітарні класи
  - **shadcn/ui** як готовий компонентний набір поверх Tailwind

### 2.2. Налаштування Tailwind для `apps/web` (план дій)

1. **Перевірити наявність Tailwind**
   - Переконатися, чи є:
     - `tailwind.config.{js,ts,cjs}`
     - `postcss.config.{js,ts,cjs}`
     - імпорт директив `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` в `app/globals.css`.
   - Якщо цього немає — встановити Tailwind згідно офіційного гайду Next.js + Tailwind:
     - Додати Tailwind та PostCSS як dev‑залежності.
     - Створити `tailwind.config.ts` з коректним `content` для App Router + monorepo.
     - Оновити `app/globals.css` з Tailwind‑директивами.

2. **Єдиний стиль для всього монорепо**
   - За потреби винести Tailwind‑конфіг у спільний пакет (наприклад, `packages/tailwind-config`) і використовувати `extends` у `apps/web/tailwind.config.ts`.

### 2.3. Інтеграція shadcn/ui (план дій)

1. Ініціалізувати shadcn/ui у `apps/web`:
   - Встановити CLI `shadcn/ui` як dev‑залежність.
   - Запустити ініціалізацію (вказати:
     - шлях до компоненти (`app` vs `src`),
     - тип Tailwind‑конфіга (TS/JS),
     - використання alias’ів за потреби).
2. Обрати базовий набір компонентів (Button, Input, Dialog, ScrollArea, Avatar тощо) і згенерувати їх у дерево `apps/web` (частіше за все в `app/components` або `components/ui`).
3. Відразу зафіксувати:
   - тему (light/dark),
   - систему типографіки,
   - токени кольорів, якщо треба — через CSS‑змінні у `globals.css`.

### 2.4. FSD‑структура для чату (високорівневий план)

- `app/(main)/chat/page.tsx` – сторінка чату.
- `pages/chat` (як FSD‑sliced модуль) – логіка та збірка:
  - `pages/chat/ui` – layout сторінки чату.
  - `pages/chat/model` – локальний стейт (наприклад, client state з історією).
- `features/send-message` – інпут + кнопка надсилання.
- `entities/message` – моделі/типи повідомлень, UI для повідомлення.
- `shared/api/openrouter` – клієнтський обгортник для бекенду / TS‑REST.

---

## 3. Бекенд: NestJS у монорепо

### 3.1. Розміщення бекенду

Плануємо мати:

- `apps/api` – NestJS‑застосунок.

Ключові моменти:

- Підняти NestJS у монорепо як окремий app:
  - або створити його через Nest CLI і перенести в `apps/api`,
  - або ініціалізувати прямо в каталозі `apps/api`.
- Синхронізувати `tsconfig` з `@repo/typescript-config`.
- Додати скрипти у кореневий `package.json`/`turbo.json` для `dev`, `build`, `lint`, `check-types` по `apps/api`.

### 3.2. Базова структура NestJS‑бекенду

Планова структура:

- `apps/api/src/app.module.ts`
- `apps/api/src/chat/chat.module.ts`
- `apps/api/src/chat/chat.controller.ts` – ендпоінти `/chat`
- `apps/api/src/chat/chat.service.ts` – виклики до OpenRouter
- `apps/api/src/openrouter/openrouter.module.ts`, `openrouter.service.ts` – інкапсульований клієнт OpenRouter
- Пізніше:
  - модуль для роботи з БД (Postgres через Prisma/TypeORM),
  - модуль авторизації, лімітів тощо.

---

## 4. Спільні контракти та клієнти на TS‑REST

### 4.1. Загальна ідея

Використовуємо **TS‑REST** для:

- єдиного контракту між фронтом (Next.js) і беком (NestJS),
- генерації типобезпечних клієнтів на фронті.

### 4.2. Де зберігати контракти

План:

- Створити спільний пакет, наприклад `packages/api-contracts`:
  - всередині — `contract.ts`, де описаний TS‑REST контракт (router’и, схеми запитів/відповідей).
- Пакет використовується:
  - у NestJS (`apps/api`) для побудови ендпоінтів через `@ts-rest/nest`,
  - у Next.js (`apps/web`) для побудови клієнтів через `@ts-rest/react-query` або `@ts-rest/core`.

### 4.3. Базовий контракт для чату (концепція)

Приклад того, що має бути в контракті (спрощено, без реального коду тут):

- router `chat` з методом:
  - `POST /chat`:
    - body: масив message’ів (`role`, `content`),
    - опційно: `model`, `temperature`, інші параметри,
    - response: AI‑відповідь + можливо метадані.

Цей контракт використовуватиметься і на бекенді, і на фронті.

---

## 5. Інтеграція з OpenRouter

### 5.1. API‑ключі та змінні середовища

- Додати в корінь монорепо `.env` (і `.env.example`):
  - `OPENROUTER_API_KEY=sk-or-...`
- Забезпечити, щоб:
  - бекенд (`apps/api`) читав ключ лише з env (не хардкодити),
  - `.gitignore` коректно ігнорував `.env`.

### 5.2. Клієнт OpenRouter

2 варіанти:

1. **Через SDK `@openrouter/sdk`**:
   - Створити або спільний пакет (`packages/openrouter-client`), або локальний сервіс у `apps/api`.
   - Інкапсулювати:
     - ініціалізацію клієнта,
     - параметри (model, headers),
     - методи на кшталт `sendChatCompletion(messages, model, options)`.

2. **Через `fetch`/`axios` на `https://openrouter.ai/api/v1/chat/completions`**:
   - Створити тонкий HTTP‑клієнт, налаштувати всі необхідні хедери (включно з опційними `HTTP-Referer`, `X-Title`).

### 5.3. Потік запиту чату

Плановий флоу:

1. Фронтенд (`apps/web`) викликає TS‑REST‑клієнт `chat.send`, передаючи:
   - поточну історію діалогу,
   - параметри моделі (якщо користувач обрав модель).
2. NestJS‑бекенд (`apps/api`) через TS‑REST отримує запит на `POST /chat`.
3. Сервіс `ChatService` формує запит до OpenRouter:
   - збирає `messages` у форматі OpenRouter (role/content),
   - додає модель за замовчуванням (наприклад, `openai/gpt-4.1-mini`) або ту, що прийшла з фронта.
4. Відповідь OpenRouter повертається на бек, трансформується у формат TS‑REST‑контракту і відправляється на фронт.
5. Фронтенд оновлює UI (історію чату) з урахуванням нової відповіді.

> Пізніше можна додати стрімінг (SSE/Fetch streaming) замість разового респонсу.

---

## 6. Організація Turborepo‑тасків

### 6.1. Кореневі скрипти (вже є)

- `pnpm run dev` – `turbo run dev` для всіх apps/packages.
- `pnpm run build` – `turbo run build`.
- `pnpm run lint` – `turbo run lint`.
- `pnpm run check-types` – `turbo run check-types`.

### 6.2. Узгоджені таски в apps

Ціль — щоб:

- `apps/web` мало:
  - `dev` – запуск Next.js,
  - `build` – збірка,
  - `lint`, `check-types`.
- `apps/api` мало:
  - аналогічні таски (`dev`, `build`, `lint`, `check-types`), які можна викликати через Turbo.

---

## 7. Порядок розгортання (рекомендований флоу)

1. **Монорепо вже є**:
   - Переконатися, що базовий `pnpm install` пройшов успішно.
   - Перевірити, що `pnpm run dev` запускає `apps/web` та `apps/docs`.

2. **Фронтенд‑блок**:
   - Перевірити/налаштувати Tailwind у `apps/web`.
   - Ініціалізувати shadcn/ui для `apps/web`.
   - Започаткувати FSD‑структуру (створити базові каталоги `shared`, `entities`, `features`, `widgets`, `pages`).

3. **Бекенд‑блок**:
   - Додати `apps/api` з NestJS (якщо ще немає).
   - Налаштувати сумісність TypeScript‑конфігів з монорепо.

4. **TS‑REST**:
   - Створити пакет `packages/api-contracts` з TS‑REST‑контрактами для `/chat`.
   - Підключити контракт у NestJS та Next.js.

5. **OpenRouter**:
   - Додати `.env` з `OPENROUTER_API_KEY`.
   - Реалізувати OpenRouter‑клієнт на бекенді.
   - Прокинути перший робочий `/chat` endpoint по TS‑REST.

6. **UI‑рівень чату**:
   - Реалізувати сторінку чату в FSD‑стилі з компонентами shadcn/ui.
   - Підключити TS‑REST‑клієнт до бекенду й отримати першу відповідь від моделі.

---

## 8. Нотатки для подальшого розвитку

- **PostgreSQL + збереження історії**:
  - Додати БД (наприклад, через Docker Compose).
  - Підключити ORM (Prisma/TypeORM) у `apps/api`.
  - Зберігати `conversations` і `messages`.

- **Мультимодельний режим**:
  - Додати можливість вибирати модель (через UI) з наперед заданого списку (`MODEL_PRESETS`).
  - Прокинути вибір до бекенду й OpenRouter‑клієнта.

- **Стрімінг та продакшн‑hardening**:
  - Реалізувати стрімінг відповідей від OpenRouter.
  - Додати rate limiting, auth, логування, observability.

---

## 9. Як оновлювати цей документ

- Будь-які зміни у флоу (нові пакети, зміна структури, нові сервіси) варто:
  - описувати окремими підрозділами,
  - додавати до відповідних розділів (фронт, бек, TS‑REST, OpenRouter),
  - тримати цей файл в актуальному стані як **єдине джерело правди про архітектуру та сетап**.

