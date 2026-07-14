## Что делает пакет

`@gromlab/svg-sprites` — CLI-генератор SVG-спрайтов для пользовательских SVG-файлов. Пакет не содержит собственного набора иконок: он собирает SVG проекта во внешний sprite asset, создаёт нативный типизированный Web Component для standalone bundler modes и React-компонент для React/Next.js.

Пакет рассчитан на несколько независимых спрайтов в одном проекте. Каждый явно выбранный config-файл или config-less каталог описывает один спрайт и получает собственные:

- SVG asset;
- mode-specific manifest data;
- для bundler modes — типы имён и production entry `.svg-sprite/index.js`;
- для `standalone@vite`/`standalone@webpack` — нативный Web Component с явной функцией регистрации;
- только для React/Next.js — React-компонент;
- для bare `standalone` — deployment-neutral JSON manifest без публичного URL.

Количество и расположение каталогов определяет проект. Например, `name: 'file-manager'` создаёт `FileManagerIcon`, а другой каталог с `name: 'navigation'` создаст отдельный `NavigationIcon`. Имена `FileManagerIcon` и `fileManagerIconNames` ниже являются примерами API одного из возможных спрайтов, а не фиксированными экспортами пакета.

Generated production runtime и declarations не импортируют `@gromlab/svg-sprites`. Генерация работает через `npx --package` с зафиксированной версией без добавления package в проект. Устанавливай его как development dependency только для Viewer, package-типов config или программного API.
