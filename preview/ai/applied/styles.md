---
title: Стили
scope: applied
keywords: [css, postcss, модули, css modules, токены, медиа-запросы, вложенность, класс]
when: "Стилизация: CSS Modules, PostCSS, переменные, медиа-запросы"
---
# Стили

Раздел описывает правила написания CSS: PostCSS Modules, вложенность, медиа-запросы, переменные, форматирование.

## Общие правила

- Только **PostCSS** и **CSS Modules** для кастомной стилизации.
- Подход **Mobile First** — стили пишутся от мобильных к десктопу.
- Именование классов — `camelCase` (`.root`, `.buttonNext`, `.itemTitle`).
- Модификаторы — отдельный класс с `_`, применяется через `&._modifier`.

**Хорошо**
```css
.submitButton {
  padding: 8px 16px;

  &._disabled {
    opacity: 0.5;
  }
}
```

**Плохо**
```css
/* Плохо: kebab-case и вложенный элемент вместо отдельного класса. */
.submit-button {
  padding: 8px 16px;

  &__icon {
    margin-right: 8px;
  }
}
```

## Вложенность

- Вложенность селекторов запрещена.
- Исключения:
  - Псевдоклассы: `&:hover`, `&:active`, `&:focus`, `&:disabled` и т.д.
  - Псевдоэлементы: `&::before`, `&::after`.
  - Медиа-запросы: `@media`.
  - Модификаторы: `&._active`, `&._disabled`.
- Каждый вложенный блок отделяется пустой строкой от предыдущих свойств.

**Хорошо**
```css
.card {
  padding: 16px;
  background-color: var(--color-bg);

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &::after {
    content: '';
    display: block;
  }

  &._highlighted {
    border-color: var(--color-primary);
  }

  @media (--md) {
    padding: 24px;
  }
}

.cardTitle {
  font-size: 16px;

  @media (--md) {
    font-size: 20px;
  }
}
```

**Плохо**
```css
/* Плохо: вложенность селекторов, нет пустых строк между блоками. */
.card {
  padding: 16px;
  .cardTitle {
    font-size: 16px;
  }
  &:hover {
    background-color: var(--color-bg-hover);
  }
}
```

## Медиа-запросы

- Только **Custom Media Queries**: `@media (--md) {}`.
- Запрещены произвольные breakpoints: `@media (min-width: 768px)`.
- `@media` пишется только **внутри** селектора.
- Запрещено писать `@media` на верхнем уровне с селекторами внутри.

**Хорошо**
```css
.sidebar {
  display: none;

  @media (--md) {
    display: block;
  }
}

.sidebarTitle {
  font-size: 14px;

  @media (--md) {
    font-size: 18px;
  }
}
```

**Плохо**
```css
/* Плохо: @media на верхнем уровне с селекторами внутри. */
@media (--md) {
  .sidebar {
    display: block;
  }

  .sidebarTitle {
    font-size: 18px;
  }
}

/* Плохо: произвольный breakpoint вместо custom media. */
.sidebar {
  @media (min-width: 992px) {
    display: block;
  }
}
```

## CSS-переменные

- Цвета (`--color-*`), отступы (`--space-*`), скругления (`--radius-*`) определяются в `app/styles/variables.css` через `:root`.
- Файл переменных подключается один раз в корневом layout/entry point — после этого переменные доступны глобально через каскад.
- Не дублировать магические значения в компонентах.

**Хорошо**
```css
/* app/styles/variables.css */
:root {
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-bg-hover: #f5f5f5;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --radius-1: 4px;
  --radius-2: 8px;
}
```

```css
/* компонент */
.card {
  padding: var(--space-3);
  border-radius: var(--radius-2);
  background-color: var(--color-bg);
}
```

**Плохо**
```css
/* Плохо: магические значения вместо переменных. */
.card {
  padding: 12px;
  border-radius: 8px;
  background-color: #ffffff;
}
```

## Custom Media

- Breakpoints определяются через Custom Media Queries в `app/styles/media.css`.
- Custom media подключаются глобально через конфиг PostCSS (плагин `postcss-custom-media`) — не импортировать в файлы стилей.

```css
/* app/styles/media.css */
@custom-media --sm (min-width: 36em);
@custom-media --md (min-width: 62em);
@custom-media --lg (min-width: 82em);
```

## Импорт стилей

- Стили компонента импортируются только внутри своего компонента.
- Запрещено импортировать стили одного компонента в другой.
- Custom media не импортируются в файлы стилей — они подключаются глобально через конфиг PostCSS.

## Форматирование

- Пустая строка между селекторами верхнего уровня.
- Пустая строка перед каждым вложенным блоком (медиа, псевдокласс, модификатор).

**Хорошо**
```css
.userBar {
  display: none;
  color: var(--color-text);

  @media (--md) {
    display: flex;
  }
}

.userBarButton {
  background-color: var(--color-bg);

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &._active {
    background-color: var(--color-primary);
  }
}
```

**Плохо**
```css
/* Плохо: нет пустых строк между селекторами и вложенными блоками. */
.userBar {
  display: none;
  color: var(--color-text);
  @media (--md) {
    display: flex;
  }
}
.userBarButton {
  background-color: var(--color-bg);
  &:hover {
    background-color: var(--color-bg-hover);
  }
  &._active {
    background-color: var(--color-primary);
  }
}
```

## Единицы измерения

- `px` — основная единица измерения.
- Остальные (`em`, `rem`, `%`, `vh`/`vw`) — допускаются по необходимости дизайна.

## Порядок CSS-свойств

В стилях рекомендуется придерживаться логического порядка свойств:

1. Позиционирование (`position`, `top`, `left`, `z-index`).
2. Блочная модель (`display`, `width`, `height`, `margin`, `padding`).
3. Оформление (`background`, `border`, `box-shadow`, `border-radius`).
4. Текст (`font`, `color`, `text-align`, `line-height`).
5. Прочее (`transition`, `animation`, `opacity`, `cursor`).

## Комментарии

- Желательно не писать комментарии в CSS.
- Исключение — нетривиальные хаки и обходные решения, к которым стоит оставить пояснение.

## Приоритет стилизации

Основной UI-фреймворк проекта — **Mantine**. При стилизации компонентов придерживаться следующего приоритета:

1. **Mantine-компоненты и их пропсы** — в первую очередь использовать встроенные возможности Mantine (пропсы, `classNames`, `styles`).
2. **Глобальные CSS-токены** (`--color-*`, `--space-*`, `--radius-*`) — для значений, которые не покрываются Mantine.
3. **PostCSS Modules** — когда Mantine не покрывает задачу и нужна кастомная стилизация.

## Что запрещено

- **Инлайн-стили** — использование атрибута `style` в компонентах строго запрещено.
- **Магические значения** — произвольные цвета, отступы и скругления запрещены, использовать токены.
- **Глобальные стили** вне `app/styles/` запрещены.
