export const SPRITE_VIEWER_STYLES = `
.gromlab-sprite-viewer {
  --sv-bg: #f0f0f3;
  --sv-text: #1a1a1a;
  --sv-card: #ffffff;
  --sv-card-hover: #eaeaed;
  --sv-border: #d8d8d8;
  --sv-accent: #3b82f6;
  --sv-muted: #777777;
  --sv-code: #f5f5f5;
  --sv-checker-a: #e9e9e9;
  --sv-checker-b: #ffffff;
  --sv-danger: #b42332;
  box-sizing: border-box;
  min-height: 320px;
  padding: 24px;
  color: var(--sv-text);
  color-scheme: light;
  background: var(--sv-bg);
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.gromlab-sprite-viewer[data-theme="dark"] {
  --sv-bg: #1a1a1a;
  --sv-text: #e5e5e5;
  --sv-card: #2a2a2a;
  --sv-card-hover: #333333;
  --sv-border: #404040;
  --sv-muted: #a3a3a3;
  --sv-code: #242424;
  --sv-checker-a: #333333;
  --sv-checker-b: #2a2a2a;
  --sv-danger: #ff9ba6;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
  .gromlab-sprite-viewer:not([data-theme]) {
    --sv-bg: #1a1a1a;
    --sv-text: #e5e5e5;
    --sv-card: #2a2a2a;
    --sv-card-hover: #333333;
    --sv-border: #404040;
    --sv-muted: #a3a3a3;
    --sv-code: #242424;
    --sv-checker-a: #333333;
    --sv-checker-b: #2a2a2a;
    --sv-danger: #ff9ba6;
    color-scheme: dark;
  }
}
.gromlab-sprite-viewer *,
.gromlab-sprite-viewer *::before,
.gromlab-sprite-viewer *::after { box-sizing: border-box; }
.gromlab-sprite-viewer button,
.gromlab-sprite-viewer input { font: inherit; }
.gromlab-sprite-viewer__header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.gromlab-sprite-viewer__title { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; }
.gromlab-sprite-viewer__summary { color: var(--sv-muted); font-size: 13px; }
.gromlab-sprite-viewer__toolbar { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.gromlab-sprite-viewer__search {
  width: 220px;
  height: 38px;
  padding: 0 12px;
  color: var(--sv-text);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.gromlab-sprite-viewer__search:focus { border-color: var(--sv-accent); box-shadow: 0 0 0 3px rgba(59, 130, 246, .18); }
.gromlab-sprite-viewer__search::placeholder { color: var(--sv-muted); }
.gromlab-sprite-viewer__theme {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: var(--sv-text);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.gromlab-sprite-viewer__theme:hover { background: var(--sv-card-hover); }
.gromlab-sprite-viewer__theme:focus-visible,
.gromlab-sprite-viewer__card:focus-visible,
.gromlab-sprite-viewer__close:focus-visible,
.gromlab-sprite-viewer__tab:focus-visible,
.gromlab-sprite-viewer__copy:focus-visible,
.gromlab-sprite-viewer__swatch:focus-visible {
  outline: 2px solid var(--sv-accent);
  outline-offset: 2px;
}
.gromlab-sprite-viewer__errors {
  margin: 0 0 24px;
  padding: 12px 14px;
  color: var(--sv-danger);
  background: rgba(180, 35, 50, .08);
  border: 1px solid rgba(180, 35, 50, .28);
  border-radius: 8px;
  font-size: 12px;
}
.gromlab-sprite-viewer__group { margin-bottom: 40px; }
.gromlab-sprite-viewer__group-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.gromlab-sprite-viewer__group-title { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 600; }
.gromlab-sprite-viewer__badge {
  padding: 2px 8px;
  color: #ffffff;
  background: var(--sv-accent);
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.5;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.gromlab-sprite-viewer__group-count,
.gromlab-sprite-viewer__description { color: var(--sv-muted); font-size: 13px; font-weight: 400; }
.gromlab-sprite-viewer__description { flex-basis: 100%; margin: -2px 0 0; }
.gromlab-sprite-viewer__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.gromlab-sprite-viewer__card {
  display: flex;
  min-width: 0;
  padding: 16px 8px;
  color: inherit;
  text-align: center;
  background: var(--sv-card);
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: background .15s, transform .15s;
}
.gromlab-sprite-viewer__card:hover { background: var(--sv-card-hover); transform: translateY(-1px); }
.gromlab-sprite-viewer__icon-wrap,
.gromlab-sprite-viewer__dialog-preview-canvas {
  display: grid;
  place-items: center;
  background: conic-gradient(
    var(--sv-checker-a) 25%, var(--sv-checker-b) 0 50%,
    var(--sv-checker-a) 0 75%, var(--sv-checker-b) 0
  );
  background-size: 8px 8px;
  border-radius: 4px;
}
.gromlab-sprite-viewer__icon-wrap { width: 128px; height: 128px; }
.gromlab-sprite-viewer__icon { display: block; width: 128px; height: 128px; color: var(--sv-text); overflow: visible; }
.gromlab-sprite-viewer__icon-name {
  max-width: 100%;
  overflow: hidden;
  color: var(--sv-muted);
  font-size: 13px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gromlab-sprite-viewer__status {
  padding: 40px 20px;
  color: var(--sv-muted);
  text-align: center;
  background: var(--sv-card);
  border: 1px dashed var(--sv-border);
  border-radius: 8px;
}
.gromlab-sprite-viewer__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  padding-top: 16px;
  color: var(--sv-muted);
  border-top: 1px solid var(--sv-border);
  font-size: 13px;
}
.gromlab-sprite-viewer__footer a { color: var(--sv-accent); text-decoration: none; }
.gromlab-sprite-viewer__footer a:hover { text-decoration: underline; }
.gromlab-sprite-viewer__dialog {
  width: min(560px, calc(100vw - 32px));
  max-width: none;
  max-height: calc(100dvh - 48px);
  padding: 0;
  color: var(--sv-text);
  background: transparent;
  border: 0;
  overflow: visible;
}
.gromlab-sprite-viewer__dialog::backdrop { background: rgba(0, 0, 0, .55); backdrop-filter: blur(2px); }
.gromlab-sprite-viewer__dialog-shell {
  position: relative;
  max-height: calc(100dvh - 48px);
  padding: 24px;
  overflow-y: auto;
  color: var(--sv-text);
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 12px;
  box-shadow: 0 24px 72px rgba(0, 0, 0, .28);
}
.gromlab-sprite-viewer__close {
  position: absolute;
  z-index: 2;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  color: var(--sv-text);
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  cursor: pointer;
}
.gromlab-sprite-viewer__close:hover { background: var(--sv-card-hover); }
.gromlab-sprite-viewer__dialog-preview { display: flex; align-items: center; justify-content: center; padding: 24px; margin-bottom: 16px; background: var(--sv-card); border-radius: 8px; }
.gromlab-sprite-viewer__dialog-preview-canvas { width: 256px; height: 256px; }
.gromlab-sprite-viewer__dialog-icon,
.gromlab-sprite-viewer__dialog-img,
.gromlab-sprite-viewer__dialog-mask { display: block; width: 256px; height: 256px; }
.gromlab-sprite-viewer__dialog-icon { color: var(--sv-text); overflow: visible; }
.gromlab-sprite-viewer__dialog-img { object-fit: contain; }
.gromlab-sprite-viewer__dialog-heading { display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.gromlab-sprite-viewer__dialog-title { margin: 0; font: 600 16px/1.3 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__viewbox {
  padding: 2px 8px;
  color: var(--sv-muted);
  background: var(--sv-card);
  border: 1px solid var(--sv-border);
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}
.gromlab-sprite-viewer__dialog-meta { margin: 0 0 20px; color: var(--sv-muted); text-align: center; font-size: 12px; }
.gromlab-sprite-viewer__colors { margin-bottom: 20px; }
.gromlab-sprite-viewer__hint {
  margin: 0 0 12px;
  padding: 8px 12px;
  color: var(--sv-muted);
  background: var(--sv-card);
  border-left: 3px solid var(--sv-accent);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}
.gromlab-sprite-viewer__colors-title { margin: 0 0 8px; color: var(--sv-muted); font-size: 12px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
.gromlab-sprite-viewer__color-row { position: relative; display: flex; align-items: center; gap: 8px; min-height: 32px; margin-bottom: 6px; }
.gromlab-sprite-viewer__swatch { width: 26px; height: 26px; flex: 0 0 auto; padding: 0; border: 1px solid var(--sv-border); border-radius: 4px; cursor: pointer; }
.gromlab-sprite-viewer__color-label { min-width: 0; overflow-wrap: anywhere; color: var(--sv-muted); font: 12px/1.4 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__color-popover {
  position: absolute;
  z-index: 5;
  bottom: calc(100% + 6px);
  left: 0;
  width: 224px;
  max-width: calc(100vw - 64px);
  padding: 12px;
  background: var(--sv-bg);
  border: 1px solid var(--sv-border);
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .22);
}
.gromlab-sprite-viewer__color-popover .react-colorful { width: 198px; max-width: 100%; height: 160px; }
.gromlab-sprite-viewer__hex-input { display: block; width: 100%; height: 32px; margin-top: 8px; padding: 0 8px; color: var(--sv-text); text-align: center; background: var(--sv-card); border: 1px solid var(--sv-border); border-radius: 4px; outline: none; font: 12px/1 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__hex-input:focus { border-color: var(--sv-accent); }
.gromlab-sprite-viewer__tabs { display: flex; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--sv-border); }
.gromlab-sprite-viewer__tab { flex: 0 0 auto; padding: 8px 16px; color: var(--sv-muted); background: none; border: 0; border-bottom: 2px solid transparent; cursor: pointer; font-size: 12px; font-weight: 600; }
.gromlab-sprite-viewer__tab[aria-selected="true"] { color: var(--sv-accent); border-bottom-color: var(--sv-accent); }
.gromlab-sprite-viewer__code { position: relative; overflow: hidden; background: var(--sv-code); border-radius: 8px; }
.gromlab-sprite-viewer__code pre { min-height: 72px; margin: 0; padding: 16px 70px 16px 16px; overflow-x: auto; font: 12px/1.6 ui-monospace, "SFMono-Regular", Consolas, monospace; }
.gromlab-sprite-viewer__copy { position: absolute; top: 8px; right: 8px; padding: 4px 8px; color: var(--sv-muted); background: var(--sv-bg); border: 1px solid var(--sv-border); border-radius: 4px; cursor: pointer; font-size: 11px; }
.gromlab-sprite-viewer__copy:hover { color: var(--sv-text); }
.gromlab-sprite-viewer__code .hl-tag { color: #116329; }
.gromlab-sprite-viewer__code .hl-attr,
.gromlab-sprite-viewer__code .hl-number,
.gromlab-sprite-viewer__code .hl-property { color: #0550ae; }
.gromlab-sprite-viewer__code .hl-string,
.gromlab-sprite-viewer__code .hl-color { color: #0a3069; }
.gromlab-sprite-viewer__code .hl-comment { color: #8b949e; }
.gromlab-sprite-viewer__code .hl-punctuation,
.gromlab-sprite-viewer__code .hl-selector { color: #6639ba; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-tag { color: #7ee787; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-attr,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-number,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-property { color: #79c0ff; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-string,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-color { color: #a5d6ff; }
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-punctuation,
.gromlab-sprite-viewer[data-theme="dark"] .gromlab-sprite-viewer__code .hl-selector { color: #d2a8ff; }
@media (prefers-color-scheme: dark) {
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-tag { color: #7ee787; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-attr,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-number,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-property { color: #79c0ff; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-string,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-color { color: #a5d6ff; }
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-punctuation,
  .gromlab-sprite-viewer:not([data-theme]) .gromlab-sprite-viewer__code .hl-selector { color: #d2a8ff; }
}
@media (max-width: 640px) {
  .gromlab-sprite-viewer { padding: 16px; border-radius: 8px; }
  .gromlab-sprite-viewer__header { align-items: stretch; }
  .gromlab-sprite-viewer__toolbar { width: 100%; margin-left: 0; }
  .gromlab-sprite-viewer__search { width: auto; flex: 1; min-width: 0; }
  .gromlab-sprite-viewer__grid { grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 8px; }
  .gromlab-sprite-viewer__icon-wrap,
  .gromlab-sprite-viewer__icon { width: 104px; height: 104px; }
  .gromlab-sprite-viewer__dialog { width: calc(100vw - 20px); max-height: calc(100dvh - 20px); }
  .gromlab-sprite-viewer__dialog-shell { max-height: calc(100dvh - 20px); padding: 16px; }
  .gromlab-sprite-viewer__dialog-preview { padding: 16px; }
  .gromlab-sprite-viewer__dialog-preview-canvas,
  .gromlab-sprite-viewer__dialog-icon,
  .gromlab-sprite-viewer__dialog-img,
  .gromlab-sprite-viewer__dialog-mask { width: min(256px, calc(100vw - 86px)); height: min(256px, calc(100vw - 86px)); }
}
@media (prefers-reduced-motion: reduce) {
  .gromlab-sprite-viewer *,
  .gromlab-sprite-viewer *::before,
  .gromlab-sprite-viewer *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
`
