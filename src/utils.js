import { GOOGLE_FONT_NAMES } from './constants';

const loadedFonts = new Set();

export function loadGoogleFont(fontName) {
  if (loadedFonts.has(fontName)) return;
  const urlName = GOOGLE_FONT_NAMES[fontName];
  if (!urlName) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${urlName}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(fontName);
}

export function loadAllFontsForExport(fonts) {
  return new Promise((resolve) => {
    fonts.forEach(f => loadGoogleFont(f));
    document.fonts.ready.then(resolve);
  });
}

export function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function getTemplate(templateId, allCategories) {
  for (const cat of allCategories) {
    const t = cat.templates.find(t => t.id === templateId);
    if (t) return t;
  }
  return null;
}

export function computeZones(template, canvasW, canvasH, gutter) {
  if (!template || !template.zones) return [];
  return template.zones(canvasW, canvasH, gutter);
}

export function getAccentColor(mode) {
  return mode === 'wedding' ? '#C9A96E' : '#00A8FF';
}

export function filterToCanvas(filterStr) {
  // Convert CSS filter string to canvas-compatible operations
  // Returns the filter string for canvas context
  return filterStr;
}

// Draw rounded rect (for pill backgrounds)
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}
