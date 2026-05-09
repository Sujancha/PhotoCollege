import React from 'react';

function Label({ children }) {
  return <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{children}</div>;
}

function Toggle({ on, onToggle, accentColor }) {
  return (
    <button onClick={onToggle}
      style={{ width: 32, height: 16, background: on ? accentColor : '#2A2A2A', borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 12, height: 12, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
    </button>
  );
}

export default function BordersPanel({ borderSettings, onUpdate, accentColor }) {
  const bs = borderSettings || {};
  const upd = (k, v) => onUpdate({ ...bs, [k]: v });

  const INNER_BORDERS = [
    { id: 'none', label: 'None' },
    { id: 'thin-white', label: 'Thin White' },
    { id: 'thin-black', label: 'Thin Black' },
    { id: 'thick-white', label: 'Thick White' },
    { id: 'thick-black', label: 'Thick Black' },
  ];

  return (
    <div className="p-3">
      {/* Background color */}
      <div className="mb-4">
        <Label>Background / Gap Color</Label>
        <div className="flex gap-2 items-center">
          <input type="color" value={bs.bgColor || '#000000'} onChange={e => upd('bgColor', e.target.value)}
            style={{ width: 28, height: 28, padding: 1, border: '1px solid #2A2A2A', cursor: 'pointer', background: 'transparent', borderRadius: 2 }} />
          <div className="flex gap-1.5">
            {['#000000', '#FFFFFF', '#1A1A1A', '#F5F0E8'].map(c => (
              <button key={c} onClick={() => upd('bgColor', c)}
                style={{ width: 20, height: 20, background: c, border: `2px solid ${bs.bgColor === c ? accentColor : '#333'}`, cursor: 'pointer', borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Gutter */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <Label>Gutter Size</Label>
          <span style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace' }}>{bs.gutter ?? 4}px</span>
        </div>
        <input type="range" min={0} max={24} value={bs.gutter ?? 4} onChange={e => upd('gutter', Number(e.target.value))} className="w-full" />
      </div>

      {/* Inner border */}
      <div className="mb-4">
        <Label>Inner Frame</Label>
        <div className="flex flex-col gap-1">
          {INNER_BORDERS.map(ib => (
            <button key={ib.id} onClick={() => upd('innerBorder', ib.id)}
              className="text-left px-2 py-1.5 rounded text-xs transition-all"
              style={{
                background: bs.innerBorder === ib.id ? '#252525' : '#111',
                border: `1px solid ${bs.innerBorder === ib.id ? accentColor : '#222'}`,
                color: bs.innerBorder === ib.id ? accentColor : '#777',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11,
              }}>
              {ib.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vignette */}
      <div className="flex items-center justify-between mb-4">
        <Label>Vignette Overlay</Label>
        <Toggle on={bs.vignette} onToggle={() => upd('vignette', !bs.vignette)} accentColor={accentColor} />
      </div>
    </div>
  );
}
