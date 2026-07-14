## Что делает пакет

`@gromlab/svg-sprites` — CLI-генератор SVG-спрайтов для пользовательских SVG-файлов. Пакет не содержит собственного набора иконок: он собирает SVG проекта во внешний sprite asset, поддерживает standalone-проекты и для React/Next.js создаёт типизированный компонент.

Пакет рассчитан на несколько независимых спрайтов в одном проекте. Каждый явно выбранный config-файл или config-less каталог описывает один спрайт и получает собственные:

- SVG asset;
- mode-specific manifest data;
- для bundler modes — типы имён и production entry `.svg-sprite/index.js`;
- только для React/Next.js — React-компонент;
- для bare `standalone` — deployment-neutral JSON manifest без публичного URL.

Количество и расположение каталогов определяет проект. Например, `name: 'file-manager'` создаёт `FileManagerIcon`, а другой каталог с `name: 'navigation'` создаст отдельный `NavigationIcon`. Имена `FileManagerIcon` и `fileManagerIconNames` ниже являются примерами API одного из возможных спрайтов, а не фиксированными экспортами пакета.

Generated production runtime не импортирует `@gromlab/svg-sprites` во время выполнения. Устанавливай пакет как development dependency, чтобы config helpers и локальный CLI использовали версию из lockfile проекта.
