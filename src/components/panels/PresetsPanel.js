import React from 'react';

function PresetSwatch({ preset, isActive, onClick, accentColor }) {
  // Generate a sample color to represent the filter visually
  const swatchStyle = {
    width: 52,
    height: 38,
    background: preset.id === 'natural' ? 'linear-gradient(135deg, #888 0%, #444 100%)' :
      preset.id.includes('bw') || preset.id.includes('bypass') || preset.id.includes('impact') ?
        'linear-gradient(135deg, #aaa 0%, #333 100%)' :
        preset.id.includes('warm') || preset.id.includes('sunset') || preset.id.includes('dust') ?
          'linear-gradient(135deg, #C9A96E 0%, #7a5c2e 100%)' :
          preset.id.includes('cool') || preset.id.includes('blue') || preset.id.includes('neon') ?
            'linear-gradient(135deg, #6EB5C9 0%, #2e5a7a 100%)' :
            preset.id.includes('dark') || preset.id.includes('moody') ?
              'linear-gradient(135deg, #555 0%, #111 100%)' :
              preset.id.includes('airy') || preset.id.includes('pastel') || preset.id.includes('soft') ?
                'linear-gradient(135deg, #E8D8C8 0%, #C8B898 100%)' :
                preset.id.includes('punch') || preset.id.includes('warrior') || preset.id.includes('stadium') ?
                  'linear-gradient(135deg, #E05050 0%, #203060 100%)' :
                  'linear-gradient(135deg, #888 0%, #444 100%)',
    filter: preset.filter !== 'none' ? preset.filter : 'none',
    borderRadius: 2,
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <div
      className="preset-swatch flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
      style={{ outline: isActive ? `2px solid ${accentColor}` : 'none', outlineOffset: 2, borderRadius: 2 }}
    >
      <div style={swatchStyle} />
      <span style={{ fontSize: 8, color: isActive ? accentColor : '#555', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', maxWidth: 52, lineHeight: 1.2 }}>
        {preset.label}
      </span>
    </div>
  );
}

export default function PresetsPanel({ presets, slide, selectedZone, onApplyToZone, onApplyToAll, accentColor }) {
  const activeZonePreset = selectedZone ? (slide.presets?.[selectedZone] || slide.globalPreset || 'natural') : (slide.globalPreset || 'natural');

  return (
    <div className="p-3">
      {/* Info */}
      <div className="mb-3 px-2 py-2 rounded" style={{ background: '#111', border: '1px solid #222', fontSize: 10, color: '#666', fontFamily: 'DM Sans, sans-serif' }}>
        {selectedZone ? `Applying to: ${selectedZone}` : 'No zone selected — will apply to all'}
      </div>

      {/* Apply to all */}
      {selectedZone && (
        <button
          onClick={() => onApplyToAll(activeZonePreset)}
          className="w-full mb-3 py-1.5 rounded text-xs btn-hover"
          style={{ background: '#111', border: `1px solid ${accentColor}44`, color: accentColor, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11 }}
        >
          Apply to All Zones
        </button>
      )}

      {/* Preset grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {presets.map(preset => (
          <PresetSwatch
            key={preset.id}
            preset={preset}
            isActive={activeZonePreset === preset.id}
            accentColor={accentColor}
            onClick={() => selectedZone ? onApplyToZone(preset.id, selectedZone) : onApplyToAll(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}
