---
title: Типизация
scope: basics
keywords: [type, interface, generic, any, unknown, enum, типизация, пропсы]
when: "Типизация кода: выбор type vs interface, работа с generic, запрет any"
---
# Типизация

Этот раздел описывает правила типизации: как типизировать компоненты, функции и работу с `any`/`unknown`.

## Общие правила

- Указывать типы для параметров компонентов, возвращаемых значений и параметров функций.
- Предпочитать `type` для описания сущностей и `interface` для расширяемых контрактов.
- Избегать `any` и `unknown` без необходимости.
- Не использовать `ts-ignore`, кроме крайних случаев с явным комментарием причины.

## Функции

- Для публичных функций указывать возвращаемый тип.
- Не полагаться на неявный вывод для важных API.

**Хорошо**
```ts
export const formatPrice = (value: number): string => {
  return `${value} ₽`;
};
```

**Плохо**
```ts
// Плохо: нет явного возвращаемого типа.
export const formatPrice = (value: number) => {
  return `${value} ₽`;
};
```

## Работа с any/unknown

- `any` использовать только для временных заглушек.
- `unknown` сужать через проверки перед использованием.

**Хорошо**
```ts
const parse = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  return '';
};
```

**Плохо**
```ts
// Плохо: any отключает проверку типов.
const parse = (value: any) => value;
```
