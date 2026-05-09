import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { TEMPLATE_CATEGORIES, WEDDING_PRESETS, SPORTS_PRESETS } from '../constants';
import { getTemplate, computeZones } from '../utils';

const ALL_PRESETS = [...WEDDING_PRESETS, ...SPORTS_PRESETS];

// Two-layer image: base (no filter) + filtered overlay at variable opacity
function PhotoImageLayers({ url, panX, panY, flipH, imgCSSW, imgCSSH, filterStr, filterOpacity }) {
  const base = {
    position: 'absolute', top: '50%', left: '50%',
    ...(imgCSSW != null ? { width: imgCSSW, height: imgCSSH, minWidth: 'unset', minHeight: 'unset' }
      : { minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto' }),
    maxWidth: 'none', maxHeight: 'none',
    transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px))${flipH ? ' scaleX(-1)' : ''}`,
    transformOrigin: 'center center',
    pointerEvents: 'none',
  };
  return (
    <>
      <img src={url} alt="" draggable={false} style={{ ...base, filter: 'none' }} />
      {filterStr !== 'none' && (
        <img src={url} alt="" draggable={false} style={{ ...base, filter: filterStr, opacity: filterOpacity }} />
      )}
    </>
  );
}

// ─── PHOTO ZONE ──────────────────────────────────────────────────────────────────
function PhotoZone({ zone, zoneKey, zoneIndex, photoIndex, photo, preset, presetOpacity, accentColor, isSelected,
  onClick, onZoomDelta, flipH, panX, panY, imgCSSW, imgCSSH, onPan, onZoneDragStart, onZoneDrop }) {

  const presetObj = ALL_PRESETS.find(p => p.id === preset);
  const filterStr = presetObj?.filter || 'none';

  const draggingPhoto = useRef(false);
  const dragStart = useRef(null);
  const [dropOver, setDropOver] = useState(false);
  const [isDraggingOut, setIsDraggingOut] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const divRef = useRef();

  // Keep a ref to current pan/selection state so touch handlers don't go stale
  const touchStateRef = useRef({ isSelected, hasPhoto: !!photo?.url, panX, panY });
  useEffect(() => {
    touchStateRef.current = { isSelected, hasPhoto: !!photo?.url, panX, panY };
  });

  // Non-passive wheel + touch pinch/pan listeners
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // Wheel zoom (desktop)
    const handleWheel = (e) => {
      e.preventDefault();
      onZoomDelta(zoneKey, e.deltaY);
    };

    // Touch pinch-to-zoom + single-finger pan
    const getTouchDist = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.hypot(dx, dy);
    };
    let lastPinchDist = null;
    let touchPanStart = null;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        lastPinchDist = getTouchDist(e.touches);
        touchPanStart = null;
      } else if (e.touches.length === 1) {
        const { isSelected: sel, hasPhoto } = touchStateRef.current;
        if (sel && hasPhoto) {
          const { panX: px, panY: py } = touchStateRef.current;
          touchPanStart = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, px, py };
        }
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && lastPinchDist !== null) {
        e.preventDefault();
        const newDist = getTouchDist(e.touches);
        const delta = -(newDist - lastPinchDist) * 1.5;
        onZoomDelta(zoneKey, delta);
        lastPinchDist = newDist;
      } else if (e.touches.length === 1 && touchPanStart) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchPanStart.tx;
        const dy = e.touches[0].clientY - touchPanStart.ty;
        onPan(zoneKey, touchPanStart.px + dx, touchPanStart.py + dy);
      }
    };

    const handleTouchEnd = () => {
      lastPinchDist = null;
      touchPanStart = null;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoneKey, onZoomDelta, onPan]);

  // Mouse drag to pan (only when zone already selected)
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;

    if (!isSelected) {
      onClick(zoneKey);
      return;
    }
    if (!photo?.url) return;

    e.preventDefault();
    e.stopPropagation();
    draggingPhoto.current = true;
    setIsPanning(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: panX, py: panY };

    const move = (ev) => {
      if (!draggingPhoto.current) return;
      onPan(zoneKey, dragStart.current.px + (ev.clientX - dragStart.current.mx),
                      dragStart.current.py + (ev.clientY - dragStart.current.my));
    };
    const up = () => {
      draggingPhoto.current = false;
      setIsPanning(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [isSelected, photo, zoneKey, panX, panY, onPan, onClick]);

  // Drag THIS zone's photo out to swap — only when zone is NOT selected
  const handleDragStart = (e) => {
    if (!photo?.url || isSelected) { e.preventDefault(); return; }
    setIsDraggingOut(true);
    e.dataTransfer.setData('photoId', photo.id);
    e.dataTransfer.setData('sourceType', 'zone');
    e.dataTransfer.setData('sourceZone', zoneKey);
    e.dataTransfer.effectAllowed = 'move';
    onZoneDragStart && onZoneDragStart(zoneKey);
  };

  return (
    <div
      ref={divRef}
      onMouseDown={handleMouseDown}
      // draggable only when NOT selected; when selected, mouse is used for panning
      draggable={!isSelected && !!photo?.url}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDraggingOut(false)}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropOver(true); }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropOver(false);
        onZoneDrop(e, zoneKey);
      }}
      style={{
        position: 'absolute',
        left: zone.x, top: zone.y, width: zone.w, height: zone.h,
        overflow: 'hidden',
        cursor: isSelected && photo?.url ? (isPanning ? 'grabbing' : 'grab') : 'pointer',
        outline: isSelected
          ? `2px solid ${accentColor}`
          : dropOver ? `2px dashed ${accentColor}88` : 'none',
        outlineOffset: isSelected ? -2 : 0,
        zIndex: isSelected ? 2 : 1,
        background: '#0A0A0A',
        userSelect: 'none',
        opacity: isDraggingOut ? 0.4 : 1,
        transition: 'opacity 150ms',
        boxSizing: 'border-box',
      }}
    >
      {photo?.url ? (
        <PhotoImageLayers
          url={photo.url}
          panX={panX} panY={panY} flipH={flipH}
          imgCSSW={imgCSSW} imgCSSH={imgCSSH}
          filterStr={filterStr} filterOpacity={presetOpacity ?? 1}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#0A0A0A',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dropOver && (
            <span style={{ fontSize: 10, color: accentColor, fontFamily: 'DM Sans, sans-serif' }}>
              Drop here
            </span>
          )}
        </div>
      )}

      {/* Zone label */}
      {/* Zone label: shows assigned photo number or slot number */}
      <div style={{
        position: 'absolute', top: 4, left: 4, zIndex: 3,
        background: photoIndex >= 0 ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)',
        color: photoIndex >= 0 ? '#aaa' : '#444',
        fontSize: 8, fontFamily: 'DM Mono, monospace',
        padding: '1px 4px', borderRadius: 2, pointerEvents: 'none',
        opacity: isSelected ? 0 : 1,
        transition: 'opacity 150ms',
      }}>
        {photoIndex >= 0 ? `#${photoIndex + 1}` : `Z${zoneIndex + 1}`}
      </div>

      {/* Reframe hint */}
      {isSelected && photo?.url && (
        <div style={{
          position: 'absolute', bottom: 5, left: 0, right: 0,
          textAlign: 'center', fontSize: 9, color: accentColor,
          fontFamily: 'DM Sans, sans-serif', pointerEvents: 'none',
          textShadow: '0 1px 4px rgba(0,0,0,1)',
        }}>
          drag to reframe · scroll to zoom
        </div>
      )}

      {/* Drop indicator overlay */}
      {dropOver && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          background: `${accentColor}18`,
          border: `2px dashed ${accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 11, color: accentColor, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            {photo?.url ? '⇄ Swap' : '+ Drop here'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── TEXT BLOCK ──────────────────────────────────────────────────────────────────
function TextBlock({ tb, isSelected, onClick, onUpdate, canvasW, canvasH }) {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const dragStart = useRef(null);

  // Use backgroundImage (not background shorthand) so it never resets backgroundClip
  const gradientStyle = tb.gradient ? {
    backgroundImage: `linear-gradient(${tb.gradient.angle ?? 135}deg, ${tb.gradient.stops.join(', ')})`,
    backgroundColor: 'transparent',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  } : { color: tb.color, backgroundImage: 'none', WebkitTextFillColor: 'unset' };

  const textStyle = {
    fontFamily: `"${tb.font}", sans-serif`,
    fontSize: tb.size,
    textAlign: tb.align || 'center',
    opacity: tb.opacity ?? 1,
    letterSpacing: `${tb.letterSpacing || 0}px`,
    lineHeight: tb.lineHeight || 1.2,
    textTransform: tb.transform || 'none',
    fontWeight: tb.bold ? 700 : 400,
    fontStyle: tb.italic ? 'italic' : 'normal',
    textShadow: tb.shadow ? `2px 2px ${tb.shadowIntensity || 4}px rgba(0,0,0,0.7)` : 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: tb.width || 400,
    outline: 'none',
    backgroundColor: 'transparent', // use backgroundColor, not background, to avoid clearing backgroundImage
    border: 'none',
    cursor: editing ? 'text' : 'move',
    resize: 'none',
    minHeight: 20,
    ...gradientStyle,
  };

  const pillStyle = tb.bgPill ? {
    background: tb.bgColor || 'rgba(0,0,0,0.55)', padding: '4px 12px', borderRadius: 4, display: 'inline-block',
  } : {};

  const handleMouseDown = (e) => {
    if (editing) return;
    e.stopPropagation();
    onClick(tb.id);
    dragStart.current = { mx: e.clientX, my: e.clientY, x: tb.x, y: tb.y };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const dx = ((e.clientX - dragStart.current.mx) / canvasW) * 100;
      const dy = ((e.clientY - dragStart.current.my) / canvasH) * 100;
      onUpdate(tb.id, {
        x: Math.max(0, Math.min(100, dragStart.current.x + dx)),
        y: Math.max(0, Math.min(100, dragStart.current.y + dy)),
      });
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [dragging, canvasW, canvasH, onUpdate, tb.id]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${tb.x}%`, top: `${tb.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        outline: isSelected ? '1px dashed rgba(255,255,255,0.25)' : 'none',
        outlineOffset: 4,
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setEditing(true)}
      onBlur={() => setEditing(false)}
    >
      <div style={pillStyle}>
        {editing ? (
          <textarea
            autoFocus
            value={tb.text}
            onChange={e => onUpdate(tb.id, { text: e.target.value })}
            onBlur={() => setEditing(false)}
            onMouseDown={e => e.stopPropagation()}
            style={{ ...textStyle, cursor: 'text', backgroundColor: 'transparent', padding: 0 }}
            rows={3}
          />
        ) : (
          <div style={textStyle}>{tb.text || 'Your Text Here'}</div>
        )}
      </div>
    </div>
  );
}

// ─── CANVAS EDITOR ────────────────────────────────────────────────────────────────
export default function CanvasEditor({
  slide, ratio, photos, mode, accentColor,
  selectedZone, setSelectedZone, selectedTextId, setSelectedTextId,
  onUpdateTextBlock, onAssignPhotoToZone, onUpdateZoom, onUpdateZoomPan, onSwapZones,
  logoDataUrl,
  explicitHeight,
}) {
  const containerRef = useRef();
  const wrapRef = useRef();
  const displayScaleRef = useRef(1);

  const canvasW = ratio.w;
  const canvasH = ratio.h;

  const tmpl = getTemplate(slide.templateId, TEMPLATE_CATEGORIES);
  const gutter = slide.borderSettings?.gutter ?? 4;
  const zones = useMemo(() => tmpl ? computeZones(tmpl, canvasW, canvasH, gutter) : [], [tmpl, canvasW, canvasH, gutter]);

  const bgColor = slide.borderSettings?.bgColor || '#000000';
  const vignette = slide.borderSettings?.vignette || tmpl?.vignette;

  const ib = slide.borderSettings?.innerBorder;
  const innerBorderStyle = ib && ib !== 'none' ? {
    position: 'absolute', inset: 0, zIndex: 9,
    boxShadow: `inset 0 0 0 ${ib.includes('thick') ? 40 : 2}px ${ib.includes('white') ? '#FFFFFF' : '#000000'}`,
    pointerEvents: 'none',
  } : null;

  const handleZoneClick = useCallback((zoneKey) => {
    setSelectedZone(prev => prev === zoneKey ? null : zoneKey);
    setSelectedTextId(null);
  }, [setSelectedZone, setSelectedTextId]);

  // Called from the non-passive wheel listener inside PhotoZone
  const handleZoomDelta = useCallback((zoneKey, deltaY) => {
    const current = slide.zoom?.scale?.[zoneKey];
    if (current == null) return;

    const zoneIdx = parseInt(zoneKey.replace('zone-', ''), 10);
    const zone = zones[zoneIdx]; // canvas units
    const photoId = slide.photoAssignments?.[zoneKey];
    const photo = photos.find(p => p.id === photoId);

    // Dynamic bounds based on photo and zone dimensions
    let minScale, maxScale;
    if (zone && photo?.w && photo?.h) {
      const coverScale = Math.max(zone.w / photo.w, zone.h / photo.h);
      const containScale = Math.min(zone.w / photo.w, zone.h / photo.h);
      minScale = containScale * 0.4; // zoom out past contain — see full image + breathing room
      maxScale = coverScale * 8;
    } else {
      minScale = 0.01;
      maxScale = 20;
    }

    const newScale = Math.max(minScale, Math.min(maxScale, current * Math.exp(-deltaY * 0.003)));
    onUpdateZoom(zoneKey, 'scale', newScale);
  }, [slide.zoom, slide.photoAssignments, zones, photos, onUpdateZoom]);

  const handleZonePan = useCallback((zoneKey, newPanX, newPanY) => {
    const s = displayScaleRef.current || 1;
    onUpdateZoomPan(zoneKey, newPanX / s, newPanY / s);
  }, [onUpdateZoomPan]);

  // Drop handler — handles both library→zone and zone→zone (swap)
  const handleZoneDrop = useCallback((e, toZone) => {
    e.preventDefault();
    const sourceType = e.dataTransfer.getData('sourceType');
    const photoId = e.dataTransfer.getData('photoId');
    const fromZone = e.dataTransfer.getData('sourceZone');

    if (sourceType === 'zone' && fromZone && fromZone !== toZone) {
      // Swap zone assignments
      onSwapZones(fromZone, toZone);
    } else if (photoId) {
      // Assign from library
      onAssignPhotoToZone(toZone, photoId);
    }
  }, [onAssignPhotoToZone, onSwapZones]);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === containerRef.current || e.currentTarget === e.target) {
      setSelectedZone(null);
      setSelectedTextId(null);
    }
  }, [setSelectedZone, setSelectedTextId]);

  // Scale canvas to fit available space
  const [displayScale, setDisplayScale] = useState(1);
  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const cw = wrapRef.current.clientWidth || wrapRef.current.offsetWidth || window.innerWidth;
      // explicitHeight is passed from MobileLayout to bypass iOS flex height bug
      const ch = explicitHeight || wrapRef.current.clientHeight || wrapRef.current.offsetHeight || (window.innerHeight - 260);
      const pad = 40;
      const s = Math.min((cw - pad) / canvasW, (ch - pad) / canvasH, 1);
      if (s > 0) {
        displayScaleRef.current = s;
        setDisplayScale(s);
      }
    };
    measure();
    const t1 = setTimeout(measure, 50);
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => { clearTimeout(t1); ro.disconnect(); };
  }, [canvasW, canvasH, explicitHeight]);

  const dispW = Math.round(canvasW * displayScale);
  const dispH = Math.round(canvasH * displayScale);

  return (
    <div
      ref={wrapRef}
      className="flex-1 flex items-center justify-center overflow-auto"
      style={{ background: '#0D0D0D', position: 'relative' }}
      onClick={handleCanvasClick}
    >
      {/* Floating canvas */}
      <div
        ref={containerRef}
        style={{
          width: dispW, height: dispH,
          background: bgColor,
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          boxShadow: '0 4px 48px rgba(0,0,0,0.95), 0 1px 12px rgba(0,0,0,0.6)',
        }}
        onClick={handleCanvasClick}
      >
        {/* Photo zones — rendered at display scale */}
        {zones.map((zone, i) => {
          const zoneKey = `zone-${i}`;
          const photoId = slide.photoAssignments?.[zoneKey];
          const photo = photos.find(p => p.id === photoId);
          const photoIndex = photoId ? photos.findIndex(p => p.id === photoId) : -1;
          const presetId = slide.presets?.[zoneKey] || slide.globalPreset || 'natural';
          const presetOpacity = slide.presetOpacity?.[zoneKey] ?? slide.globalPresetOpacity ?? 1;
          const scaledZone = {
            x: zone.x * displayScale, y: zone.y * displayScale,
            w: zone.w * displayScale, h: zone.h * displayScale,
          };

          // Compute explicit CSS image size from stored canvas-unit scale
          const storedScale = slide.zoom?.scale?.[zoneKey];
          let imgCSSW = null, imgCSSH = null;
          if (photo?.w && photo?.h && storedScale != null) {
            imgCSSW = photo.w * storedScale * displayScale;
            imgCSSH = photo.h * storedScale * displayScale;
          }

          return (
            <PhotoZone
              key={zoneKey}
              zone={scaledZone}
              zoneKey={zoneKey}
              zoneIndex={i}
              photoIndex={photoIndex}
              photo={photo}
              preset={presetId}
              presetOpacity={presetOpacity}
              accentColor={accentColor}
              isSelected={selectedZone === zoneKey}
              onClick={handleZoneClick}
              onZoomDelta={handleZoomDelta}
              flipH={photo?.flipH}
              panX={(slide.zoom?.x?.[zoneKey] || 0) * displayScale}
              panY={(slide.zoom?.y?.[zoneKey] || 0) * displayScale}
              imgCSSW={imgCSSW}
              imgCSSH={imgCSSH}
              onPan={handleZonePan}
              onZoneDragStart={() => {}}
              onZoneDrop={handleZoneDrop}
            />
          );
        })}

        {/* Template overlays */}
        {tmpl?.gradient && <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: tmpl.gradient, pointerEvents: 'none' }} />}
        {tmpl?.overlay && <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: tmpl.overlay, pointerEvents: 'none' }} />}
        {vignette && <div style={{ position: 'absolute', inset: 0, zIndex: 4, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none' }} />}
        {innerBorderStyle && <div style={innerBorderStyle} />}

        {/* Text blocks */}
        {(slide.textBlocks || []).map(tb => (
          <TextBlock
            key={tb.id} tb={tb}
            isSelected={selectedTextId === tb.id}
            onClick={(id) => { setSelectedTextId(id); setSelectedZone(null); }}
            onUpdate={onUpdateTextBlock}
            canvasW={dispW} canvasH={dispH}
          />
        ))}

        {/* Logo */}
        {slide.logoSettings?.enabled && logoDataUrl && (
          <LogoOverlay logoDataUrl={logoDataUrl} settings={slide.logoSettings} canvasW={dispW} canvasH={dispH} />
        )}
      </div>

      {/* Export size label */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: '#2A2A2A', fontFamily: 'DM Mono, monospace', pointerEvents: 'none',
      }}>
        {ratio.exportW}×{ratio.exportH}px
      </div>
    </div>
  );
}

function LogoOverlay({ logoDataUrl, settings, canvasW, canvasH }) {
  const lw = canvasW * (settings.scale || 0.15);
  const lx = canvasW * (settings.x || 0.85) - lw / 2;
  const ly = canvasH * (settings.y || 0.9) - lw * 0.3;
  return (
    <div style={{ position: 'absolute', left: lx, top: ly, zIndex: 8, opacity: settings.opacity ?? 1, pointerEvents: 'none' }}>
      <img src={logoDataUrl} alt="Logo" style={{ width: lw, height: 'auto', display: 'block' }} />
    </div>
  );
}
