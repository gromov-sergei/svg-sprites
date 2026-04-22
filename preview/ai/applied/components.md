---
title: Компоненты
scope: applied
keywords: [компонент, props, jsx, ui, clsx, cl, React, FC]
when: "Создание или редактирование React-компонентов: структура, пропсы, стили"
---
# Компоненты

Правила написания React-компонентов: файловая структура модуля, типизация пропсов, документирование и реализация. Раздел охватывает компоненты всех слоёв — от `shared/ui` до `screens`.

Архитектурные слои и их назначение описаны в разделе [Архитектура](/basics/architecture).


## Правила организации

1. Один компонент — один файл.
2. Компонент не содержит бизнес-логики — логика и сайд-эффекты выносятся в хуки или сторы.
3. Дочерние компоненты размещаются в сегменте `ui/` и подчиняются тем же правилам структуры.
4. Публичный API модуля — только `index.ts`. Прямые импорты внутренних файлов запрещены.

## Базовая структура компонента

Минимальный набор файлов: компонент, стили, типы и публичный экспорт.

```text
container/
├── styles/
│   └── container.module.css
├── types/
│   └── container.type.ts
├── container.ui.tsx
└── index.ts
```

## Именования

- Имя корневого css класса всегда `.root`
- Тип пропсов именуется `{ComponentName}Props`.
- Тип пользовательских параметров именуется `{ComponentName}Params`.

## Типизация

Структура типов компонента показана в [примере](#пример). Ниже — обоснования ключевых решений.

- **`type` вместо `interface`** — гибче для пропсов: поддерживает union, intersection, mapped types. Declaration merging пропсам не нужно.
- **Без `FC`** — неявно добавляет `children`, усложняет дженерики, не даёт преимуществ перед аннотацией параметра.
- **Типы в `types/`, а не в `.tsx`** — предотвращает циклические зависимости (компонент импортирует хук, хук импортирует тип из компонента) и разделяет ответственность: `.tsx` для рендера, `.type.ts` для данных.
- **Без возвращаемого типа** — TypeScript выводит из JSX. Осознанное исключение из [базового правила](/basics/typing).

## Реализация

- Пропсы деструктурируются в теле компонента, не в параметрах.
- Порядок: пользовательские → системные (`children`, `className`) → `...htmlAttr`.
- `className` объединяется с корневым классом через `cl()`: `cl(styles.root, className)`.
- `...htmlAttr` прокидывается на корневой элемент.

## Пример

`container/types/container.type.ts`

```ts
import type { HTMLAttributes } from 'react'

/**
 * Параметры компонента Container.
 */
export type ContainerParams = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type ContainerProps = RootAttrs & ContainerParams
```

`container/styles/container.module.css`

```css
.root {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}
```

`container/container.ui.tsx`

```tsx
import cl from 'clsx'
import type { ContainerProps } from './types/container.type'
import styles from './styles/container.module.css'

/**
 * Контейнер с адаптивной максимальной шириной.
 *
 * Используется для:
 *  - обёртки контента страниц с ограничением ширины
 *  - центрирования блоков в лейауте
 */
export const Container = (props: ContainerProps) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
```

`container/index.ts`

```ts
export { Container } from './container.ui'
```

## Дочерние компоненты

Если модулю нужны внутренние подкомпоненты — генерировать их из шаблона `component` в папку `ui/` внутри родительского модуля. Дочерние компоненты не экспортируются через `index.ts` родителя.
