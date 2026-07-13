## Что делает пакет

`@gromlab/svg-sprites` — CLI-генератор SVG-спрайтов для пользовательских SVG-файлов. Пакет не содержит собственного набора иконок: он собирает SVG проекта во внешний кешируемый sprite asset и для React/Next.js создаёт типизированный компонент, список допустимых имён и debug manifest.

Пакет рассчитан на несколько независимых спрайтов в одном проекте. Каждый явно выбранный config-файл или config-less каталог описывает один спрайт и получает собственные:

- SVG asset;
- типы имён иконок;
- React-компонент;
- production entry `.svg-sprite/index.js` с `.d.ts`;
- debug entry `.svg-sprite/svg-sprite.manifest.js` с `.d.ts`.

Количество и расположение каталогов определяет проект. Например, `name: 'file-manager'` создаёт `FileManagerIcon`, а другой каталог с `name: 'navigation'` создаст отдельный `NavigationIcon`. Имена `FileManagerIcon` и `fileManagerIconNames` ниже являются примерами API одного из возможных спрайтов, а не фиксированными экспортами пакета.

Generated production-компоненты не импортируют `@gromlab/svg-sprites` во время выполнения. Устанавливай пакет как development dependency, чтобы config helpers и локальный CLI использовали версию из lockfile проекта.
