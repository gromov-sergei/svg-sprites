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

Генератор не нужно устанавливать в проект. Начни с plain config без package
import:

```ts
export default {
  mode: 'react@vite',
  name: 'file-manager',
  description: 'Иконки файлового менеджера',
  input: ['./icons', '../../shared/icons/close.svg'],
}
```

`input` принимает одну папку, точный SVG-файл или glob либо массив, объединяющий эти источники. Элемент массива с префиксом `!` исключает совпадения. Папки сканируются плоско; для рекурсии нужен явный glob `**/*.svg`. Если `input` не задан, используется `./icons`. Все пути считаются от каталога конфига, и каждый positive-источник должен найти хотя бы один SVG.

Контракт объекта одинаков для React и Next.js; отличается полный `mode`. Устанавливай package только для необязательного Viewer, программного API или package-типизации config. В exact guides также есть локальный copy-paste type для проектов без package.

`name` должен начинаться с латинской буквы и записываться в kebab-case; из примера `file-manager` будут созданы `FileManagerIcon`, `FileManagerIconName` и `fileManagerIconNames`. Другой спрайт получает собственные имена. Если `name` не задан, генератор выводит его из каталога.

Добавь отдельную команду с выбранным mode key и одним путём:

```json
{
  "scripts": {
    "sprite:file-manager": "npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts",
    "sprites": "npm run sprite:file-manager"
  }
}
```

Для Next.js укажи в config полный ключ, например `next@app/turbopack`. Для нескольких спрайтов добавь по команде `sprite:<name>` на каждый config-файл и последовательно вызови их из `sprites`.

Чтобы задать источники через CLI, повторяй `--input <path-or-glob>`; значения образуют тот же массивный контракт, включая исключения с `!`:

```bash
npx --yes --package=@gromlab/svg-sprites@latest svg-sprites src/ui/file-manager/svg-sprite/svg-sprite.config.ts \
  --input ./icons \
  --input '../../shared/icons/**/*.svg' \
  --input '!../../shared/icons/legacy-*.svg'
```

Generated-файлы в `.svg-sprite` по умолчанию исключаются из Git, поэтому запускай `sprites` до процессов, которым нужны компонент, типы или asset. Если проект импортирует корень sprite-модуля, создай пользовательский `index.ts` с `export * from './.svg-sprite'`. Generated declarations self-contained и не импортируют generator package.

Запускай генерацию либо через `predev`/`prebuild`/`pretypecheck`, либо явно внутри соответствующих команд. Не используй обе формы для одной команды, иначе генерация выполнится дважды. Сохраняй существующие команды и не создавай второй одноимённый JSON key.

Запусти первую генерацию вручную:

```bash
npm run sprites
```
