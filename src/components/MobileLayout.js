import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Layers, Image as ImageIcon, LayoutGrid, Palette,
  Type, MoreHorizontal, Upload, X, RotateCcw, ChevronDown,
} from 'lucide-react';
import CanvasEditor from './CanvasEditor';
import SlideNavigator from './SlideNavigator';
import TemplatesPanel from './panels/TemplatesPanel';
import PresetsPanel from './panels/PresetsPanel';
import TextPanel from './panels/TextPanel';
import BordersPanel from './panels/BordersPanel';
import LogoPanel from './panels/LogoPanel';
import { RATIOS } from '../constants';
import { generateId } from '../utils';

const TABS = [
  { id: 'photos',    label: 'Photos',   Icon: ImageIcon },
  { id: 'templates', label: 'Layout',   Icon: LayoutGrid },
  { id: 'presets',   label: 'Presets',  Icon: Palette },
  { id: 'text',      label: 'Text',     Icon: Type },
  { id: 'more',      label: 'More',     Icon: MoreHorizontal },
];

// ─── Mobile Photos Panel ─────────────────────────────────────────────────────
function MobilePhotosPanel({ photos, currentSlide, selectedZone, onAssign, onUnassign, onAdd, onRemove, accentColor }) {
  const fileRef = useRef();

  const processFiles = useCallback((files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const newPhotos = [];
    let pending = 0;
    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) return;
      pending++;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newPhotos.push({ id: generateId(), url, name: file.name, w: img.naturalWidth, h: img.naturalHeight, flipH: false });
        pending--;
        if (pending === 0) onAdd(newPhotos);
      };
      img.onerror = () => { pending--; if (pending === 0 && newPhotos.length) onAdd(newPhotos); };
      img.src = url;
    });
  }, [onAdd]);

  // Build assignment lookup
  const assignments = useMemo(() => currentSlide?.photoAssignments || {}, [currentSlide?.photoAssignments]);
  const photoZoneMap = useMemo(() => {
    const map = {};
    Object.entries(assignments).forEach(([zoneKey, photoId]) => {
      const idx = parseInt(zoneKey.replace('zone-', ''), 10);
      map[photoId] = { key: zoneKey, label: `Z${idx + 1}` };
    });
    return map;
  }, [assignments]);

  return (
    <div style={{ padding: '10px 12px' }}>
      {selectedZone ? (
        <div style={{ marginBottom: 10, padding: '7px 10px', background: '#111', border: `1px solid ${accentColor}44`, borderRadius: 4, fontSize: 11, color: accentColor, fontFamily: 'DM Sans, sans-serif' }}>
          Tap a photo to assign it to <strong>{selectedZone.replace('zone-', 'Slot ')}</strong>
        </div>
      ) : (
        <div style={{ marginBottom: 10, padding: '7px 10px', background: '#111', border: '1px solid #2A2A2A', borderRadius: 4, fontSize: 11, color: '#555', fontFamily: 'DM Sans, sans-serif' }}>
          Tap a canvas zone first, then tap a photo to assign it.
        </div>
      )}

      {/* Import */}
      <button
        onClick={() => fileRef.current.click()}
        style={{ width: '100%', padding: '11px', marginBottom: 10, background: '#1A1A1A', border: '1px dashed #3A3A3A', color: '#888', cursor: 'pointer', borderRadius: 4, fontSize: 12, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
      >
        <Upload size={14} /> Import Photos
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }}
        onChange={e => { processFiles(e.target.files); e.target.value = ''; }} />

      {photos.length === 0 && (
        <div style={{ textAlign: 'center', color: '#333', fontSize: 11, fontFamily: 'DM Sans, sans-serif', padding: '20px 0' }}>
          No photos yet — tap Import to add some.
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {photos.map((photo, idx) => {
          const zone = photoZoneMap[photo.id];
          const isInSelected = zone?.key === selectedZone;
          return (
            <div
              key={photo.id}
              style={{ position: 'relative', aspectRatio: '1', cursor: selectedZone ? 'pointer' : 'default', borderRadius: 4, overflow: 'hidden', border: `2px solid ${isInSelected ? accentColor : zone ? accentColor + '55' : '#2A2A2A'}`, background: '#111' }}
              onClick={() => {
                if (!selectedZone) return;
                if (isInSelected) onUnassign(selectedZone);
                else onAssign(selectedZone, photo.id);
              }}
            >
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {/* Index badge */}
              <div style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,0.72)', color: '#888', fontSize: 8, fontFamily: 'DM Mono, monospace', fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>
                {idx + 1}
              </div>
              {/* Zone badge */}
              {zone && (
                <div style={{ position: 'absolute', bottom: 3, left: 3, background: accentColor, color: '#000', fontSize: 8, fontFamily: 'DM Mono, monospace', fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>
                  {zone.label}
                </div>
              )}
              {/* Remove */}
              <button
                onClick={e => { e.stopPropagation(); onRemove(photo.id); }}
                style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, background: 'rgba(0,0,0,0.75)', border: 'none', color: '#aaa', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile More Panel (Borders + Logo) ──────────────────────────────────────
function MobileMorePanel({ currentSlide, updateCurrentSlide, logoDataUrl, setLogoDataUrl, brandKit, selectedZone, flipPhotoInZone, accentColor }) {
  return (
    <div>
      <div style={{ padding: '10px 12px 4px', fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Borders &amp; Effects
      </div>
      <BordersPanel
        borderSettings={currentSlide.borderSettings}
        onUpdate={bs => updateCurrentSlide({ borderSettings: { ...currentSlide.borderSettings, ...bs } })}
        accentColor={accentColor}
      />
      <div style={{ height: 1, background: '#222', margin: '4px 0' }} />
      <div style={{ padding: '10px 12px 4px', fontSize: 9, color: '#555', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Logo
      </div>
      <LogoPanel
        logoSettings={currentSlide.logoSettings}
        logoDataUrl={brandKit?.logoDataUrl || logoDataUrl}
        onUpdate={ls => updateCurrentSlide({ logoSettings: { ...currentSlide.logoSettings, ...ls } })}
        onLogoUpload={setLogoDataUrl}
        accentColor={accentColor}
        selectedZone={selectedZone}
        onFlipZone={flipPhotoInZone}
      />
    </div>
  );
}

// ─── Main Mobile Layout ───────────────────────────────────────────────────────
export default function MobileLayout({
  mode, setMode, displayRatio, setCurrentRatio, accentColor,
  slides, currentSlideIdx, setCurrentSlideIdx,
  photos, handlePhotosAdded, removePhoto,
  currentSlide, ratio,
  selectedZone, setSelectedZone, selectedTextId, setSelectedTextId,
  logoDataUrl, setLogoDataUrl, brandKit,
  assignPhotoToZone, unassignZone,
  updateTextBlock, deleteTextBlock, addTextBlock, addTextBlockWithStyle,
  applyTemplate, applyPresetToZone, applyPresetToAll, updatePresetOpacity,
  updateZoom, updateZoomPan, swapZonePhotos, flipPhotoInZone,
  updateCurrentSlide,
  resetAllEffects, applyQuickStyle,
  exportCurrentSlide, exporting, exportProgress,
  setShowAddSlide, removeSlide, duplicateSlide,
  presets, recentFonts, selectedTextBlock,
}) {
  const [activeTab, setActiveTab] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('jpg');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const openTab = (tabId) => {
    if (activeTab === tabId && panelOpen) {
      setPanelOpen(false);
    } else {
      setActiveTab(tabId);
      setPanelOpen(true);
    }
  };

  const handleAddText = () => {
    addTextBlock();
    setActiveTab('text');
    setPanelOpen(true);
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0F0F0F', overflow: 'hidden' }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#141414', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
        {/* Row 1: Logo + Mode + Export */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
          <Layers size={14} style={{ color: accentColor, flexShrink: 0 }} />
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 17, fontWeight: 600, color: '#F0F0F0', letterSpacing: '0.05em', flex: 1 }}>
            CAROUSEL STUDIO
          </span>

          {/* Mode toggle */}
          <div style={{ display: 'flex', borderRadius: 3, overflow: 'hidden', border: '1px solid #2A2A2A', flexShrink: 0 }}>
            {['wedding', 'sports'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ padding: '5px 10px', fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: mode === m ? accentColor : 'transparent', color: mode === m ? '#000' : '#555', border: 'none', cursor: 'pointer' }}>
                {m === 'wedding' ? 'WED' : 'SPT'}
              </button>
            ))}
          </div>

          {/* Export button + dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ display: 'flex', borderRadius: 3, overflow: 'hidden', border: `1px solid ${accentColor}` }}>
              <button
                onClick={() => exportCurrentSlide(currentSlide, exportFormat)}
                disabled={exporting}
                style={{ padding: '6px 12px', background: accentColor, color: '#000', border: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif', cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
                {exporting ? '…' : 'Export'}
              </button>
              <button onClick={() => setShowExportMenu(v => !v)}
                style={{ padding: '6px 7px', background: accentColor, color: '#000', border: 'none', borderLeft: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                <ChevronDown size={11} />
              </button>
            </div>

            {showExportMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 4, width: 180, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.7)' }}>
                {/* Format toggle */}
                <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #2A2A2A' }}>
                  <div style={{ fontSize: 8, color: '#555', fontFamily: 'DM Sans', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Format</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['jpg', 'png'].map(f => (
                      <button key={f} onClick={() => setExportFormat(f)}
                        style={{ flex: 1, padding: '4px 0', fontSize: 10, background: exportFormat === f ? accentColor : '#252525', color: exportFormat === f ? '#000' : '#888', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  { label: 'Export This Slide', action: () => { exportCurrentSlide(currentSlide, exportFormat); setShowExportMenu(false); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', color: '#F0F0F0', fontSize: 12, fontFamily: 'DM Sans, sans-serif', textAlign: 'left', cursor: 'pointer', display: 'block' }}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {showExportMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowExportMenu(false)} />}
          </div>
        </div>

        {/* Row 2: Ratios + Reset + Add Text */}
        <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 5, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {RATIOS.map(r => (
            <button key={r.id} onClick={() => setCurrentRatio(r.id)}
              style={{ padding: '3px 9px', fontSize: 10, fontFamily: 'DM Mono, monospace', fontWeight: displayRatio === r.id ? 600 : 400, background: displayRatio === r.id ? accentColor : '#1A1A1A', color: displayRatio === r.id ? '#000' : '#666', border: `1px solid ${displayRatio === r.id ? accentColor : '#2A2A2A'}`, borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {r.label}
            </button>
          ))}
          <div style={{ flex: 1, minWidth: 8 }} />
          <button onClick={resetAllEffects} title="Reset all effects"
            style={{ padding: '3px 8px', background: 'transparent', border: '1px solid #2A2A2A', color: '#555', cursor: 'pointer', borderRadius: 3, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <RotateCcw size={10} />
          </button>
          <button onClick={handleAddText}
            style={{ padding: '3px 9px', fontSize: 9, fontFamily: 'DM Sans, sans-serif', background: 'transparent', border: '1px solid #2A2A2A', color: '#999', cursor: 'pointer', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.05em' }}>
            + Text
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CanvasEditor
          slide={currentSlide}
          ratio={ratio}
          photos={photos}
          mode={mode}
          accentColor={accentColor}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          selectedTextId={selectedTextId}
          setSelectedTextId={setSelectedTextId}
          onUpdateTextBlock={updateTextBlock}
          onAssignPhotoToZone={assignPhotoToZone}
          onUpdateZoom={updateZoom}
          onUpdateZoomPan={updateZoomPan}
          onSwapZones={swapZonePhotos}
          logoDataUrl={brandKit?.logoDataUrl || logoDataUrl}
        />
      </div>

      {/* ── Slide Navigator ─────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <SlideNavigator
          slides={slides}
          currentIdx={currentSlideIdx}
          photos={photos}
          accentColor={accentColor}
          onSelect={setCurrentSlideIdx}
          onAdd={() => setShowAddSlide(true)}
          onRemove={removeSlide}
          onDuplicate={duplicateSlide}
          ratio={ratio}
        />
      </div>

      {/* ── Bottom Drawer ───────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        height: panelOpen ? '50vh' : 0,
        transition: 'height 240ms ease',
        overflow: 'hidden',
        background: '#1A1A1A',
        borderTop: panelOpen ? '1px solid #2A2A2A' : 'none',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
          <div style={{ width: 32, height: 3, background: '#333', borderRadius: 2 }} />
        </div>
        <div style={{ height: 'calc(100% - 14px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {activeTab === 'photos' && (
            <MobilePhotosPanel
              photos={photos}
              currentSlide={currentSlide}
              selectedZone={selectedZone}
              onAssign={assignPhotoToZone}
              onUnassign={unassignZone}
              onAdd={handlePhotosAdded}
              onRemove={removePhoto}
              accentColor={accentColor}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesPanel
              mode={mode}
              currentTemplateId={currentSlide.templateId}
              onApply={tmplId => { applyTemplate(tmplId); setPanelOpen(false); }}
              accentColor={accentColor}
            />
          )}
          {activeTab === 'presets' && (
            <PresetsPanel
              presets={presets}
              slide={currentSlide}
              selectedZone={selectedZone}
              onApplyToZone={applyPresetToZone}
              onApplyToAll={applyPresetToAll}
              onUpdatePresetOpacity={updatePresetOpacity}
              accentColor={accentColor}
            />
          )}
          {activeTab === 'text' && (
            <TextPanel
              mode={mode}
              selectedTextBlock={selectedTextBlock}
              recentFonts={recentFonts}
              onUpdate={updateTextBlock}
              onDelete={deleteTextBlock}
              onApplyQuickStyle={applyQuickStyle}
              onAddWithStyle={addTextBlockWithStyle}
              accentColor={accentColor}
            />
          )}
          {activeTab === 'more' && (
            <MobileMorePanel
              currentSlide={currentSlide}
              updateCurrentSlide={updateCurrentSlide}
              logoDataUrl={logoDataUrl}
              setLogoDataUrl={setLogoDataUrl}
              brandKit={brandKit}
              selectedZone={selectedZone}
              flipPhotoInZone={flipPhotoInZone}
              accentColor={accentColor}
            />
          )}
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div style={{ height: 56, background: '#141414', borderTop: '1px solid #2A2A2A', display: 'flex', flexShrink: 0 }}>
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id && panelOpen;
          return (
            <button key={id} onClick={() => openTab(id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'transparent', border: 'none', borderTop: `2px solid ${isActive ? accentColor : 'transparent'}`, cursor: 'pointer', color: isActive ? accentColor : '#555', transition: 'color 150ms' }}>
              <Icon size={17} />
              <span style={{ fontSize: 8, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Export progress */}
      {exporting && exportProgress && (
        <div style={{ position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '8px 16px', background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F0F0F0', fontSize: 12, fontFamily: 'DM Sans, sans-serif', borderRadius: 4, whiteSpace: 'nowrap' }}>
          {exportProgress}
        </div>
      )}
    </div>
  );
}
