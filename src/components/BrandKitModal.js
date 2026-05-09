import React, { useState, useRef } from 'react';
import { X, Save, RotateCcw, Upload } from 'lucide-react';
import { FONT_BUCKETS, WEDDING_PRESETS, SPORTS_PRESETS } from '../constants';
import { loadGoogleFont } from '../utils';

function Label({ children }) {
  return <div style={{ fontSize: 9, color: '#666', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{children}</div>;
}

export default function BrandKitModal({ brandKit, onSave, onReset, onClose, accentColor }) {
  const [local, setLocal] = useState({ ...brandKit });
  const logoRef = useRef();

  const upd = (k, v) => setLocal(l => ({ ...l, [k]: v }));

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => upd('logoDataUrl', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const allFonts = FONT_BUCKETS.flatMap(b => b.fonts);
  const allPresets = [...WEDDING_PRESETS, ...SPORTS_PRESETS];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 480, background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 4, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#F0F0F0', letterSpacing: '0.05em' }}>
            Brand Kit
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Colors */}
          <div className="mb-5">
            <Label>Primary Accent Color</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={local.primaryColor || '#C9A96E'} onChange={e => upd('primaryColor', e.target.value)}
                style={{ width: 36, height: 36, padding: 2, border: '1px solid #2A2A2A', cursor: 'pointer', background: 'transparent', borderRadius: 2 }} />
              <input type="text" value={local.primaryColor || '#C9A96E'} onChange={e => upd('primaryColor', e.target.value)}
                style={{ flex: 1, background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', padding: '6px 10px', fontSize: 12, fontFamily: 'DM Mono, monospace', borderRadius: 2 }} />
            </div>
          </div>

          <div className="mb-5">
            <Label>Secondary Color</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={local.secondaryColor || '#FFFFFF'} onChange={e => upd('secondaryColor', e.target.value)}
                style={{ width: 36, height: 36, padding: 2, border: '1px solid #2A2A2A', cursor: 'pointer', background: 'transparent', borderRadius: 2 }} />
              <input type="text" value={local.secondaryColor || '#FFFFFF'} onChange={e => upd('secondaryColor', e.target.value)}
                style={{ flex: 1, background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', padding: '6px 10px', fontSize: 12, fontFamily: 'DM Mono, monospace', borderRadius: 2 }} />
            </div>
          </div>

          {/* Fonts */}
          <div className="mb-5">
            <Label>Display Font</Label>
            <select value={local.displayFont || 'Cormorant Garamond'} onChange={e => { upd('displayFont', e.target.value); loadGoogleFont(e.target.value); }}
              style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', padding: '6px 10px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', borderRadius: 2, cursor: 'pointer' }}>
              {allFonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <Label>Body Font</Label>
            <select value={local.bodyFont || 'DM Sans'} onChange={e => { upd('bodyFont', e.target.value); loadGoogleFont(e.target.value); }}
              style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', padding: '6px 10px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', borderRadius: 2, cursor: 'pointer' }}>
              {allFonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Default preset */}
          <div className="mb-5">
            <Label>Default Color Preset</Label>
            <select value={local.defaultPreset || 'natural'} onChange={e => upd('defaultPreset', e.target.value)}
              style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', color: '#F0F0F0', padding: '6px 10px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', borderRadius: 2, cursor: 'pointer' }}>
              {allPresets.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>

          {/* Logo */}
          <div className="mb-5">
            <Label>Brand Logo (PNG)</Label>
            {local.logoDataUrl ? (
              <div className="flex items-center gap-3">
                <img src={local.logoDataUrl} alt="Logo" style={{ height: 40, objectFit: 'contain', background: '#111', padding: 4, border: '1px solid #2A2A2A', borderRadius: 2 }} />
                <button onClick={() => logoRef.current?.click()}
                  style={{ fontSize: 11, color: '#888', background: '#111', border: '1px solid #2A2A2A', padding: '5px 10px', cursor: 'pointer', borderRadius: 2, fontFamily: 'DM Sans, sans-serif' }}>
                  Replace
                </button>
                <button onClick={() => upd('logoDataUrl', null)}
                  style={{ fontSize: 11, color: '#E63946', background: '#111', border: '1px solid #E6394622', padding: '5px 10px', cursor: 'pointer', borderRadius: 2, fontFamily: 'DM Sans, sans-serif' }}>
                  Remove
                </button>
              </div>
            ) : (
              <button onClick={() => logoRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded"
                style={{ background: '#111', border: '1px dashed #333', cursor: 'pointer', color: '#555' }}>
                <Upload size={14} />
                <span style={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>Upload PNG logo</span>
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/png" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </div>

          {/* Auto-apply toggle */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div style={{ fontSize: 12, color: '#F0F0F0', fontFamily: 'DM Sans, sans-serif' }}>Auto-apply to new slides</div>
              <div style={{ fontSize: 10, color: '#555', fontFamily: 'DM Sans, sans-serif' }}>Preset + logo applied automatically</div>
            </div>
            <button onClick={() => upd('autoApply', !local.autoApply)}
              style={{ width: 36, height: 18, background: local.autoApply ? accentColor : '#2A2A2A', borderRadius: 9, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 150ms' }}>
              <div style={{ position: 'absolute', top: 2, left: local.autoApply ? 20 : 2, width: 14, height: 14, background: '#fff', borderRadius: '50%', transition: 'left 150ms' }} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #2A2A2A' }}>
          <button onClick={() => { onReset(); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded btn-hover text-xs"
            style={{ background: '#111', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            <RotateCcw size={12} />Reset
          </button>
          <div className="flex-1" />
          <button onClick={onClose}
            className="px-4 py-2 rounded btn-hover text-xs"
            style={{ background: '#111', border: '1px solid #2A2A2A', color: '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded btn-hover text-xs"
            style={{ background: accentColor, border: 'none', color: '#000', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            <Save size={12} />Save Kit
          </button>
        </div>
      </div>
    </div>
  );
}
