import React, { useState, useRef, useEffect } from 'react';
import { Trash2, ChevronDown, ChevronRight, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { FONT_BUCKETS, TEXT_COLOR_PRESETS, TEXT_PRESETS } from '../../constants';
import { loadGoogleFont } from '../../utils';

const GRADIENT_PRESETS = [
  { label: 'Gold',   angle: 135, stops: ['#C9A96E', '#F5E6C8', '#C9A96E'] },
  { label: 'Sunset', angle: 90,  stops: ['#FF6B35', '#FFD700'] },
  { label: 'Pink',   angle: 135, stops: ['#FFB3C6', '#C77DFF'] },
  { label: 'Ice',    angle: 135, stops: ['#A8EDEA', '#FED6E3'] },
  { label: 'Fire',   angle: 90,  stops: ['#FF0000', '#FF6B35', '#FFD700'] },
  { label: 'Ocean',  angle: 135, stops: ['#00A8FF', '#0050FF'] },
  { label: 'Silver', angle: 180, stops: ['#FFFFFF', '#888888'] },
  { label: 'Dawn',   angle: 135, stops: ['#FF9A9E', '#FAD0C4', '#FFD1FF'] },
];

const BG_OPTIONS = [
  { id: 'none',    label: 'None',     bgPill: false, bgColor: null,                    preview: 'transparent',          border: true },
  { id: 'dark50',  label: 'Dark 50%', bgPill: true,  bgColor: 'rgba(0,0,0,0.5)',        preview: 'rgba(0,0,0,0.5)'        },
  { id: 'dark80',  label: 'Dark 80%', bgPill: true,  bgColor: 'rgba(0,0,0,0.8)',        preview: 'rgba(0,0,0,0.8)'        },
  { id: 'light20', label: 'Light 20%',bgPill: true,  bgColor: 'rgba(255,255,255,0.2)',  preview: 'rgba(255,255,255,0.2)'  },
  { id: 'light70', label: 'Light 70%',bgPill: true,  bgColor: 'rgba(255,255,255,0.7)',  preview: 'rgba(255,255,255,0.7)'  },
  { id: 'black',   label: 'Black',    bgPill: true,  bgColor: '#000000',                preview: '#000000'                },
  { id: 'white',   label: 'White',    bgPill: true,  bgColor: '#FFFFFF',                preview: '#FFFFFF'                },
  { id: 'gold',    label: 'Gold',     bgPill: true,  bgColor: '#C9A96E',                preview: '#C9A96E'                },
];

function Label({ children }) {
  return (
    <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, accentColor }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: 32, height: 16, background: value ? accentColor : '#2A2A2A', borderRadius: 8, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 12, height: 12, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
    </button>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, unit = '' }) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (v) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 60);
  };

  const display = step < 1 ? Number(local).toFixed(step < 0.1 ? 2 : 1) : local;

  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace' }}>{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={local}
        onChange={e => handleChange(Number(e.target.value))}
        onMouseUp={e => { clearTimeout(timerRef.current); onChange(Number(e.target.value)); }}
        className="w-full"
      />
    </div>
  );
}

function BgPresets({ activeBgId, activeBgColor, onSelect, onCustomColor, accentColor, isCustomActive }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 6 }}>
        {BG_OPTIONS.map(bg => {
          const isActive = activeBgId === bg.id;
          return (
            <button key={bg.id} onClick={() => onSelect(bg)} title={bg.label}
              style={{ padding: '5px 4px', background: isActive ? '#1E1E1E' : '#111', border: `1px solid ${isActive ? accentColor : '#222'}`, borderRadius: 2, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
            >
              <div style={{ width: 28, height: 16, background: bg.preview, border: `1px solid ${bg.border ? '#444' : '#2A2A2A'}`, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 6, color: isActive ? accentColor : '#444', fontFamily: 'DM Sans', lineHeight: 1.1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%' }}>{bg.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 8, color: '#555', fontFamily: 'DM Sans' }}>Custom</span>
        <input type="color"
          value={activeBgColor && activeBgColor.startsWith('#') ? activeBgColor : '#000000'}
          onChange={e => onCustomColor(e.target.value)}
          style={{ width: 24, height: 20, padding: 0, border: `1px solid ${isCustomActive ? accentColor : '#2A2A2A'}`, cursor: 'pointer', background: 'transparent', borderRadius: 2 }}
        />
        {isCustomActive && <span style={{ fontSize: 7, color: accentColor, fontFamily: 'DM Sans' }}>Custom active</span>}
      </div>
    </>
  );
}

export default function TextPanel({ mode, selectedTextBlock, recentFonts, onUpdate, onDelete, onApplyQuickStyle, onAddWithStyle, accentColor }) {
  const [showFonts, setShowFonts] = useState(false);
  const [expandedBucket, setExpandedBucket] = useState(null);
  const [presetFilter, setPresetFilter] = useState('all');
  const [pendingBgId, setPendingBgId] = useState('none');
  const [pendingBgColor, setPendingBgColor] = useState('#000000');

  const orderedBuckets = [...FONT_BUCKETS].sort((a, b) => {
    if (mode === 'sports') {
      if (a.id === 'hype') return -1; if (b.id === 'hype') return 1;
      if (a.id === 'sports-headline') return -1; if (b.id === 'sports-headline') return 1;
    } else {
      if (a.id === 'romantic') return -1; if (b.id === 'romantic') return 1;
      if (a.id === 'handwritten') return -1; if (b.id === 'handwritten') return 1;
    }
    return 0;
  });

  const filteredPresets = presetFilter === 'all'
    ? TEXT_PRESETS
    : TEXT_PRESETS.filter(p => p.category === presetFilter);

  const tb = selectedTextBlock;
  const upd = tb ? (k, v) => onUpdate(tb.id, { [k]: v }) : null;

  const handlePreset = (preset) => {
    loadGoogleFont(preset.style.font);
    if (tb) {
      onApplyQuickStyle(preset.style);
    } else {
      const bgOpt = BG_OPTIONS.find(b => b.id === pendingBgId);
      const isCustom = pendingBgId === 'custom';
      const bgStyle = (bgOpt && bgOpt.id !== 'none')
        ? { bgPill: true, bgColor: bgOpt.bgColor }
        : isCustom
          ? { bgPill: true, bgColor: pendingBgColor }
          : { bgPill: false };
      onAddWithStyle({ ...preset.style, ...bgStyle });
    }
  };

  // Determine active bg state for selected text block
  const getActiveBgId = () => {
    if (!tb || !tb.bgPill) return 'none';
    const match = BG_OPTIONS.find(b => b.id !== 'none' && b.bgColor === tb.bgColor);
    return match ? match.id : 'custom';
  };

  const handleTbBgSelect = (bg) => {
    if (bg.id === 'none') {
      onUpdate(tb.id, { bgPill: false });
    } else {
      onUpdate(tb.id, { bgPill: true, bgColor: bg.bgColor });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

      {/* ── Style Presets strip ─────────────────────────── */}
      <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #222', background: '#141414', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>Style Presets</Label>
          <div style={{ display: 'flex', gap: 3 }}>
            {['all', 'wedding', 'couples', 'sports'].map(cat => (
              <button key={cat} onClick={() => setPresetFilter(cat)}
                style={{ fontSize: 7, padding: '2px 5px', background: presetFilter === cat ? accentColor : '#222', color: presetFilter === cat ? '#000' : '#555', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize', letterSpacing: '0.05em' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {filteredPresets.map(preset => {
            const hasGrad = !!preset.style.gradient;
            return (
              <button key={preset.id} onClick={() => handlePreset(preset)}
                title={`${preset.label} — click to ${tb ? 'apply style' : 'add to canvas'}`}
                style={{ height: 52, background: '#111', border: '1px solid #252525', borderRadius: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, overflow: 'hidden', padding: '3px 4px', transition: 'border-color 120ms' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '88'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#252525'}
              >
                <span style={{
                  fontFamily: `"${preset.preview}", sans-serif`,
                  fontSize: 15,
                  color: hasGrad ? 'transparent' : (preset.style.color || '#FFF'),
                  background: hasGrad ? `linear-gradient(${preset.style.gradient.angle}deg, ${preset.style.gradient.stops.join(', ')})` : 'none',
                  WebkitBackgroundClip: hasGrad ? 'text' : 'unset',
                  backgroundClip: hasGrad ? 'text' : 'unset',
                  fontStyle: preset.style.italic ? 'italic' : 'normal',
                  fontWeight: preset.style.bold ? 700 : 400,
                  maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'block', lineHeight: 1.2,
                }}>
                  {preset.style.transform === 'uppercase' ? 'AABB' : 'AaBb'}
                </span>
                <span style={{ fontSize: 7, color: '#444', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', lineHeight: 1.1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 8, color: '#3A3A3A', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
          {tb ? 'Click to apply to selected text' : 'Click to add text to canvas'}
        </div>
      </div>

      {/* ── No text selected ─────────────────────────────── */}
      {!tb ? (
        <div style={{ padding: '10px' }}>
          <div style={{ fontSize: 9, color: '#3A3A3A', fontFamily: 'DM Sans', lineHeight: 1.5, marginBottom: 12 }}>
            Select a text block to edit, or use the presets above to add text.
          </div>

          <Label>Text Background</Label>
          <div style={{ fontSize: 8, color: '#3A3A3A', fontFamily: 'DM Sans', marginBottom: 8 }}>
            Choose a background — applied when adding text via presets above
          </div>
          <BgPresets
            activeBgId={pendingBgId}
            activeBgColor={pendingBgColor}
            isCustomActive={pendingBgId === 'custom'}
            onSelect={bg => setPendingBgId(bg.id)}
            onCustomColor={c => { setPendingBgId('custom'); setPendingBgColor(c); }}
            accentColor={accentColor}
          />
        </div>
      ) : (
        <div style={{ padding: '10px' }}>

          {/* Font */}
          <div style={{ marginBottom: 10 }}>
            <Label>Font</Label>
            <button onClick={() => setShowFonts(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', cursor: 'pointer', borderRadius: 2, fontFamily: `"${tb.font}", sans-serif`, fontSize: 12 }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tb.font}</span>
              <ChevronDown size={12} style={{ color: '#555', flexShrink: 0 }} />
            </button>

            {showFonts && (
              <div style={{ marginTop: 2, background: '#111', border: '1px solid #2A2A2A', borderRadius: 2, maxHeight: 220, overflowY: 'auto' }}>
                {recentFonts.length > 0 && (
                  <div>
                    <div style={{ padding: '4px 10px', fontSize: 8, color: '#444', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent</div>
                    {recentFonts.map(f => (
                      <button key={f} onClick={() => { upd('font', f); loadGoogleFont(f); setShowFonts(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '5px 10px', background: 'transparent', border: 'none', color: tb.font === f ? accentColor : '#F0F0F0', cursor: 'pointer', fontFamily: `"${f}", sans-serif`, fontSize: 13, display: 'block' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >{f}</button>
                    ))}
                    <div style={{ borderBottom: '1px solid #222' }} />
                  </div>
                )}
                {orderedBuckets.map(bucket => (
                  <div key={bucket.id}>
                    <button
                      onClick={() => { setExpandedBucket(v => v === bucket.id ? null : bucket.id); bucket.fonts.forEach(loadGoogleFont); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 9, fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      {bucket.label}
                      {expandedBucket === bucket.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </button>
                    {expandedBucket === bucket.id && bucket.fonts.map(f => (
                      <button key={f} onClick={() => { upd('font', f); loadGoogleFont(f); setShowFonts(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '5px 14px', background: tb.font === f ? '#1A1A1A' : 'transparent', border: 'none', color: tb.font === f ? accentColor : '#CCC', cursor: 'pointer', fontFamily: `"${f}", sans-serif`, fontSize: 14, display: 'block' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1A1A1A'}
                        onMouseLeave={e => e.currentTarget.style.background = tb.font === f ? '#1A1A1A' : 'transparent'}
                      >{f}</button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Style toggles */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <button onClick={() => upd('bold', !tb.bold)}
              style={{ flex: 1, padding: '5px 0', background: tb.bold ? accentColor : '#111', border: `1px solid ${tb.bold ? accentColor : '#2A2A2A'}`, color: tb.bold ? '#000' : '#888', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bold size={12} />
            </button>
            <button onClick={() => upd('italic', !tb.italic)}
              style={{ flex: 1, padding: '5px 0', background: tb.italic ? accentColor : '#111', border: `1px solid ${tb.italic ? accentColor : '#2A2A2A'}`, color: tb.italic ? '#000' : '#888', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Italic size={12} />
            </button>
            {['uppercase', 'none', 'lowercase'].map(t => (
              <button key={t} onClick={() => upd('transform', t)}
                style={{ flex: 1, padding: '5px 0', fontSize: 8, background: tb.transform === t ? accentColor : '#111', border: `1px solid ${tb.transform === t ? accentColor : '#2A2A2A'}`, color: tb.transform === t ? '#000' : '#888', cursor: 'pointer', borderRadius: 2, fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>
                {t === 'uppercase' ? 'AA' : t === 'none' ? 'Aa' : 'aa'}
              </button>
            ))}
            {[{ id: 'left', Icon: AlignLeft }, { id: 'center', Icon: AlignCenter }, { id: 'right', Icon: AlignRight }].map(({ id, Icon }) => (
              <button key={id} onClick={() => upd('align', id)}
                style={{ flex: 1, padding: '5px 0', background: tb.align === id ? accentColor : '#111', border: `1px solid ${tb.align === id ? accentColor : '#2A2A2A'}`, color: tb.align === id ? '#000' : '#888', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={12} />
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #222', marginBottom: 10 }} />

          {/* Color: Solid or Gradient */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Label>Color</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 8, color: '#555', fontFamily: 'DM Sans' }}>Gradient</span>
                <Toggle
                  value={!!tb.gradient}
                  onChange={v => upd('gradient', v ? { angle: 135, stops: ['#C9A96E', '#FFFFFF'] } : null)}
                  accentColor={accentColor}
                />
              </div>
            </div>

            {!tb.gradient ? (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                {TEXT_COLOR_PRESETS.map(cp => (
                  <button key={cp.color} onClick={() => upd('color', cp.color)} title={cp.label}
                    style={{ width: 22, height: 22, background: cp.color, border: `2px solid ${tb.color === cp.color ? accentColor : '#2A2A2A'}`, cursor: 'pointer', borderRadius: '50%', flexShrink: 0 }}
                  />
                ))}
                <input type="color" value={tb.color} onChange={e => upd('color', e.target.value)}
                  title="Custom color"
                  style={{ width: 22, height: 22, padding: 0, border: '1px solid #2A2A2A', cursor: 'pointer', background: 'transparent', borderRadius: '50%' }}
                />
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                  {GRADIENT_PRESETS.map(gp => (
                    <button key={gp.label} onClick={() => upd('gradient', { angle: gp.angle, stops: gp.stops })} title={gp.label}
                      style={{ width: 30, height: 20, background: `linear-gradient(${gp.angle}deg, ${gp.stops.join(', ')})`, border: `2px solid ${JSON.stringify(tb.gradient?.stops) === JSON.stringify(gp.stops) ? accentColor : '#2A2A2A'}`, cursor: 'pointer', borderRadius: 3, flexShrink: 0 }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 7, color: '#555', fontFamily: 'DM Sans', marginBottom: 2 }}>From</div>
                    <input type="color" value={tb.gradient.stops[0]}
                      onChange={e => upd('gradient', { ...tb.gradient, stops: [e.target.value, ...tb.gradient.stops.slice(1)] })}
                      style={{ width: 34, height: 22, padding: 0, border: '1px solid #333', cursor: 'pointer', background: 'transparent', borderRadius: 3 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 7, color: '#555', fontFamily: 'DM Sans', marginBottom: 2 }}>Angle {tb.gradient.angle}°</div>
                    <input type="range" min={0} max={360} value={tb.gradient.angle}
                      onChange={e => upd('gradient', { ...tb.gradient, angle: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 7, color: '#555', fontFamily: 'DM Sans', marginBottom: 2 }}>To</div>
                    <input type="color" value={tb.gradient.stops[tb.gradient.stops.length - 1]}
                      onChange={e => { const s = [...tb.gradient.stops]; s[s.length - 1] = e.target.value; upd('gradient', { ...tb.gradient, stops: s }); }}
                      style={{ width: 34, height: 22, padding: 0, border: '1px solid #333', cursor: 'pointer', background: 'transparent', borderRadius: 3 }}
                    />
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: `linear-gradient(${tb.gradient.angle}deg, ${tb.gradient.stops.join(', ')})` }} />
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #222', marginBottom: 10 }} />

          {/* Sliders */}
          <Slider label="Font Size"      value={tb.size}                              min={12}  max={200} onChange={v => upd('size', v)}              unit="px" />
          <Slider label="Opacity"        value={Math.round((tb.opacity ?? 1) * 100)}  min={10}  max={100} onChange={v => upd('opacity', v / 100)}     unit="%" />
          <Slider label="Letter Spacing" value={tb.letterSpacing ?? 0}                min={-2}  max={20}  step={0.5} onChange={v => upd('letterSpacing', v)} unit="px" />
          <Slider label="Line Height"    value={tb.lineHeight ?? 1.2}                 min={0.8} max={2.5} step={0.05} onChange={v => upd('lineHeight', v)} />
          <Slider label="Width"          value={tb.width ?? 400}                      min={80}  max={800} step={10}  onChange={v => upd('width', v)}         unit="px" />

          <div style={{ borderTop: '1px solid #222', marginBottom: 10 }} />

          {/* Shadow */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Label>Text Shadow</Label>
              <Toggle value={!!tb.shadow} onChange={v => upd('shadow', v)} accentColor={accentColor} />
            </div>
            {tb.shadow && (
              <Slider label="Intensity" value={tb.shadowIntensity ?? 4} min={1} max={20} onChange={v => upd('shadowIntensity', v)} unit="px" />
            )}
          </div>

          {/* Text Background */}
          <div style={{ marginBottom: 14 }}>
            <Label>Text Background</Label>
            <BgPresets
              activeBgId={getActiveBgId()}
              activeBgColor={tb.bgColor || '#000000'}
              isCustomActive={getActiveBgId() === 'custom'}
              onSelect={handleTbBgSelect}
              onCustomColor={c => onUpdate(tb.id, { bgPill: true, bgColor: c })}
              accentColor={accentColor}
            />
          </div>

          {/* Delete */}
          <button onClick={() => onDelete(tb.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', background: '#1A1A1A', border: '1px solid #E6394622', color: '#E63946', cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}
          >
            <Trash2 size={13} />
            Delete Text Block
          </button>
        </div>
      )}
    </div>
  );
}
