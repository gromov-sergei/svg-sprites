## Диагностика

Сопоставь симптом с проверкой и исправляй первопричину:

| Симптом | Вероятная причина | Действие |
|---|---|---|
| `Missing required argument: --mode` или `Missing sprite path` | Неполная CLI-команда | Передай `--mode <полный-key>` и один каталог спрайта. |
| `Expected one sprite path` | Передано несколько путей | Создай отдельную команду на каждый современный спрайт и объедини scripts. |
| `React mode requires a target` или `Unsupported Next.js target` | Использован сокращённый/неподдерживаемый key | Выбери один из семи mode keys из таблицы, не используй `standalone`. |
| `React config file not found` | CLI указывает не на каталог с `svg-sprite.config.ts` | Исправь позиционный путь; не передавай путь к файлу. |
| Legacy config не найден или читается не тем pipeline | Перепутаны `svg-sprites.config.ts` и `svg-sprite.config.ts` | Определи API по имени и полям конфига, независимо от числа элементов `sprites`. |
| `Input directory does not exist` | Ошибка относительного пути или отсутствует явно заданная папка | Считай путь от каталога конфига; создай папку или исправь `inputFolder`. |
| Иконки из подпапки не появились | Ожидался recursive scan | Перемести SVG на верхний уровень `inputFolder` или перечисли его в `inputFiles`. |
| `SVG file does not exist`, `File is not an SVG` или пустой набор | Неверный `inputFiles`, расширение или источники | Исправь путь/расширение и обеспечь хотя бы один входной SVG. |
| Конфликт имени иконки или SVG ID | Два разных файла имеют одинаковый basename либо hash-ID столкнулся с именем | Переименуй один исходный SVG; не выбирай файл неявно. |
| `Refusing to overwrite/delete a user file` | Пользовательский файл занял managed-путь или потерял marker | Не обходи защиту: перенеси файл либо выбери другой sprite-каталог и перегенерируй. |
| Нет `index.ts` или имя отсутствует в autocomplete | Генерация не запускалась после изменения либо type server держит старый модуль | Запусти sprite-команду, затем typecheck; при необходимости перезапусти TypeScript server. |
| SVG не загружается или URL неверен | Mode не совпадает со сборщиком, неверен Webpack `publicPath` либо кастомный loader перехватил asset | Сверь mode и build-команду, проверь Asset Modules/`publicPath`, исключи generated SVG из несовместимого loader. |
| Next build расходится между SSR и браузером | Модуль сгенерирован для другого bundler/router или URL переписан вручную | Верни generated `new URL(...)`, выбери точный Next mode и перегенерируй. |
| `color` не меняет многоцветную иконку | У иконки несколько переменных или она показана через `<img>`/CSS background | Используй `<FileManagerIcon>`/`<svg><use>` и нужные `--icon-color-N`. |
| Gradient/filter выглядит неверно | Автозамена цветов не гарантирует сложные paint servers | Изучи generated SVG; при необходимости отключи `replaceColors` для спрайта или упрости источник. |
| Viewer пуст | Манифесты не созданы, glob/import не статический или неверен Client Component boundary | Сначала сгенерируй спрайты; для Vite используй literal glob, для Webpack/Next статические loaders, для App Router добавь `'use client'` только Viewer-странице. |

При неизвестной ошибке зафиксируй полную CLI-команду, mode, путь к конфигу и первый stack/error message. Затем минимально воспроизведи проблему на одном спрайте, не удаляя пользовательские файлы и защитные markers.
