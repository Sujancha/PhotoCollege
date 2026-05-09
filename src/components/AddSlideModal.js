import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RATIOS, TEMPLATE_CATEGORIES, VIBE_TEMPLATE_ORDER } from '../constants';
import { computeZones } from '../utils';

function ZonePreview({ tmpl, w = 46, h = 46 }) {
  const zones = tmpl?.zones ? computeZones(tmpl, w, h, 2) : [];
  return (
    <div style={{ width: w, height: h, background: '#0A0A0A', position: 'relative', overflow: 'hidden', borderRadius: 2, flexShrink: 0 }}>
      {zones.map((z, i) => (
        <div key={i} style={{ position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, background: '#2E2E2E', borderRadius: 1 }} />
      ))}
    </div>
  );
}

export default function AddSlideModal({ onAdd, onClose, defaultRatio = '4:5', vibe, accentColor }) {
  const [ratio, setRatio] = useState(defaultRatio);
  const [templateId, setTemplateId] = useState(null);

  const sortedCategories = vibe && VIBE_TEMPLATE_ORDER[vibe]
    ? [...TEMPLATE_CATEGORIES].sort((a, b) => {
        const order = VIBE_TEMPLATE_ORDER[vibe];
        const ai = order.indexOf(a.id); const bi = order.indexOf(b.id);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
    : TEMPLATE_CATEGORIES;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 5, width: 500, maxHeight: '82vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#E0E0E0', fontWeight: 600 }}>New Slide</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>

          {/* Ratio */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Aspect Ratio</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {RATIOS.map(r => {
                const sel = ratio === r.id;
                return (
                  <button key={r.id} onClick={() => setRatio(r.id)}
                    style={{ flex: 1, padding: '7px 4px', background: sel ? '#1E1E1E' : '#111', border: `1px solid ${sel ? accentColor : '#2A2A2A'}`, borderRadius: 2, cursor: 'pointer', fontSize: 10, color: sel ? accentColor : '#666', fontFamily: 'DM Mono, monospace', transition: 'all 120ms' }}>
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates */}
          <div>
            <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Layout</div>
            {sortedCategories.map(cat => (
              <div key={cat.id} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 8, color: '#3A3A3A', marginBottom: 6, letterSpacing: '0.08em' }}>{cat.label}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {cat.templates.map(tmpl => {
                    const sel = templateId === tmpl.id;
                    return (
                      <button key={tmpl.id} onClick={() => setTemplateId(tmpl.id)}
                        style={{ padding: 6, background: sel ? '#1E1E1E' : '#111', border: `1px solid ${sel ? accentColor : '#252525'}`, borderRadius: 2, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 120ms' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = accentColor + '66'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = sel ? accentColor : '#252525'}
                      >
                        <ZonePreview tmpl={tmpl} />
                        <div style={{ fontSize: 7, color: sel ? accentColor : '#555', whiteSpace: 'nowrap' }}>{tmpl.slots}ph</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose}
            style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #2A2A2A', color: '#666', cursor: 'pointer', borderRadius: 2, fontSize: 11 }}>
            Cancel
          </button>
          <button onClick={() => templateId && onAdd({ ratio, templateId })} disabled={!templateId}
            style={{ padding: '7px 18px', background: templateId ? accentColor : '#1A1A1A', border: 'none', color: templateId ? '#000' : '#3A3A3A', cursor: templateId ? 'pointer' : 'default', borderRadius: 2, fontSize: 11, fontWeight: 700, transition: 'all 150ms' }}>
            Create Slide
          </button>
        </div>
      </div>
    </div>
  );
}
