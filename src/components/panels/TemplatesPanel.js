import React, { useState } from 'react';
import { TEMPLATE_CATEGORIES } from '../../constants';
import { ChevronDown, ChevronRight } from 'lucide-react';

function TemplateZonePreview({ template, w = 56, h = 56, bgColor = '#111', gutter = 2 }) {
  const zones = template.zones ? template.zones(w, h, gutter) : [];
  return (
    <div style={{ width: w, height: h, background: bgColor, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      {zones.map((z, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: z.x, top: z.y, width: z.w, height: z.h,
            background: '#2A2A2A',
            borderRadius: 1,
          }}
        />
      ))}
      {(template.outerBg) && (
        <div style={{ position: 'absolute', inset: 0, background: template.outerBg, zIndex: 0 }}>
          {zones.map((z, i) => (
            <div key={i} style={{ position: 'absolute', left: z.x, top: z.y, width: z.w, height: z.h, background: '#2A2A2A' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TemplatesPanel({ mode, currentTemplateId, onApply, accentColor }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    TEMPLATE_CATEGORIES.forEach(c => { init[c.id] = c.id === 'sports' ? mode === 'sports' : c.id === 'single'; });
    return init;
  });

  const orderedCats = [...TEMPLATE_CATEGORIES].sort((a, b) => {
    if (mode === 'sports') {
      if (a.id === 'sports') return -1;
      if (b.id === 'sports') return 1;
    } else {
      if (a.id === 'single') return -1;
      if (b.id === 'single') return 1;
    }
    return 0;
  });

  return (
    <div className="py-2">
      {orderedCats.map(cat => (
        <div key={cat.id}>
          <button
            onClick={() => setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }))}
            className="w-full flex items-center justify-between px-3 py-2 transition-all"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#888', fontFamily: 'DM Sans, sans-serif',
              fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#252525'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>{cat.label}</span>
            {expanded[cat.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>

          {expanded[cat.id] && (
            <div className="px-3 pb-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {cat.templates.map(tmpl => {
                const active = currentTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onApply(tmpl.id)}
                    className="template-card flex flex-col items-center gap-1.5 p-2 rounded"
                    style={{
                      background: active ? '#252525' : '#111',
                      border: `1px solid ${active ? accentColor : '#222'}`,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <TemplateZonePreview template={tmpl} w={52} h={52} />
                    <span style={{
                      fontSize: 9,
                      color: active ? accentColor : '#666',
                      fontFamily: 'DM Sans, sans-serif',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}>
                      {tmpl.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ borderBottom: '1px solid #222', margin: '0 12px' }} />
        </div>
      ))}
    </div>
  );
}
