## Настройка React или Next.js

Выбери целевой каталог для одного спрайта. Он может находиться рядом с feature, в общем каталоге иконок или в любом другом месте, принятом в проекте. Следующая структура является только примером:

```text
src/ui/file-manager/svg-sprite/
├── icons/
│   ├── check.svg
│   └── folder.svg
└── svg-sprite.config.ts
```

Один `svg-sprite.config.ts` создаёт один независимый спрайт. Для нескольких наборов выбери несколько каталогов и дай каждому уникальное `name`.

Установи пакет как development dependency:

```bash
npm install --save-dev @gromlab/svg-sprites
```

Используй config helper для autocomplete и проверки типов:

```ts
import { defineReactSpriteConfig } from '@gromlab/svg-sprites'

export default defineReactSpriteConfig({
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  inputFolder: './icons',
  inputFiles: ['../../shared/icons/close.svg'],
})
```

Контракт объекта одинаков для React и Next.js. Для Next.js-спрайта используй `defineNextSpriteConfig(...)`.

`name` должен начинаться с латинской буквы и записываться в kebab-case; из примера `file-manager` будут созданы `FileManagerIcon`, `FileManagerIconName` и `fileManagerIconNames`. Другой спрайт получает собственные имена. Если `name` не задан, генератор выводит его из каталога.

Добавь отдельную команду с выбранным mode key и одним путём:

```json
{
  "scripts": {
    "sprite:file-manager": "svg-sprites --mode react@vite src/ui/file-manager/svg-sprite",
    "sprites": "npm run sprite:file-manager"
  }
}
```

Для Next.js подставь полный ключ, например `next@app/turbopack`. Для нескольких спрайтов добавь по команде `sprite:<name>` на каждый каталог и последовательно вызови их из `sprites`.

Generated-файлы по умолчанию исключаются из Git, поэтому запускай `sprites` до процессов, которым нужны `index.ts`, типы или asset. Добавь вызов к `predev`, `prebuild` и, если есть `typecheck`, к `pretypecheck`.

Если lifecycle script отсутствует, создай его. Если он уже существует, сохрани его команду и допиши генерацию через `&&`, например преобразуй `"prebuild": "npm run lint"` в `"prebuild": "npm run lint && npm run sprites"`. Никогда не заменяй существующий `pre*` одной генерацией и не создавай второй одноимённый JSON key.

Запусти первую генерацию вручную:

```bash
npm run sprites
```
