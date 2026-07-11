## Проверка результата

После изменения конфига или SVG выполни обязательные быстрые проверки:

1. Запусти точную sprite-команду, например `npm run sprite:file-manager`; процесс должен завершиться с кодом `0` и сообщить имя, число иконок, mode и каталог `generated`.
2. Проверь наличие `index.ts`, `manifest.ts`, `generated/sprite.svg`, `generated/react-component.tsx`, `generated/types.ts`, `generated/styles.module.css` и `generated/.svg-sprites.manifest.json`.
3. Убедись, что новая иконка присутствует в readonly-массиве имён и принимается prop `icon`.
4. Запусти существующую проверку типов проекта, например `npm run typecheck` или `npx tsc --noEmit`.
5. Проверь в `manifest.ts`, что `target` совпадает с выбранным mode key; generated asset expression должен быть `?no-inline` для Vite и `new URL(...)` для Webpack/Next.

Не запускай полную production-сборку только ради проверки изменения списка иконок. Она нужна, если менялся bundler target, конфигурация asset pipeline, Next router/bundler, Webpack loader или диагностируется ошибка URL в runtime.

Визуальную проверку, Network и accessibility tree выполняй только при наличии запущенного приложения и браузерных инструментов. Если таких инструментов нет, не утверждай, что цвета, темы, доступность или HTTP-ответ asset проверены; явно укажи непроверенную часть.

`SpriteViewer` также необязателен. Используй его для сложных цветов, transforms и массовой визуальной проверки, но не добавляй debug route ради обычной генерации одного спрайта.
