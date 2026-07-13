## Диагностика

Сопоставь симптом с проверкой и исправляй первопричину:

| Симптом | Вероятная причина | Действие |
|---|---|---|
| `Missing sprite config file or module directory` | Не передан позиционный путь | Передай один config-файл либо каталог для config-less запуска. |
| `Expected one config file or module directory` | Передано несколько путей | Создай отдельную команду на каждый спрайт и объедини scripts. |
| `Sprite mode is required` | Mode отсутствует и в config, и в CLI | Добавь `mode` в объект или передай полный `--mode`. |
| `Unsupported sprite config extension` | Передан файл не `.ts`, `.js` или `.json` | Используй поддерживаемый формат config-файла. |
| `Input directory does not exist` | Ошибка относительного пути или отсутствует явно заданная папка | Считай путь от каталога конфига; создай папку или исправь `inputFolder`. |
| Иконки из подпапки не появились | Ожидался recursive scan | Перемести SVG на верхний уровень `inputFolder` или перечисли его в `inputFiles`. |
| `SVG file does not exist`, `File is not an SVG` или пустой набор | Неверный `inputFiles`, расширение или источники | Исправь путь/расширение и обеспечь хотя бы один входной SVG. |
| Конфликт имени иконки или SVG ID | Два разных файла имеют одинаковый basename либо hash-ID столкнулся с именем | Переименуй один исходный SVG; не выбирай файл неявно. |
| `Refusing to overwrite/delete a user file` | Пользовательский файл занял managed-путь или потерял marker | Не обходи защиту: перенеси файл либо выбери другой sprite-каталог и перегенерируй. |
| Нет `.svg-sprite/index.js` или имя отсутствует в autocomplete | Генерация не запускалась после изменения, пользовательский barrel не экспортирует `.svg-sprite` либо type server держит старый модуль | Запусти sprite-команду, проверь `export * from './.svg-sprite'`, затем typecheck; при необходимости перезапусти TypeScript server. |
| SVG не загружается или URL неверен | Mode не совпадает со сборщиком, неверен Webpack `publicPath` либо кастомный loader перехватил asset | Сверь mode и build-команду, проверь Asset Modules/`publicPath`, исключи generated SVG из несовместимого loader. |
| Next build расходится между SSR и браузером | Модуль сгенерирован для другого bundler/router или URL переписан вручную | Верни generated `new URL(...)`, выбери точный Next mode и перегенерируй. |
| `color` не меняет многоцветную иконку | У иконки несколько переменных или она показана через `<img>`/CSS background | Используй `<FileManagerIcon>`/`<svg><use>` и нужные `--icon-color-N`. |
| Gradient/filter выглядит неверно | Автозамена цветов не гарантирует сложные paint servers | Изучи generated SVG; при необходимости отключи `replaceColors` для спрайта или упрости источник. |
| Viewer пуст | Манифесты не созданы, glob/import не статический или неверен Client Component boundary | Сначала сгенерируй спрайты; для Vite используй literal glob, для Webpack/Next статические loaders, для App Router добавь `'use client'` только Viewer-странице. |

При неизвестной ошибке зафиксируй полную CLI-команду, mode, путь к config-файлу или каталогу и первый stack/error message. Затем минимально воспроизведи проблему на одном спрайте, не удаляя пользовательские файлы и защитные markers.
