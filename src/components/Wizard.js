import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Upload, Check } from 'lucide-react';
import { RATIOS, TEMPLATE_CATEGORIES, MAX_PHOTOS } from '../constants';
import { generateId, computeZones } from '../utils';

loadGoogleFont('Cormorant Garamond');

function loadGoogleFont(name) {
  const id = `gfont-${name.replace(/\s/g, '-')}`;
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }
}

function ZonePreview({ tmpl, w = 52, h = 52 }) {
  const zones = tmpl?.zones ? computeZones(tmpl, w, h, 2) : [];
  return (
    <div style={{ width: w, height: h, background: '#0A0A0A', position: 'relative', overflow: 'hidden', borderRadius: 2, flexShrink: 0 }}>
      {zones.map((z, i) => (
        <div key={i} style={{ position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, background: '#2E2E2E', borderRadius: 1 }} />
      ))}
    </div>
  );
}

const STEP_TITLES = [
  'What are you shooting?',
  'Upload your photos',
  'Choose aspect ratio',
  'Pick a layout for slide 1',
];

export default function Wizard({ onComplete, initialPhotos = [], accentColor }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [ratio, setRatio] = useState('4:5');
  const [templateId, setTemplateId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  // canNext indexed by step
  const canNext = [!!mode, photos.length > 0, !!ratio, !!templateId][step];

  const processFiles = useCallback((files) => {
    const valid = ['image/jpeg', 'image/png', 'image/webp'];
    let pending = 0;
    const newPhotos = [];
    Array.from(files).forEach(file => {
      if (!valid.includes(file.type)) return;
      pending++;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newPhotos.push({ id: generateId(), url, name: file.name, w: img.naturalWidth, h: img.naturalHeight, flipH: false });
        if (--pending === 0) setPhotos(p => [...p, ...newPhotos].slice(0, MAX_PHOTOS));
      };
      img.onerror = () => { pending--; };
      img.src = url;
    });
  }, []);

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#080808',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      overflowY: 'auto',
      padding: '24px 0',
    }}>

      {/* Logo + title */}
      <div style={{ textAlign: 'center', marginBottom: 28, flexShrink: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>
          CAROUSEL STUDIO
        </div>
        <div style={{ fontSize: 24, color: '#E8E8E8', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 400 }}>
          {STEP_TITLES[step]}
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 32, alignItems: 'center', flexShrink: 0 }}>
        {STEP_TITLES.map((_, i) => (
          <div key={i} style={{ height: 3, borderRadius: 2, background: i <= step ? accentColor : '#222', width: i === step ? 24 : 8, transition: 'all 300ms ease' }} />
        ))}
      </div>

      {/* Step content */}
      <div style={{ width: '100%', maxWidth: 560, padding: '0 20px', flexShrink: 0 }}>

        {/* Step 0: Mode */}
        {step === 0 && (
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { id: 'wedding', label: 'Wedding & Couples', sub: 'Ceremonies · Portraits · Events', icon: '💍' },
              { id: 'sports',  label: 'Sports & Action',  sub: 'Teams · Athletes · Highlights',   icon: '⚡' },
            ].map(m => (
              <button key={m.id}
                onClick={() => { setMode(m.id); next(); }}
                style={{ flex: 1, padding: '28px 16px', background: '#111', border: `1px solid ${mode === m.id ? accentColor : '#252525'}`, borderRadius: 5, cursor: 'pointer', textAlign: 'center', transition: 'border-color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '88'}
                onMouseLeave={e => e.currentTarget.style.borderColor = mode === m.id ? accentColor : '#252525'}
              >
                <div style={{ fontSize: 30, marginBottom: 12 }}>{m.icon}</div>
                <div style={{ fontSize: 15, color: '#E8E8E8', fontWeight: 600, marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: '#555', lineHeight: 1.4 }}>{m.sub}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <div>
            <div
              style={{ border: `2px dashed ${dragOver ? accentColor : '#2A2A2A'}`, borderRadius: 4, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: dragOver ? accentColor + '08' : 'transparent', transition: 'all 150ms', marginBottom: 14 }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
            >
              <Upload size={20} style={{ color: dragOver ? accentColor : '#3A3A3A' }} />
              <div style={{ fontSize: 13, color: '#555' }}>Drop photos here or click to browse</div>
              <div style={{ fontSize: 10, color: '#333' }}>JPEG · PNG · WEBP · up to {MAX_PHOTOS} photos</div>
              <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }} onChange={e => processFiles(e.target.files)} />
            </div>

            {photos.length > 0 ? (
              <div>
                <div style={{ fontSize: 10, color: '#555', marginBottom: 8, fontFamily: 'DM Mono, monospace' }}>
                  {photos.length} / {MAX_PHOTOS} photos loaded
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
                  {photos.slice(0, 24).map(p => (
                    <div key={p.id} style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 2, background: '#111' }}>
                      <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                  {photos.length > 24 && (
                    <div style={{ aspectRatio: '1', background: '#111', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#555' }}>
                      +{photos.length - 24}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 10, color: '#333', textAlign: 'center' }}>
                Upload at least one photo to continue.
              </div>
            )}
          </div>
        )}

        {/* Step 2: Ratio */}
        {step === 2 && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {RATIOS.map(r => {
              const aspect = r.w / r.h;
              const baseH = 90;
              const baseW = 90;
              const h = aspect >= 1 ? Math.round(baseH * (r.h / r.w)) : baseH;
              const w = aspect < 1 ? Math.round(baseW * (r.w / r.h)) : baseW;
              const sel = ratio === r.id;
              return (
                <button key={r.id}
                  onClick={() => setRatio(r.id)}
                  style={{ padding: '14px 10px', background: sel ? '#1A1A1A' : '#111', border: `1px solid ${sel ? accentColor : '#252525'}`, borderRadius: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transition: 'border-color 150ms', minWidth: 70 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '88'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = sel ? accentColor : '#252525'}
                >
                  <div style={{ width: w, height: h, background: sel ? accentColor + '22' : '#1E1E1E', border: `1px solid ${sel ? accentColor : '#333'}`, borderRadius: 2 }} />
                  <div style={{ fontSize: 11, color: sel ? accentColor : '#666', fontFamily: 'DM Mono, monospace' }}>{r.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Template */}
        {step === 3 && (
          <div style={{ maxHeight: 360, overflowY: 'auto', scrollbarWidth: 'thin' }}>
            {TEMPLATE_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>{cat.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {cat.templates.map(tmpl => {
                    const sel = templateId === tmpl.id;
                    return (
                      <button key={tmpl.id}
                        onClick={() => setTemplateId(tmpl.id)}
                        style={{ padding: 8, background: sel ? '#1A1A1A' : '#111', border: `1px solid ${sel ? accentColor : '#252525'}`, borderRadius: 3, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'border-color 150ms' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '88'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = sel ? accentColor : '#252525'}
                      >
                        <ZonePreview tmpl={tmpl} />
                        <div style={{ fontSize: 8, color: sel ? accentColor : '#666', textAlign: 'center', lineHeight: 1.3 }}>{tmpl.label}</div>
                        <div style={{ fontSize: 7, color: '#3A3A3A' }}>{tmpl.slots} photo{tmpl.slots !== 1 ? 's' : ''}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {step > 0 && (
          <button onClick={back}
            style={{ padding: '9px 18px', background: 'transparent', border: '1px solid #2A2A2A', color: '#555', cursor: 'pointer', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, transition: 'border-color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}
          >
            <ArrowLeft size={13} /> Back
          </button>
        )}

        {step < 3 ? (
          <button onClick={next} disabled={!canNext}
            style={{ padding: '9px 26px', background: canNext ? accentColor : '#181818', border: `1px solid ${canNext ? accentColor : '#252525'}`, color: canNext ? '#000' : '#383838', cursor: canNext ? 'pointer' : 'default', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, transition: 'all 150ms' }}
          >
            Continue <ArrowRight size={13} />
          </button>
        ) : (
          <button onClick={() => canNext && onComplete({ mode, photos, ratio, templateId })} disabled={!canNext}
            style={{ padding: '10px 28px', background: canNext ? accentColor : '#181818', border: `1px solid ${canNext ? accentColor : '#252525'}`, color: canNext ? '#000' : '#383838', cursor: canNext ? 'pointer' : 'default', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, transition: 'all 150ms' }}
          >
            <Check size={14} /> Start Creating
          </button>
        )}
      </div>
    </div>
  );
}
