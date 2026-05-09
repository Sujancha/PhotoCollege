import React, { useRef, useCallback, useState, useEffect } from 'react';
import { TEMPLATE_CATEGORIES, WEDDING_PRESETS, SPORTS_PRESETS } from '../constants';
import { getTemplate, computeZones } from '../utils';

function PhotoZone({ zone, zoneKey, photo, preset, accentColor, isSelected, onClick, onWheel, onDragStart, flipH, panX, panY, photoScale }) {
  const allPresets = [...WEDDING_PRESETS, ...SPORTS_PRESETS];
  const presetObj = allPresets.find(p => p.id === preset);
  const filterStr = presetObj?.filter || 'none';

  return (
    <div
      onClick={() => onClick(zoneKey)}
      onWheel={onWheel}
      style={{
        position: 'absolute',
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isSelected ? `inset 0 0 0 2px ${accentColor}` : 'none',
        zIndex: isSelected ? 2 : 1,
        background: '#0A0A0A',
      }}
      draggable={false}
    >
      {photo?.url ? (
        <img
          src={photo.url}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `calc(50% + ${panX || 0}px) calc(50% + ${panY || 0}px)`,
            transform: `scale(${photoScale || 1}) ${flipH ? 'scaleX(-1)' : ''}`,
            filter: filterStr,
            transformOrigin: 'center center',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#0A0A0A' }} />
      )}
    </div>
  );
}

function TextBlock({ tb, isSelected, onClick, onUpdate, canvasW, canvasH }) {
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const dragStart = useRef(null);
  const ref = useRef();

  const textStyle = {
    fontFamily: `"${tb.font}", sans-serif`,
    fontSize: tb.size,
    color: tb.color,
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
    background: 'transparent',
    border: 'none',
    cursor: editing ? 'text' : 'move',
    resize: 'none',
    minHeight: 20,
  };

  const pillStyle = tb.bgPill ? {
    background: 'rgba(0,0,0,0.55)',
    padding: '4px 12px',
    borderRadius: 4,
    display: 'inline-block',
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
        left: `${tb.x}%`,
        top: `${tb.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        outline: isSelected ? '1px dashed rgba(255,255,255,0.3)' : 'none',
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
            ref={ref}
            autoFocus
            value={tb.text}
            onChange={e => onUpdate(tb.id, { text: e.target.value })}
            onBlur={() => setEditing(false)}
            onMouseDown={e => e.stopPropagation()}
            style={{ ...textStyle, cursor: 'text', background: 'transparent', padding: 0 }}
            rows={3}
          />
        ) : (
          <div style={textStyle}>{tb.text || 'Your Text Here'}</div>
        )}
      </div>
    </div>
  );
}

export default function CanvasEditor({
  slide, ratio, photos, mode, accentColor,
  selectedZone, setSelectedZone, selectedTextId, setSelectedTextId,
  onUpdateTextBlock, onAssignPhotoToZone, onUpdateZoom,
  logoDataUrl, allPresets,
}) {
  const containerRef = useRef();

  const canvasW = ratio.w;
  const canvasH = ratio.h;

  const tmpl = getTemplate(slide.templateId, TEMPLATE_CATEGORIES);
  const gutter = slide.borderSettings?.gutter ?? 4;
  const zones = tmpl ? computeZones(tmpl, canvasW, canvasH, gutter) : [];

  const bgColor = slide.borderSettings?.bgColor || '#000000';
  const vignette = slide.borderSettings?.vignette || tmpl?.vignette;

  // Inner border
  const ib = slide.borderSettings?.innerBorder;
  const innerBorderStyle = ib && ib !== 'none' ? {
    position: 'absolute', inset: 0, zIndex: 9,
    boxShadow: `inset 0 0 0 ${ib.includes('thick') ? 40 : 2}px ${ib.includes('white') ? '#FFFFFF' : '#000000'}`,
    pointerEvents: 'none',
  } : null;

  const handleZoneClick = useCallback((zoneKey) => {
    setSelectedZone(zoneKey === selectedZone ? null : zoneKey);
    setSelectedTextId(null);
  }, [selectedZone, setSelectedZone, setSelectedTextId]);

  const handleZoneWheel = useCallback((e, zoneKey) => {
    e.preventDefault();
    const current = slide.zoom?.scale?.[zoneKey] ?? 1;
    const next = Math.max(0.5, Math.min(4, current - e.deltaY * 0.001));
    onUpdateZoom(zoneKey, 'scale', next);
  }, [slide.zoom, onUpdateZoom]);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === containerRef.current || e.currentTarget === e.target) {
      setSelectedZone(null);
      setSelectedTextId(null);
    }
  }, [setSelectedZone, setSelectedTextId]);

  // Handle photo drop onto canvas zone
  const handleZoneDrop = useCallback((e, zoneKey) => {
    e.preventDefault();
    const photoId = e.dataTransfer.getData('photoId');
    if (photoId) onAssignPhotoToZone(zoneKey, photoId);
  }, [onAssignPhotoToZone]);

  // Calculate display scale to fit canvas in available space
  const [displayScale, setDisplayScale] = useState(1);
  const wrapRef = useRef();
  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const { clientWidth: cw, clientHeight: ch } = wrapRef.current;
      const pad = 60;
      const scaleW = (cw - pad) / canvasW;
      const scaleH = (ch - pad) / canvasH;
      setDisplayScale(Math.min(scaleW, scaleH, 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [canvasW, canvasH]);

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
        className="canvas-wrapper relative flex-shrink-0"
        style={{
          width: dispW,
          height: dispH,
          background: bgColor,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 40px rgba(0,0,0,0.9), 0 1px 8px rgba(0,0,0,0.5)',
        }}
        onClick={handleCanvasClick}
      >
        {/* Photo zones */}
        {zones.map((zone, i) => {
          const zoneKey = `zone-${i}`;
          const photoId = slide.photoAssignments?.[zoneKey];
          const photo = photos.find(p => p.id === photoId);
          const presetId = slide.presets?.[zoneKey] || slide.globalPreset || 'natural';
          return (
            <div
              key={zoneKey}
              style={{
                position: 'absolute',
                left: zone.x * displayScale,
                top: zone.y * displayScale,
                width: zone.w * displayScale,
                height: zone.h * displayScale,
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleZoneDrop(e, zoneKey)}
            >
              <PhotoZone
                zone={{ x: 0, y: 0, w: zone.w * displayScale, h: zone.h * displayScale }}
                zoneKey={zoneKey}
                photo={photo}
                preset={presetId}
                accentColor={accentColor}
                isSelected={selectedZone === zoneKey}
                onClick={() => handleZoneClick(zoneKey)}
                onWheel={e => handleZoneWheel(e, zoneKey)}
                flipH={photo?.flipH}
                panX={(slide.zoom?.x?.[zoneKey] || 0) * displayScale}
                panY={(slide.zoom?.y?.[zoneKey] || 0) * displayScale}
                photoScale={slide.zoom?.scale?.[zoneKey] || 1}
              />
            </div>
          );
        })}

        {/* Gradient overlay */}
        {tmpl?.gradient && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: tmpl.gradient,
            pointerEvents: 'none',
          }} />
        )}

        {/* Color overlay */}
        {tmpl?.overlay && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: tmpl.overlay,
            pointerEvents: 'none',
          }} />
        )}

        {/* Vignette */}
        {vignette && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 4,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Inner border */}
        {innerBorderStyle && <div style={innerBorderStyle} />}

        {/* Text blocks */}
        {(slide.textBlocks || []).map(tb => (
          <TextBlock
            key={tb.id}
            tb={tb}
            isSelected={selectedTextId === tb.id}
            onClick={(id) => { setSelectedTextId(id); setSelectedZone(null); }}
            onUpdate={onUpdateTextBlock}
            canvasW={dispW}
            canvasH={dispH}
          />
        ))}

        {/* Logo */}
        {slide.logoSettings?.enabled && logoDataUrl && (
          <LogoOverlay
            logoDataUrl={logoDataUrl}
            settings={slide.logoSettings}
            canvasW={dispW}
            canvasH={dispH}
            accentColor={accentColor}
          />
        )}
      </div>

      {/* Canvas size indicator */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: '#333', fontFamily: 'DM Mono, monospace',
        pointerEvents: 'none',
      }}>
        {ratio.exportW}×{ratio.exportH}px export
      </div>
    </div>
  );
}

function LogoOverlay({ logoDataUrl, settings, canvasW, canvasH, accentColor }) {
  const lw = canvasW * (settings.scale || 0.15);
  const lx = canvasW * (settings.x || 0.85) - lw / 2;
  const ly = canvasH * (settings.y || 0.9) - lw * 0.3;

  return (
    <div style={{
      position: 'absolute', left: lx, top: ly, zIndex: 8,
      opacity: settings.opacity ?? 1,
      pointerEvents: 'none',
    }}>
      <img src={logoDataUrl} alt="Logo" style={{ width: lw, height: 'auto', display: 'block' }} />
    </div>
  );
}
