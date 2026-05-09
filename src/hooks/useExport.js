import { useCallback, useState } from 'react';
import { RATIOS, TEMPLATE_CATEGORIES, WEDDING_PRESETS, SPORTS_PRESETS } from '../constants';
import { getTemplate, computeZones, loadAllFontsForExport } from '../utils';

const ALL_PRESETS = [...WEDDING_PRESETS, ...SPORTS_PRESETS];

function getExportDims(ratioId) {
  const r = RATIOS.find(r => r.id === ratioId) || RATIOS[0];
  return { w: r.exportW, h: r.exportH, canvasW: r.w, canvasH: r.h };
}

async function renderSlideToCanvas(slide, photos, logoDataUrl, ratioId) {
  const { w, h, canvasW } = getExportDims(ratioId);
  // scale converts canvas units → export pixels
  const scale = w / canvasW;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = slide.borderSettings?.bgColor || '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  const tmpl = getTemplate(slide.templateId, TEMPLATE_CATEGORIES);
  if (!tmpl) return canvas;

  const gutter = (slide.borderSettings?.gutter ?? 4) * scale;
  const zones = computeZones(tmpl, w, h, gutter);

  // Draw photo zones
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    const zoneKey = `zone-${i}`;
    const photoId = slide.photoAssignments?.[zoneKey];
    const photo = photos.find(p => p.id === photoId);

    ctx.save();
    ctx.beginPath();
    ctx.rect(zone.x, zone.y, zone.w, zone.h);
    ctx.clip();

    if (photo?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise(res => { img.onload = res; img.onerror = res; img.src = photo.url; });

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // New scale model: storedScale = canvas_units/photo_px → multiply by export scale
      const storedScale = slide.zoom?.scale?.[zoneKey];
      let dw, dh;
      if (storedScale != null) {
        dw = imgW * storedScale * scale;
        dh = imgH * storedScale * scale;
      } else {
        // Fallback: CSS cover
        const cs = Math.max(zone.w / imgW, zone.h / imgH);
        dw = imgW * cs;
        dh = imgH * cs;
      }

      const panX = (slide.zoom?.x?.[zoneKey] ?? 0) * scale;
      const panY = (slide.zoom?.y?.[zoneKey] ?? 0) * scale;
      const dx = zone.x + (zone.w - dw) / 2 + panX;
      const dy = zone.y + (zone.h - dh) / 2 + panY;

      // Draw base image (no filter)
      const drawImg = (extraTranslateX = 0) => {
        if (photo.flipH) {
          ctx.save();
          ctx.translate(zone.x + zone.w + extraTranslateX, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -(dx - zone.x + dw) + extraTranslateX, dy, dw, dh);
          ctx.restore();
        } else {
          ctx.drawImage(img, dx, dy, dw, dh);
        }
      };

      ctx.filter = 'none';
      drawImg();

      // Apply color preset as a second pass at reduced opacity
      const presetId = slide.presets?.[zoneKey] || slide.globalPreset || 'natural';
      const presetOpacity = slide.presetOpacity?.[zoneKey] ?? slide.globalPresetOpacity ?? 1;
      const presetObj = ALL_PRESETS.find(p => p.id === presetId);

      if (presetObj && presetObj.filter !== 'none' && presetOpacity > 0) {
        ctx.globalAlpha = presetOpacity;
        ctx.filter = presetObj.filter;
        drawImg();
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    }

    ctx.restore();
  }

  // Gradient overlays
  if (tmpl.gradient) {
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (tmpl.overlay) {
    ctx.fillStyle = tmpl.overlay;
    ctx.fillRect(0, 0, w, h);
  }

  // Vignette
  if (slide.borderSettings?.vignette || tmpl.vignette) {
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Inner border
  const ib = slide.borderSettings?.innerBorder;
  if (ib && ib !== 'none') {
    ctx.strokeStyle = ib.includes('white') ? '#FFFFFF' : '#000000';
    ctx.lineWidth = ib.includes('thick') ? 40 * scale : 2 * scale;
    const off = ctx.lineWidth / 2;
    ctx.strokeRect(off, off, w - off * 2, h - off * 2);
  }

  // Text blocks
  for (const tb of (slide.textBlocks || [])) {
    ctx.save();
    const fontSize = tb.size * scale;
    const weight = tb.bold ? 'bold' : 'normal';
    const style = tb.italic ? 'italic' : 'normal';
    ctx.font = `${style} ${weight} ${fontSize}px "${tb.font}", sans-serif`;
    ctx.globalAlpha = tb.opacity ?? 1;
    ctx.textAlign = tb.align || 'center';

    const tx = (tb.x / 100) * w;
    const ty = (tb.y / 100) * h;

    let displayText = tb.text || '';
    if (tb.transform === 'uppercase') displayText = displayText.toUpperCase();
    if (tb.transform === 'lowercase') displayText = displayText.toLowerCase();

    if (tb.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = (tb.shadowIntensity || 4) * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
    }

    if (tb.bgPill) {
      const metrics = ctx.measureText(displayText);
      const pillW = metrics.width + 24 * scale;
      const pillH = fontSize + 16 * scale;
      const pillX = tx - (tb.align === 'center' ? pillW / 2 : tb.align === 'right' ? pillW : 0);
      ctx.fillStyle = tb.bgColor || 'rgba(0,0,0,0.6)';
      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.roundRect(pillX, ty - pillH * 0.75, pillW, pillH, 6 * scale);
      ctx.fill();
      if (tb.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = (tb.shadowIntensity || 4) * scale;
      }
    }

    if (tb.gradient) {
      const metrics = ctx.measureText(displayText);
      const textW = metrics.width;
      const angleRad = ((tb.gradient.angle ?? 135) - 90) * Math.PI / 180;
      const half = textW / 2;
      const gx1 = tx - Math.cos(angleRad) * half;
      const gy1 = ty - Math.sin(angleRad) * half;
      const gx2 = tx + Math.cos(angleRad) * half;
      const gy2 = ty + Math.sin(angleRad) * half;
      const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
      tb.gradient.stops.forEach((stop, i) => {
        grad.addColorStop(i / Math.max(tb.gradient.stops.length - 1, 1), stop);
      });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = tb.color || '#FFFFFF';
    }

    ctx.fillText(displayText, tx, ty);
    ctx.restore();
  }

  // Logo overlay
  if (slide.logoSettings?.enabled && logoDataUrl) {
    const logo = new Image();
    await new Promise(res => { logo.onload = res; logo.onerror = res; logo.src = logoDataUrl; });
    const lw = w * (slide.logoSettings.scale || 0.15);
    const lh = (logo.naturalHeight / logo.naturalWidth) * lw;
    const lx = w * (slide.logoSettings.x || 0.85) - lw / 2;
    const ly = h * (slide.logoSettings.y || 0.9) - lh / 2;
    ctx.save();
    ctx.globalAlpha = slide.logoSettings.opacity ?? 1;
    ctx.drawImage(logo, lx, ly, lw, lh);
    ctx.restore();
  }

  return canvas;
}

function blobToDownload(canvas, filename, format) {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const quality = 1.0; // always maximum quality
  return new Promise(res => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      res();
    }, mimeType, quality);
  });
}

export function useExport(slides, photos, logoDataUrl, currentRatio) {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const exportCurrentSlide = useCallback(async (slide, format = 'jpg') => {
    setExporting(true);
    setExportProgress('Rendering…');
    try {
      await loadAllFontsForExport([...new Set(slide.textBlocks?.map(t => t.font) || [])]);
      const canvas = await renderSlideToCanvas(slide, photos, logoDataUrl, slide.ratio || currentRatio);
      const ext = format === 'png' ? 'png' : 'jpg';
      await blobToDownload(canvas, `slide.${ext}`, format);
    } catch (e) {
      console.error(e);
      setExportProgress('Export failed. Please try again.');
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setExporting(false);
      setExportProgress('');
    }
  }, [photos, logoDataUrl, currentRatio]);

  const exportAllSlides = useCallback(async (format = 'jpg') => {
    setExporting(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const ext = format === 'png' ? 'png' : 'jpg';
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setExportProgress(`Exporting slide ${i + 1} of ${slides.length}…`);
        await loadAllFontsForExport([...new Set(slide.textBlocks?.map(t => t.font) || [])]);
        const canvas = await renderSlideToCanvas(slide, photos, logoDataUrl, slide.ratio || currentRatio);
        const blob = await new Promise(res => canvas.toBlob(res, mimeType, 1.0));
        zip.file(`slide-${String(i + 1).padStart(2, '0')}.${ext}`, blob);
      }

      setExportProgress('Packaging ZIP…');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-slides.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setExportProgress('Export failed. Try fewer slides.');
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setExporting(false);
      setTimeout(() => setExportProgress(''), 1000);
    }
  }, [slides, photos, logoDataUrl, currentRatio]);

  const exportTikTok = useCallback(async (slide, format = 'jpg') => {
    setExporting(true);
    setExportProgress('TikTok export…');
    try {
      const tiktokSlide = { ...slide, ratio: '9:16' };
      await loadAllFontsForExport([...new Set(slide.textBlocks?.map(t => t.font) || [])]);
      const canvas = await renderSlideToCanvas(tiktokSlide, photos, logoDataUrl, '9:16');
      const ext = format === 'png' ? 'png' : 'jpg';
      await blobToDownload(canvas, `tiktok-slide.${ext}`, format);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
      setExportProgress('');
    }
  }, [photos, logoDataUrl]);

  return { exporting, exportProgress, exportCurrentSlide, exportAllSlides, exportTikTok };
}
