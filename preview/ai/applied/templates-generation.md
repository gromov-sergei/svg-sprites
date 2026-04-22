---
title: Шаблоны и генерация кода
scope: applied
keywords: [шаблон, генерация, template, scaffold, plop, hygen, .templates]
when: "Генерация кода из шаблонов, создание новых шаблонов"
---
<!-- @formatter:off -->
::: v-pre

# Шаблоны и генерация кода

Как работают шаблоны, как их создавать, синтаксис переменных и как генерировать код с помощью расширения VS Code и CLI.

## Структура шаблонов

Все шаблоны лежат в `.templates/` в корне проекта. Каждая папка — отдельный шаблон.

```text
.templates/
├── component/                  # шаблон компонента
│   └── {{name.kebabCase}}/
│       ├── styles/
│       │   └── {{name.kebabCase}}.module.css
│       ├── types/
│       │   └── {{name.kebabCase}}.type.ts
│       ├── {{name.kebabCase}}.tsx
│       └── index.ts
└── store/                      # шаблон Zustand стора
    └── {{name.kebabCase}}/
        ├── {{name.kebabCase}}.store.ts
        ├── {{name.kebabCase}}.type.ts
        └── index.ts
```

## Синтаксис шаблонов

Переменные работают в именах файлов/папок и внутри файлов. Базовая переменная — `name`.

```text
{{variable}}
```

Модификаторы меняют регистр и формат записи:

```text
{{name.pascalCase}}          → MyButton
{{name.camelCase}}           → myButton
{{name.kebabCase}}           → my-button
{{name.snakeCase}}           → my_button
{{name.screamingSnakeCase}}  → MY_BUTTON
```

## Как создать новый шаблон

1. Создать папку в `.templates/` с именем шаблона (например `hook`).
2. Внутри разместить файлы и папки, используя `{{name}}` и модификаторы в именах и содержимом.
3. Шаблон сразу доступен и в расширении VS Code, и в CLI.

Пример — создание шаблона для хука:

```text
.templates/
└── hook/
    └── {{name.kebabCase}}/
        ├── {{name.kebabCase}}.hook.ts
        └── index.ts
```

```ts
// .templates/hook/{{name.kebabCase}}.hook.ts
export const {{name.camelCase}} = () => {

}
```

```ts
// .templates/hook/index.ts
export { {{name.camelCase}} } from './{{name.kebabCase}}.hook'
```

## Примеры шаблонов

### Шаблон компонента

```ts
// .templates/component/index.ts
export { {{name.pascalCase}} } from './{{name.kebabCase}}'
```

```ts
// .templates/component/types/{{name.kebabCase}}.type.ts
import type { HTMLAttributes } from 'react'

/**
 * Параметры {{name.pascalCase}}.
 */
export type {{name.pascalCase}}Params = {}

/** HTML-атрибуты корневого элемента. */
type RootAttrs = HTMLAttributes<HTMLDivElement>

export type {{name.pascalCase}}Props = RootAttrs & {{name.pascalCase}}Params
```

```tsx
// .templates/component/{{name.kebabCase}}.tsx
import cl from 'clsx'
import type { {{name.pascalCase}}Props } from './types/{{name.kebabCase}}.type'
import styles from './styles/{{name.kebabCase}}.module.css'

/**
 * {{name.pascalCase}}.
 */
export const {{name.pascalCase}} = (props: {{name.pascalCase}}Props) => {
  const { children, className, ...htmlAttr } = props

  return (
    <div {...htmlAttr} className={cl(styles.root, className)}>
      {children}
    </div>
  )
}
```

```css
/* .templates/component/styles/{{name.kebabCase}}.module.css */
.root {

}
```

## Генерация через VS Code

Template File Generator | gromlab ([Marketplace](https://marketplace.visualstudio.com/items?itemName=gromlab.vscode-templateFileGenerator), [Open VSX](https://open-vsx.org/extension/gromlab/vscode-templateFileGenerator)) — расширение для генерации файлов и папок из шаблонов через интерфейс редактора.

1. ПКМ на целевой папке в проводнике VS Code.
2. **Generate from template** → выбрать шаблон.
3. Ввести имя (например `button`) — расширение подставит его во все переменные `{{name}}`.

## Генерация через CLI

[@gromlab/create](https://www.npmjs.com/package/@gromlab/create) — CLI для генерации из тех же шаблонов. Используется через npx, глобальная установка не требуется.

```bash
npx @gromlab/create <шаблон> <имя> <путь>
```

| Команда | Что создаёт |
|---|---|
| `npx @gromlab/create component button src/ui` | Компонент |
| `npx @gromlab/create business auth src/business` | Бизнес-модуль |
| `npx @gromlab/create widget header src/widgets` | Виджет |
| `npx @gromlab/create layout admin src/layouts` | Layout |
| `npx @gromlab/create screen home src/screens` | Экран |
| `npx @gromlab/create store auth src/business/auth/stores` | Стор |

:::

## Какие модули генерируются из шаблонов

| Модуль | Слой | Шаблон |
|---|---|---|
| Компонент | `ui/` | `component` |
| Бизнес-модуль | `business/` | `business` |
| Виджет | `widgets/` | `widget` |
| Layout | `layouts/` | `layout` |
| Экран | `screens/` | `screen` |
| Стор | `stores/` | `store` |

## Когда создавать новый шаблон

- Повторяющаяся структура появляется больше одного раза.
- Существующий шаблон не покрывает нужный тип модуля.

