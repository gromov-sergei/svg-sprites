import fs from 'node:fs'
import path from 'node:path'
import type { SpriteResult } from './types.js'

/** Извлекает id иконок из SVG-спрайта. */
function extractIconIds(spritePath: string): string[] {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const ids: string[] = []
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1])
  }
  return ids.sort()
}

/**
 * Извлекает CSS-переменные var(--icon-color-N, fallback) из фрагмента SVG для конкретной иконки.
 *
 * Возвращает массив { varName, fallback } для каждой уникальной переменной.
 */
function extractIconVars(svgFragment: string): { varName: string; fallback: string }[] {
  const vars = new Map<string, string>()
  const regex = /var\((--icon-color-\d+),\s*([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(svgFragment)) !== null) {
    if (!vars.has(match[1])) {
      vars.set(match[1], match[2].trim())
    }
  }
  return [...vars.entries()].map(([varName, fallback]) => ({ varName, fallback }))
}

/**
 * Парсит SVG-спрайт и возвращает маппинг id → SVG-фрагмент для каждой иконки.
 */
function extractIconFragments(spritePath: string): Map<string, string> {
  const content = fs.readFileSync(spritePath, 'utf-8')
  const fragments = new Map<string, string>()

  // Матчим <svg id="...">...</svg> или <symbol id="...">...</symbol>
  const regex = /<(?:svg|symbol)\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/(?:svg|symbol)>/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    fragments.set(match[1], match[0])
  }
  return fragments
}

/** Подготавливает SVG-спрайт для инлайна — конвертирует вложенные <svg> в <symbol>. */
function prepareInlineSprite(spritePath: string): string {
  let content = fs.readFileSync(spritePath, 'utf-8')

  content = content.replace(/<\?xml[^?]*\?>\s*/g, '')
  content = content.replace(/<style>:root>svg\{display:none\}:root>svg:target\{display:block\}<\/style>/g, '')

  let depth = 0
  content = content.replace(/<(\/?)svg\b([^>]*?)(\s*\/?)>/g, (_full, slash: string, attrs: string) => {
    if (slash) {
      depth--
      return depth > 0 ? '</symbol>' : '</svg>'
    }
    depth++
    if (depth > 1) {
      const cleanAttrs = attrs.replace(/\s*xmlns="[^"]*"/g, '')
      return `<symbol${cleanAttrs}>`
    }
    return `<svg${attrs} style="display:none">`
  })

  return content
}

/** Конвертирует CSS-цвет в hex для input[type=color]. */
function colorToHex(color: string): string {
  const named: Record<string, string> = {
    red: '#ff0000', blue: '#0000ff', green: '#008000', white: '#ffffff',
    black: '#000000', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080',
    grey: '#808080', currentcolor: '#000000',
  }
  const lower = color.toLowerCase().trim()
  if (lower.startsWith('#')) {
    if (lower.length === 4) {
      return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`
    }
    return lower
  }
  return named[lower] || '#000000'
}

interface IconData {
  id: string
  vars: { varName: string; fallback: string }[]
}

interface SpriteGroup {
  name: string
  mode: string
  spritePath: string
  icons: IconData[]
}

/** Генерирует HTML-строку превью. */
function renderHtml(groups: SpriteGroup[]): string {
  const totalIcons = groups.reduce((sum, g) => sum + g.icons.length, 0)

  const inlineSprites = groups
    .map((g) => prepareInlineSprite(g.spritePath))
    .join('\n')

  // Собираем JSON с данными переменных для JS
  const iconsData: Record<string, { varName: string; fallback: string }[]> = {}
  for (const group of groups) {
    for (const icon of group.icons) {
      iconsData[icon.id] = icon.vars
    }
  }

  const sections = groups
    .map((group) => {
      const cards = group.icons
        .map((icon) => {
          const varsHtml = icon.vars.length > 0
            ? `<div class="vars">${icon.vars.map((v) => {
                const isCurrentColor = v.fallback.toLowerCase() === 'currentcolor'
                const hex = colorToHex(v.fallback)
                return `<label class="var-row">` +
                `<input type="color" value="${hex}" data-icon="${icon.id}" data-var="${v.varName}" data-default="${hex}"${isCurrentColor ? ' data-current-color' : ''} autocomplete="off">` +
                `<code>${v.varName}: ${v.fallback}</code>` +
                `</label>`
              }).join('')}</div>`
            : '<div class="vars"><span class="no-vars">no color vars</span></div>'

          return `
        <div class="card" data-name="${icon.id}">
          <div class="card-icon" onclick="copy('${icon.id}')">
            <svg class="icon"><use href="#${icon.id}"/></svg>
          </div>
          <span class="name">${icon.id}</span>
          ${varsHtml}
        </div>`
        })
        .join('')

      return `
    <section class="group" data-group="${group.name}">
      <h2>${group.name} <span class="badge">${group.mode}</span> <span class="count">${group.icons.length}</span></h2>
      <div class="grid">${cards}
      </div>
    </section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SVG Sprites Preview — ${totalIcons} icons</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0}

  :root{
    --bg:#fff;--fg:#1a1a1a;--card-bg:#f5f5f5;--card-hover:#e8e8e8;
    --border:#e0e0e0;--accent:#3b82f6;--radius:8px;--icon-size:64px;
  }
  @media(prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --bg:#1a1a1a;--fg:#e5e5e5;--card-bg:#2a2a2a;--card-hover:#333;--border:#404040;
    }
  }
  :root[data-theme="dark"]{
    --bg:#1a1a1a;--fg:#e5e5e5;--card-bg:#2a2a2a;--card-hover:#333;--border:#404040;
  }

  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    background:var(--bg);color:var(--fg);padding:24px;max-width:1400px;margin:0 auto;
  }
  header{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:24px}
  h1{font-size:1.5rem;font-weight:700}
  .toolbar{display:flex;gap:12px;margin-left:auto;align-items:center}
  input[type="search"]{
    padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);
    background:var(--card-bg);color:var(--fg);font-size:14px;width:200px;outline:none;
  }
  input[type="search"]:focus{border-color:var(--accent)}
  input[type="color"]{
    width:20px;height:20px;border:1px solid var(--border);border-radius:4px;
    padding:0;cursor:pointer;background:none;
  }
  input[type="color"]::-webkit-color-swatch-wrapper{padding:1px}
  input[type="color"]::-webkit-color-swatch{border:none;border-radius:3px}
  button{
    padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius);
    background:var(--card-bg);color:var(--fg);cursor:pointer;font-size:14px;
  }
  button:hover{background:var(--card-hover)}

  .group{margin-bottom:40px}
  .group h2{font-size:1.1rem;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px}
  .badge{
    font-size:11px;font-weight:500;padding:2px 8px;border-radius:10px;
    background:var(--accent);color:#fff;text-transform:uppercase;letter-spacing:0.5px;
  }
  .count{font-size:13px;color:#888;font-weight:400}
  .grid{
    display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;
  }
  .card{
    display:flex;flex-direction:column;align-items:center;gap:6px;
    padding:12px 8px;border-radius:var(--radius);background:var(--card-bg);
    position:relative;
  }
  .card:hover{background:var(--card-hover)}
  .card.copied::after{
    content:"Copied!";position:absolute;top:4px;right:4px;
    font-size:10px;color:var(--accent);font-weight:600;
  }
  .card-icon{cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:40px}
  .icon{width:var(--icon-size);height:var(--icon-size);color:var(--fg)}
  .name{font-size:11px;color:#888;text-align:center;word-break:break-all}
  .vars{
    display:flex;flex-direction:column;gap:3px;width:100%;margin-top:4px;
    border-top:1px solid var(--border);padding-top:6px;
  }
  .var-row{
    display:flex;align-items:center;gap:4px;cursor:pointer;
  }
  .var-row code{font-size:10px;color:#888;font-family:"SF Mono",Monaco,Consolas,monospace}
  .no-vars{font-size:10px;color:#666;font-style:italic}
  .hidden{display:none}
  .toast{
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:#333;color:#fff;padding:8px 20px;border-radius:var(--radius);
    font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:10;
  }
  .toast.show{opacity:1}
</style>
</head>
<body>
${inlineSprites}
<header>
  <h1>SVG Sprites</h1>
  <span class="count">${totalIcons} icons</span>
  <div class="toolbar">
    <input type="search" id="search" placeholder="Search icons..." autocomplete="off">
    <button id="theme" title="Toggle theme">&#x25D1;</button>
  </div>
</header>
${sections}
<div class="toast" id="toast"></div>
<script>
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const search = $('#search');
const cards = $$('.card');
const groups = $$('.group');
const toast = $('#toast');
const themeBtn = $('#theme');
let toastTimer;

// --- Search ---
search.addEventListener('input', () => {
  const q = search.value.toLowerCase();
  cards.forEach(c => c.classList.toggle('hidden', !c.dataset.name.includes(q)));
  groups.forEach(g => {
    const visible = g.querySelectorAll('.card:not(.hidden)');
    g.classList.toggle('hidden', visible.length === 0);
  });
});

// --- Copy ---
function copy(name) {
  navigator.clipboard.writeText(name).then(() => showToast('Copied: ' + name));
  const card = $('.card[data-name="' + name + '"]');
  if (card) { card.classList.add('copied'); setTimeout(() => card.classList.remove('copied'), 1000); }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
}

// --- Theme (auto + manual) ---
function syncCurrentColorPickers() {
  // Даём браузеру применить стили, потом считываем computed --fg
  requestAnimationFrame(() => {
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
    const hex = rgbToHex(fg);
    $$('input[data-current-color]').forEach(input => {
      input.value = hex;
      input.dataset.default = hex;
    });
  });
}

function rgbToHex(color) {
  // Если уже hex
  if (color.startsWith('#')) return color;
  // rgb(r, g, b)
  const m = color.match(/\d+/g);
  if (m && m.length >= 3) {
    return '#' + m.slice(0, 3).map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
}

themeBtn.addEventListener('click', () => {
  const root = document.documentElement;
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const current = root.dataset.theme || sys;
  root.dataset.theme = current === 'dark' ? 'light' : 'dark';
  syncCurrentColorPickers();
});

// Реагируем на системную смену темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncCurrentColorPickers);

// --- Per-icon color pickers ---
$$('input[type="color"][data-icon]').forEach(input => {
  input.addEventListener('input', () => {
    const varName = input.dataset.var;
    const card = input.closest('.card');
    if (card) {
      const iconEl = card.querySelector('.card-icon');
      if (iconEl) iconEl.style.setProperty(varName, input.value);
    }
  });
});

// --- Reset color pickers to defaults on load (prevent browser autocomplete) ---
$$('input[type="color"][data-default]').forEach(input => {
  input.value = input.dataset.default;
});

// --- Sync currentColor pickers with actual theme color ---
syncCurrentColorPickers();
</script>
</body>
</html>`
}

/**
 * Генерирует HTML-файл превью для всех спрайтов.
 *
 * Возвращает путь к сгенерированному файлу.
 */
export function generatePreview(
  results: SpriteResult[],
  outputDir: string,
): string {
  const groups: SpriteGroup[] = results.map((r) => {
    const fragments = extractIconFragments(r.spritePath)
    const ids = extractIconIds(r.spritePath)

    const icons: IconData[] = ids.map((id) => ({
      id,
      vars: extractIconVars(fragments.get(id) || ''),
    }))

    return {
      name: r.name,
      mode: r.mode,
      spritePath: r.spritePath,
      icons,
    }
  })

  const html = renderHtml(groups)
  const outputPath = path.join(outputDir, 'preview.html')

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, html)

  return outputPath
}
