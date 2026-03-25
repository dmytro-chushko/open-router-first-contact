# Roadmap: Husky у Turborepo + скрипти перевірки та фіксу стилю

Живий чеклист для монорепо на **pnpm** + **Turborepo**. Поєднує рекомендації з установки Husky (див. також транскрипт чату про «як правильно встановити husky на turborepo») і прийняту в цьому проєкті організацію **`precheck` / `fix` / Prettier / ESLint**.

---

## Фаза 1. Встановлення Husky (корінь репо)

### 1.1. Де ставити

- Лише в **корені** монорепо: там же `package.json`, `pnpm-workspace.yaml`, `turbo.json` і **корінь `.git`**.
- **Не** дублювати Husky в `apps/*` чи `packages/*`.

### 1.2. Команди

```bash
cd <root-monorepo>
pnpm add -D husky
pnpm exec husky init
```

### 1.3. Скрипт `prepare`

Після `husky init` у кореневому `package.json` має бути:

```json
"scripts": {
  "prepare": "husky"
}
```

**Навіщо:** після `pnpm install` у всіх, хто клонує репо, підтягуються git-hooks.

### 1.4. Підводний камінь після `husky init`

Шаблон `.husky/pre-commit` часто містить **`pnpm test`**. Якщо в корені **немає** скрипта `test`, коміт падає з `ERR_PNPM_NO_SCRIPT`.

**Дія:** замінити вміст хука на цільову команду (див. фазу 3) — наприклад **`pnpm precheck`**.

---

## Фаза 2. Організація скриптів у корені (перевірка vs фікс)

Розділяти **два режими**:

| Скрипт | Призначення |
|--------|-------------|
| **`precheck`** | Лише **перевірка**: нічого не записує на диск. Для Husky / швидкої валідації перед комітом. |
| **`fix`** | **Фікс:** Prettier з `--write` + ESLint з `--fix` по всьому монорепо через Turbo. |

### 2.1. Рекомендовані кореневі скрипти (як у поточному проєкті)

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,md}\"",
    "fix": "pnpm format && turbo run lint -- --fix",
    "precheck": "pnpm format:check && pnpm lint",
    "prepare": "husky"
  }
}
```

**Чому так:**

- **`format`** vs **`format:check`:** у хуку не використовувати `--write`, інакше файли зміняться під час коміту, а частина правок може **не потрапити в staged** без повторного `git add`.
- **`fix`:** `turbo run lint -- --fix` передає `--fix` у `pnpm run lint` у кожному пакеті; ESLint дописує прапорець до команди.
- **`precheck`:** `pnpm lint` без `--fix` у **скриптах пакетів** — інакше «перевірка» теж переписуватиме файли.

### 2.2. Скрипти `lint` у workspace

- У кожному пакеті **`lint`** — **без `--fix`** (чиста перевірка).
- Автофікс лише через кореневий **`pnpm fix`** (Turbo + `--fix`).

**Виняток, який ламав би схему:** якщо в якомусь пакеті залишити `eslint ... --fix` у дефолтному `lint`, то **`pnpm precheck` не буде суто перевіркою**.

### 2.3. Опційно: типи в pre-commit

Якщо потрібно ганяти типи з корня:

```json
"precheck": "pnpm format:check && pnpm lint && pnpm check-types"
```

(`check-types` зазвичай уже є як `turbo run check-types`.)

---

## Фаза 3. Підключення Husky до `precheck`

### 3.1. `.husky/pre-commit` (Husky 9+)

Мінімально — один рядок:

```sh
pnpm precheck
```

У старіших прикладах зустрічається обгортка з `husky.sh` і виклик **`pnpm exec turbo run lint`** — це валідний альтернативний стиль, але тоді дублюється логіка з `precheck`. Краще **одне джерело правди** — скрипт `precheck` у `package.json`.

### 3.2. Альтернатива з Turbo напряму (з транскрипту)

Можна було б у хуку викликати, наприклад:

```sh
pnpm exec turbo run lint check-types
```

Для цього проєкту обрано **`pnpm precheck`**, щоб у одному місці були і Prettier check, і lint (і за потреби типи).

---

## Фаза 4. Опціонально: швидше на великих репо

- **lint-staged** у `pre-commit`: ESLint / Prettier лише по **staged** файлах; усередині можна викликати `eslint` або обмежений `turbo`.
- Корисно, коли повний `turbo run lint` по всьому монорепо занадто повільний.

---

## Фаза 5. CI та Windows

### 5.1. CI

- Git-hooks **не виконуються** в CI — там окремо ганяти `pnpm precheck`, `pnpm build`, `turbo run lint` тощо у pipeline.

### 5.2. Windows

- Husky 9+ очікує нормальний Git; за проблем перевірити `git config core.hooksPath`.
- У файлах `.husky/*` бажані **LF** line endings, щоб уникнути дивних помилок у shell.

---

## Фаза 6. Щоденний флоу розробника

1. Після змін за потреби: **`pnpm fix`** (формат + автофікс лінтів).
2. **`git add`** (якщо `fix` щось змінив).
3. **`git commit`** — спрацює **`pnpm precheck`** (лише перевірка).
4. Якщо `precheck` падає — виправити вручну або знову **`pnpm fix`**, потім повторити кроки 2–3.

---

## Короткий чеклист «з нуля»

- [ ] `pnpm add -D husky` у корені
- [ ] `pnpm exec husky init`
- [ ] Є `"prepare": "husky"` у кореневому `package.json`
- [ ] Є `format`, `format:check`, `lint`, `fix`, `precheck` (або еквівалентна політика)
- [ ] У workspace **`lint` без `--fix`**
- [ ] `.husky/pre-commit` → **`pnpm precheck`** (не дефолтний `pnpm test`, якщо немає `test`)
- [ ] Перевірка: `pnpm precheck` проходить локально
- [ ] У CI налаштовано ті ж перевірки, що критичні для merge

---

*Останнє узгодження з репо: кореневі скрипти як у `package.json` на момент створення цього файлу.*
