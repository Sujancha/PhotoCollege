import React, { useRef } from 'react';
import { Upload, Trash2, FlipHorizontal, RotateCw } from 'lucide-react';

function Label({ children }) {
  return <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{children}</div>;
}

function Toggle({ on, onToggle, accentColor }) {
  return (
    <button onClick={onToggle}
      style={{ width: 32, height: 16, background: on ? accentColor : '#2A2A2A', borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms' }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 12, height: 12, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
    </button>
  );
}

const POSITION_PRESETS = [
  { id: 'top-left',      label: 'Top Left',      x: 0.1,  y: 0.1  },
  { id: 'top-right',     label: 'Top Right',     x: 0.88, y: 0.1  },
  { id: 'bottom-left',   label: 'Bottom Left',   x: 0.1,  y: 0.9  },
  { id: 'bottom-center', label: 'Bottom Center', x: 0.5,  y: 0.9  },
  { id: 'bottom-right',  label: 'Bottom Right',  x: 0.88, y: 0.9  },
];

export default function LogoPanel({ logoSettings, logoDataUrl, onUpdate, onLogoUpload, accentColor, selectedZone, onFlipZone, onRotateZone }) {
  const fileRef = useRef();
  const ls = logoSettings || {};
  const upd = (k, v) => onUpdate({ ...ls, [k]: v });

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLogoUpload(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3">
      {/* Logo upload */}
      <div className="mb-4">
        <Label>Logo / Watermark</Label>
        {logoDataUrl ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center p-3 rounded" style={{ background: '#111', border: '1px dashed #333' }}>
              <img src={logoDataUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs btn-hover"
                style={{ background: '#111', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                <Upload size={11} />Replace
              </button>
              <button onClick={() => onLogoUpload(null)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded btn-hover"
                style={{ background: '#111', border: '1px solid #E6394622', color: '#E63946', cursor: 'pointer' }}>
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded"
            style={{ background: '#111', border: '1px dashed #333', cursor: 'pointer', color: '#555' }}>
            <Upload size={16} />
            <span style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif' }}>Upload PNG logo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/svg+xml" style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {logoDataUrl && (
        <>
          {/* Enable toggle */}
          <div className="flex items-center justify-between mb-4">
            <Label>Show on Canvas</Label>
            <Toggle on={ls.enabled} onToggle={() => upd('enabled', !ls.enabled)} accentColor={accentColor} />
          </div>

          {ls.enabled && (
            <>
              {/* Position presets */}
              <div className="mb-4">
                <Label>Quick Position</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {POSITION_PRESETS.map(pos => (
                    <button key={pos.id} onClick={() => onUpdate({ ...ls, x: pos.x, y: pos.y })}
                      className="py-1.5 rounded text-xs btn-hover"
                      style={{
                        background: '#111', border: `1px solid #222`,
                        color: '#777', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#252525'}
                      onMouseLeave={e => e.currentTarget.style.background = '#111'}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <Label>Size</Label>
                  <span style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace' }}>{Math.round((ls.scale || 0.15) * 100)}%</span>
                </div>
                <input type="range" min={5} max={60} value={Math.round((ls.scale || 0.15) * 100)}
                  onChange={e => upd('scale', e.target.value / 100)} className="w-full" />
              </div>

              {/* Opacity */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <Label>Opacity</Label>
                  <span style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace' }}>{Math.round((ls.opacity ?? 1) * 100)}%</span>
                </div>
                <input type="range" min={10} max={100} value={Math.round((ls.opacity ?? 1) * 100)}
                  onChange={e => upd('opacity', e.target.value / 100)} className="w-full" />
              </div>
            </>
          )}
        </>
      )}

      {/* Zone controls */}
      {selectedZone && (
        <>
          <div style={{ borderTop: '1px solid #222', margin: '12px 0' }} />
          <Label>Zone Controls ({selectedZone})</Label>
          <div className="flex gap-2">
            <button
              onClick={() => onFlipZone(selectedZone)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded btn-hover"
              style={{ background: '#111', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
            >
              <FlipHorizontal size={13} />
              Flip
            </button>
            <button
              onClick={() => onRotateZone(selectedZone)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded btn-hover"
              style={{ background: '#111', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
            >
              <RotateCw size={13} />
              Rotate 90°
            </button>
          </div>
        </>
      )}
    </div>
  );
}
