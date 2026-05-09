import React from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { TEMPLATE_CATEGORIES } from '../constants';
import { getTemplate, computeZones } from '../utils';

function SlideMiniPreview({ slide, photos, ratio, accentColor, isActive, onClick, idx, compact }) {
  const tmpl = getTemplate(slide.templateId, TEMPLATE_CATEGORIES);
  const previewW = compact ? 32 : 60;
  const maxH = compact ? 44 : 100;
  const previewH = Math.min(Math.round(previewW * (ratio.h / ratio.w)), maxH);

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 cursor-pointer relative"
      style={{ width: previewW + 20, padding: '4px 10px' }}
    >
      <div
        className="slide-nav-thumb rounded-sm overflow-hidden"
        style={{
          width: previewW,
          height: previewH,
          background: slide.borderSettings?.bgColor || '#000',
          outline: isActive ? `2px solid ${accentColor}` : '1px solid #333',
          outlineOffset: isActive ? 2 : 0,
          position: 'relative',
        }}
      >
        {/* Mini preview — just show colored zones */}
        {tmpl && computeZones(tmpl, previewW, previewH, 1).map((zone, i) => {
          const photoId = slide.photoAssignments?.[`zone-${i}`];
          const photo = photos.find(p => p.id === photoId);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: zone.x,
                top: zone.y,
                width: zone.w,
                height: zone.h,
                overflow: 'hidden',
                background: '#1a1a1a',
              }}
            >
              {photo?.url && (
                <img
                  src={photo.url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: photo.flipH ? 'scaleX(-1)' : 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: 9,
        color: isActive ? accentColor : '#555',
        marginTop: 3,
        fontFamily: 'DM Mono, monospace',
      }}>
        {String(idx + 1).padStart(2, '0')}
      </div>
    </div>
  );
}

export default function SlideNavigator({
  slides, currentIdx, photos, accentColor, onSelect, onAdd, onRemove, onDuplicate, ratio, compact
}) {
  return (
    <div
      className="flex items-center flex-shrink-0 overflow-x-auto"
      style={{
        height: compact ? 68 : 90,
        background: '#111111',
        borderTop: '1px solid #222',
        paddingLeft: 8,
        paddingRight: 8,
        gap: 0,
      }}
    >
      {slides.map((slide, i) => (
        <SlideMiniPreview
          key={slide.id}
          slide={slide}
          photos={photos}
          ratio={ratio}
          accentColor={accentColor}
          isActive={i === currentIdx}
          onClick={() => onSelect(i)}
          idx={i}
          compact={compact}
        />
      ))}

      {/* Controls */}
      <div className="flex flex-row gap-1 px-2 flex-shrink-0">
        <button
          onClick={onAdd}
          title="Add Slide"
          className="flex items-center justify-center rounded btn-hover"
          style={{ width: 28, height: 28, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', color: '#888' }}
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => onDuplicate(currentIdx)}
          title="Duplicate (D)"
          className="flex items-center justify-center rounded btn-hover"
          style={{ width: 28, height: 28, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', color: '#888' }}
        >
          <Copy size={13} />
        </button>
        <button
          onClick={() => { if (slides.length > 1) onRemove(currentIdx); }}
          title="Remove Slide"
          className="flex items-center justify-center rounded btn-hover"
          style={{ width: 28, height: 28, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', color: '#555' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
