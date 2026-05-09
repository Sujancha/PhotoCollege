import React, { useState } from 'react';
import { Download, ChevronDown, Layers, Type, Package, RotateCcw } from 'lucide-react';
import { RATIOS } from '../constants';

export default function TopBar({
  mode, setMode, currentRatio, setCurrentRatio, accentColor,
  onExportCurrent, onExportAll, onExportTikTok, exporting, exportProgress,
  onAddText, onBrandKit, onResetAllEffects,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState('jpg');

  return (
    <div className="flex items-center px-4 gap-4 flex-shrink-0"
      style={{ height: 52, background: '#141414', borderBottom: '1px solid #2A2A2A' }}>

      {/* App name */}
      <div className="flex items-center gap-2 mr-2">
        <Layers size={16} style={{ color: accentColor }} />
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 20,
          fontWeight: 600,
          color: '#F0F0F0',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          CAROUSEL STUDIO
        </span>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center rounded" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', overflow: 'hidden' }}>
        {['wedding', 'sports'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1 text-xs font-medium transition-all"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              background: mode === m ? accentColor : 'transparent',
              color: mode === m ? '#000' : '#888',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRight: m === 'wedding' ? '1px solid #2A2A2A' : 'none',
              cursor: 'pointer',
              border: 'none',
              padding: '5px 14px',
            }}
          >
            {m === 'wedding' ? 'Wedding' : 'Sports'}
          </button>
        ))}
      </div>

      {/* Ratio switcher */}
      <div className="flex items-center gap-1">
        {RATIOS.map(r => (
          <button
            key={r.id}
            onClick={() => setCurrentRatio(r.id)}
            className="px-2 py-1 text-xs rounded transition-all"
            style={{
              background: currentRatio === r.id ? accentColor : '#1A1A1A',
              color: currentRatio === r.id ? '#000' : '#888',
              border: '1px solid',
              borderColor: currentRatio === r.id ? accentColor : '#2A2A2A',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              cursor: 'pointer',
              padding: '3px 8px',
              fontWeight: currentRatio === r.id ? '600' : '400',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Reset All Effects */}
      <button
        onClick={onResetAllEffects}
        title="Reset all color presets and border effects on all slides"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded btn-hover"
        style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          color: '#666',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
        }}
      >
        <RotateCcw size={13} />
        Reset
      </button>

      {/* Add Text */}
      <button
        onClick={onAddText}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded btn-hover"
        style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          color: '#F0F0F0',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
        }}
      >
        <Type size={13} />
        Add Text
      </button>

      {/* Brand Kit */}
      <button
        onClick={onBrandKit}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded btn-hover"
        style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          color: '#888',
          cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
        }}
      >
        <Package size={13} />
        Brand Kit
      </button>

      {/* Export */}
      <div className="relative">
        <div className="flex items-center rounded overflow-hidden"
          style={{ border: `1px solid ${accentColor}` }}>
          <button
            onClick={() => onExportCurrent(exportFormat)}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs btn-hover"
            style={{
              background: accentColor,
              color: '#000',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: 12,
              border: 'none',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            <Download size={13} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={exporting}
            style={{
              background: accentColor,
              borderLeft: '1px solid rgba(0,0,0,0.2)',
              color: '#000',
              padding: '6px 6px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <ChevronDown size={12} />
          </button>
        </div>

        {showExportMenu && (
          <div
            className="absolute right-0 top-full mt-1 rounded overflow-hidden z-50"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', width: 210, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
          >
            {/* Format selector */}
            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Format</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['jpg', 'png'].map(f => (
                  <button key={f} onClick={() => setExportFormat(f)}
                    style={{ flex: 1, padding: '4px 0', fontSize: 10, background: exportFormat === f ? accentColor : '#252525', color: exportFormat === f ? '#000' : '#888', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 8, color: '#444', fontFamily: 'DM Sans', marginTop: 4 }}>
                {exportFormat === 'jpg' ? 'Max quality JPEG · smaller file' : 'Lossless PNG · full quality'}
              </div>
            </div>
            {[
              { label: 'Export Current Slide', action: () => { onExportCurrent(exportFormat); setShowExportMenu(false); } },
              { label: 'Export All as ZIP', action: () => { onExportAll(exportFormat); setShowExportMenu(false); } },
              { label: 'TikTok Ready (9:16)', action: () => { onExportTikTok(exportFormat); setShowExportMenu(false); } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-4 py-2.5 text-xs transition-all"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F0F0F0',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  display: 'block',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#252525'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {showExportMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
        )}
      </div>
    </div>
  );
}
