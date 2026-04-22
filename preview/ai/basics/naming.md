---
title: Именование
scope: basics
keywords: [camelCase, kebab-case, PascalCase, имя файла, имя переменной, имя компонента, имя хука]
when: "Создание файлов, переменных, компонентов, хуков — выбор имени"
---
# Именование

Этот раздел описывает соглашения об именовании в проекте. Единые правила делают код предсказуемым и упрощают навигацию по проекту.

## Базовые правила

| Что              | Рекомендуется          |
| ---------------- | ---------------------- |
| Папки            | `kebab-case`           |
| Файлы            | `kebab-case`           |
| Переменные       | `camelCase`            |
| Константы        | `SCREAMING_SNAKE_CASE` |
| Классы           | `PascalCase`           |
| React-компоненты | `PascalCase`           |
| Хуки             | `useSomething`         |
| CSS классы       | `camelCase`            |
| Ключи enum       | `SCREAMING_SNAKE_CASE` |


## Именование файлов

Суффикс обозначает роль или тип файла. Пишется в единственном числе.
Формат: `name.<suffix>.ts`.

**Хуки**
- `use-name.hook.ts` — файл хука, функция именуется `useName`

**Корневые компоненты модулей**
- `.business.tsx` — бизнес-модуль (`business/`)
- `.infra.tsx` — инфраструктурный модуль (`infrastructure/`)
- `.ui.tsx` — UI-компонент (`ui/`)
- `.screen.tsx` — экран (`screens/`)
- `.widget.tsx` — виджет (`widgets/`)
- `.layout.tsx` — layout (`layouts/`)

**Логика**
- `.store.ts` — стор
- `.service.ts` — сервис

**Типы и контракты**
- `.type.ts` — типы и интерфейсы
- `.interface.ts` — интерфейсы
- `.enum.ts` — enum
- `.dto.ts` — внешние DTO
- `.schema.ts` — схемы валидации
- `.constant.ts` — константы
- `.config.ts` — конфигурация

**Утилиты**
- `.util.ts` — утилиты
- `.helper.ts` — вспомогательные функции
- `.lib.ts` — библиотечный код

**Тесты**
- `.test.ts` — тесты
- `.mock.ts` — моки

**Хорошо**
```text
business/
└── auth-by-email/
    ├── ui/
    │   └── login-form.tsx
    ├── hooks/
    │   └── use-auth.hook.ts
    ├── stores/
    │   └── auth.store.ts
    ├── types/
    │   └── auth.type.ts
    ├── auth-by-email.business.tsx
    └── index.ts
```

**Плохо**
```text
business/
└── authByEmail/
    ├── LoginForm.tsx
    ├── useAuth.ts
    ├── authStore.ts
    └── index.ts
```

## Булевы значения

- Использовать префиксы `is`, `has`, `can`, `should`.

**Хорошо**
```ts
const isReady = true;
const hasAccess = false;
const canSubmit = true;
const shouldRedirect = false;
```

**Плохо**
```ts
// Плохо: неясное булево значение без префикса.
const ready = true;
const access = false;
const submit = true;
```

## События и обработчики

- Обработчики начинать с `handle`.
- События и колбэки начинать с `on`.

**Хорошо**
```ts
const handleSubmit = () => { ... };
const onSubmit = () => { ... };
```

**Плохо**
```ts
// Плохо: неочевидное назначение имени.
const submitClick = () => { ... };
```

## Коллекции

- Для массивов использовать имена во множественном числе.
- Для словарей/мап — использовать суффиксы `ById`, `Map`, `Dict`.

**Хорошо**
```ts
const users = [];
const usersById = {} as Record<string, User>;
const userIds = ['u1', 'u2'];
const ordersMap = new Map<string, Order>();
const featureFlagsDict = { beta: true, legacy: false } as Record<string, boolean>;
```

**Плохо**
```ts
// Плохо: имя не отражает, что это коллекция.
const user = [];
// Плохо: словарь назван как массив.
const usersMap = [];
// Плохо: по имени непонятно, что это словарь.
const users = {} as Record<string, User>;
```
