# SVG Sprites

## Назначение

Используй этот скил для работы с `@gromlab/svg-sprites`: первичной настройки, добавления и переиспользования иконок, генерации React-компонентов, подключения `SpriteViewer`, миграции legacy-конфигурации и диагностики ошибок.

Не навязывай проекту конкретную архитектуру каталогов. Сначала изучи существующие `package.json`, конфигурацию спрайта, используемый фреймворк, роутер и сборщик.

## Рабочий алгоритм

1. Определи существующий режим и не смешивай его API с другим режимом.
2. Для React выбери `react@vite` или `react@webpack` и открой соответствующий reference.
3. Для Next.js определи App Router или Pages Router, затем Turbopack или Webpack, и открой соответствующий reference.
4. Для существующего `svg-sprites.config.ts` с несколькими спрайтами используй legacy-документацию. Не мигрируй такой проект без явного запроса.
5. Изучи локальные scripts и добавляй генерацию перед `dev`, `build` и `typecheck`, если generated-файлы не хранятся в Git.
6. После изменения конфигурации или SVG запусти генерацию, затем доступную проверку типов или сборку проекта.

## Правила React и Next.js

- Используй локальный `svg-sprite.config.ts` и подходящий config helper: `defineReactSpriteConfig` или `defineNextSpriteConfig`.
- Не редактируй `generated/`, `index.ts`, `manifest.ts` и созданный генератором `.gitignore` вручную.
- Имена исходных SVG становятся допустимыми значениями prop `icon`; используй generated-компонент и его публичные типы вместо deep imports.
- Объединяй локальную папку и `inputFiles`, когда общая иконка нужна нескольким спрайтам. Не создавай копии одного SVG без необходимости.
- В Next.js generated-компонент можно использовать в Server Components, SSR и SSG. Не добавляй `'use client'` только ради иконки.
- Спрайт должен оставаться внешним asset сборщика: не переносить SVG path-данные в JavaScript и не класть generated-файл вручную в `public`.

## Цвета и трансформации

- По умолчанию генератор удаляет `width` и `height`, заменяет поддерживаемые `fill` и `stroke` на CSS-переменные и добавляет transitions.
- Для монохромной иконки сначала управляй `color`; для многоцветной используй `--icon-color-N`.
- Не обещай автоматическую замену цветов внутри внешних stylesheets, gradients, patterns, filters и значений `url(#...)` без проверки результата.
- CSS-переменные страницы работают при `<svg><use>`, но не проникают внутрь `<img>` и `background-image`.

## Превью

Для React и Next.js подключай `<SpriteViewer>` отдельной debug-страницей приложения. Передай ему manifests или lazy loaders спрайтов. Viewer поддерживает поиск, светлую и тёмную темы, настройку цветов и примеры React, SVG, IMG и CSS.

`SpriteViewer` является клиентским debug-инструментом и импортируется из `@gromlab/svg-sprites/react`; production-компоненты иконок от него не зависят.

## Диагностика

- Если имя иконки отсутствует в автодополнении, проверь входную папку и `inputFiles`, затем перезапусти генерацию.
- Если два файла имеют одинаковое имя иконки, устрани конфликт вместо выбора одного файла неявно.
- Если генератор отказывается перезаписывать файл, не удаляй защитный marker и не обходи writer: перенеси пользовательский файл или выбери другой каталог спрайта.
- Если asset не загружается, сначала проверь соответствие CLI mode реальному сборщику проекта и обработку generated SVG его asset pipeline.
- Если проект использует старый API, сверь установленную версию пакета и legacy reference перед изменениями.

## References

- [Основная документация и API](./references/README_RU.md)
- [React + Vite](./references/docs/ru/react-vite.md)
- [React + Webpack 5](./references/docs/ru/react-webpack.md)
- [Next.js App Router](./references/docs/ru/next-app.md)
- [Next.js Pages Router](./references/docs/ru/next-pages.md)
- [Legacy mode](./references/docs/ru/legacy.md)
- [Миграция с 0.1.x](./references/docs/ru/migration-1.md)
- [Программный API](./references/docs/ru/programmatic-api.md)
