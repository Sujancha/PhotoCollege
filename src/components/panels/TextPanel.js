import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronRight, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { FONT_BUCKETS, TEXT_COLOR_PRESETS, QUICK_STYLES_WEDDING, QUICK_STYLES_SPORTS } from '../../constants';
import { loadGoogleFont } from '../../utils';

function Label({ children }) {
  return (
    <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, unit = '' }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function TextPanel({ mode, selectedTextBlock, recentFonts, onUpdate, onDelete, onApplyQuickStyle, accentColor }) {
  const [showFonts, setShowFonts] = useState(false);
  const [expandedBucket, setExpandedBucket] = useState(null);

  const quickStyles = mode === 'wedding' ? QUICK_STYLES_WEDDING : QUICK_STYLES_SPORTS;

  const orderedBuckets = [...FONT_BUCKETS].sort((a, b) => {
    if (mode === 'sports') {
      if (a.id === 'hype') return -1;
      if (b.id === 'hype') return 1;
      if (a.id === 'sports-headline') return -1;
      if (b.id === 'sports-headline') return 1;
    } else {
      if (a.id === 'romantic') return -1;
      if (b.id === 'romantic') return 1;
      if (a.id === 'handwritten') return -1;
      if (b.id === 'handwritten') return 1;
    }
    return 0;
  });

  if (!selectedTextBlock) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
        <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}>
          Select a text block on the canvas to edit it, or click <strong style={{ color: '#666' }}>Add Text</strong> in the top bar.
        </div>

        {/* Quick styles preview */}
        <div className="w-full mt-4">
          <Label>Quick Styles</Label>
          <div className="flex flex-col gap-1.5">
            {quickStyles.map(qs => (
              <div key={qs.id} style={{ fontSize: 9, color: '#444', fontFamily: 'DM Sans, sans-serif', padding: '6px 8px', background: '#111', borderRadius: 2, border: '1px solid #222' }}>
                {qs.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tb = selectedTextBlock;
  const upd = (k, v) => onUpdate(tb.id, { [k]: v });

  return (
    <div className="p-3">
      {/* Quick styles */}
      <div className="mb-4">
        <Label>Quick Styles</Label>
        <div className="flex flex-col gap-1">
          {quickStyles.map(qs => (
            <button
              key={qs.id}
              onClick={() => onApplyQuickStyle(qs.style)}
              className="text-left px-2 py-1.5 rounded text-xs transition-all"
              style={{
                background: '#111', border: '1px solid #222',
                color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                fontSize: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#252525'}
              onMouseLeave={e => e.currentTarget.style.background = '#111'}
            >
              {qs.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #222', marginBottom: 12 }} />

      {/* Font picker */}
      <div className="mb-3">
        <Label>Font</Label>
        <button
          onClick={() => setShowFonts(v => !v)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs"
          style={{ background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', cursor: 'pointer', fontFamily: `"${tb.font}", sans-serif` }}
        >
          <span style={{ fontSize: 12, fontFamily: `"${tb.font}", sans-serif` }}>{tb.font}</span>
          <ChevronDown size={12} style={{ color: '#555' }} />
        </button>

        {showFonts && (
          <div className="mt-1 rounded overflow-hidden" style={{ background: '#111', border: '1px solid #2A2A2A', maxHeight: 260, overflowY: 'auto' }}>
            {/* Recent fonts */}
            {recentFonts.length > 0 && (
              <div>
                <div className="px-3 py-1" style={{ fontSize: 8, color: '#444', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent</div>
                {recentFonts.map(f => (
                  <button key={f} onClick={() => { upd('font', f); loadGoogleFont(f); setShowFonts(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs"
                    style={{ background: 'transparent', border: 'none', color: tb.font === f ? accentColor : '#F0F0F0', cursor: 'pointer', fontFamily: `"${f}", sans-serif`, fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {f}
                  </button>
                ))}
                <div style={{ borderBottom: '1px solid #222', margin: '2px 0' }} />
              </div>
            )}

            {/* Buckets */}
            {orderedBuckets.map(bucket => (
              <div key={bucket.id}>
                <button
                  onClick={() => {
                    setExpandedBucket(v => v === bucket.id ? null : bucket.id);
                    bucket.fonts.forEach(loadGoogleFont);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5"
                  style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 9, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {bucket.label}
                  {expandedBucket === bucket.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                </button>
                {expandedBucket === bucket.id && bucket.fonts.map(f => (
                  <button key={f} onClick={() => { upd('font', f); loadGoogleFont(f); setShowFonts(false); }}
                    className="w-full text-left px-4 py-1.5"
                    style={{ background: tb.font === f ? '#1A1A1A' : 'transparent', border: 'none', color: tb.font === f ? accentColor : '#CCC', cursor: 'pointer', fontFamily: `"${f}", sans-serif`, fontSize: 14 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
                    onMouseLeave={e => e.currentTarget.style.background = tb.font === f ? '#1A1A1A' : 'transparent'}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <Slider label="Font Size" value={tb.size} min={12} max={200} onChange={v => upd('size', v)} unit="px" />

      {/* Bold / Italic / Transform */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => upd('bold', !tb.bold)}
          style={{ flex: 1, padding: '5px 0', background: tb.bold ? accentColor : '#111', border: `1px solid ${tb.bold ? accentColor : '#2A2A2A'}`, color: tb.bold ? '#000' : '#888', cursor: 'pointer', borderRadius: 2 }}>
          <Bold size={13} />
        </button>
        <button onClick={() => upd('italic', !tb.italic)}
          style={{ flex: 1, padding: '5px 0', background: tb.italic ? accentColor : '#111', border: `1px solid ${tb.italic ? accentColor : '#2A2A2A'}`, color: tb.italic ? '#000' : '#888', cursor: 'pointer', borderRadius: 2 }}>
          <Italic size={13} />
        </button>
        {['uppercase', 'none', 'lowercase'].map(t => (
          <button key={t} onClick={() => upd('transform', t)}
            style={{ flex: 1, padding: '5px 0', fontSize: 8, background: tb.transform === t ? accentColor : '#111', border: `1px solid ${tb.transform === t ? accentColor : '#2A2A2A'}`, color: tb.transform === t ? '#000' : '#888', cursor: 'pointer', borderRadius: 2, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em' }}>
            {t === 'uppercase' ? 'AA' : t === 'none' ? 'Aa' : 'aa'}
          </button>
        ))}
      </div>

      {/* Alignment */}
      <div className="flex gap-2 mb-3">
        {[{ id: 'left', Icon: AlignLeft }, { id: 'center', Icon: AlignCenter }, { id: 'right', Icon: AlignRight }].map(({ id, Icon }) => (
          <button key={id} onClick={() => upd('align', id)}
            style={{ flex: 1, padding: '5px 0', background: tb.align === id ? accentColor : '#111', border: `1px solid ${tb.align === id ? accentColor : '#2A2A2A'}`, color: tb.align === id ? '#000' : '#888', cursor: 'pointer', borderRadius: 2 }}>
            <Icon size={13} />
          </button>
        ))}
      </div>

      {/* Color presets */}
      <div className="mb-3">
        <Label>Color</Label>
        <div className="flex gap-1.5 flex-wrap mb-2">
          {TEXT_COLOR_PRESETS.map(cp => (
            <button
              key={cp.color}
              onClick={() => upd('color', cp.color)}
              title={cp.label}
              style={{
                width: 22, height: 22,
                background: cp.color,
                border: `2px solid ${tb.color === cp.color ? accentColor : '#2A2A2A'}`,
                cursor: 'pointer',
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
          ))}
          <input
            type="color"
            value={tb.color}
            onChange={e => upd('color', e.target.value)}
            title="Custom color"
            style={{ width: 22, height: 22, padding: 0, border: '1px solid #2A2A2A', cursor: 'pointer', background: 'transparent', borderRadius: '50%' }}
          />
        </div>
      </div>

      <Slider label="Opacity" value={Math.round((tb.opacity ?? 1) * 100)} min={10} max={100} onChange={v => upd('opacity', v / 100)} unit="%" />
      <Slider label="Letter Spacing" value={tb.letterSpacing ?? 0} min={-2} max={20} step={0.5} onChange={v => upd('letterSpacing', v)} unit="px" />
      <Slider label="Line Height" value={tb.lineHeight ?? 1.2} min={0.8} max={2.5} step={0.05} onChange={v => upd('lineHeight', v)} />
      <Slider label="Width" value={tb.width ?? 400} min={80} max={800} step={10} onChange={v => upd('width', v)} unit="px" />

      {/* Shadow */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <Label>Text Shadow</Label>
          <button onClick={() => upd('shadow', !tb.shadow)}
            style={{ width: 32, height: 16, background: tb.shadow ? accentColor : '#2A2A2A', borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms' }}>
            <div style={{ position: 'absolute', top: 2, left: tb.shadow ? 18 : 2, width: 12, height: 12, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
          </button>
        </div>
        {tb.shadow && (
          <Slider label="Intensity" value={tb.shadowIntensity ?? 4} min={1} max={20} onChange={v => upd('shadowIntensity', v)} unit="px" />
        )}
      </div>

      {/* Background pill */}
      <div className="flex items-center justify-between mb-4">
        <Label>Background Pill</Label>
        <button onClick={() => upd('bgPill', !tb.bgPill)}
          style={{ width: 32, height: 16, background: tb.bgPill ? accentColor : '#2A2A2A', borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms' }}>
          <div style={{ position: 'absolute', top: 2, left: tb.bgPill ? 18 : 2, width: 12, height: 12, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
        </button>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(tb.id)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded btn-hover"
        style={{ background: '#1A1A1A', border: '1px solid #E6394622', color: '#E63946', cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
      >
        <Trash2 size={13} />
        Delete Text Block
      </button>
    </div>
  );
}
