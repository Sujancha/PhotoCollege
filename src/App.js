import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RATIOS, TEMPLATE_CATEGORIES, createDefaultSlide, createDefaultTextBlock, WEDDING_PRESETS, SPORTS_PRESETS, MAX_PHOTOS } from './constants';
import { generateId, getAccentColor, loadGoogleFont, getTemplate, computeZones } from './utils';
import { useBrandKit } from './hooks/useBrandKit';
import { useExport } from './hooks/useExport';
import { loadSavedPhotos, savePhoto, deletePhoto as dbDeletePhoto, updatePhotoFlip } from './hooks/usePhotoStore';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import CanvasEditor from './components/CanvasEditor';
import RightSidebar from './components/RightSidebar';
import BrandKitModal from './components/BrandKitModal';
import SlideNavigator from './components/SlideNavigator';
import Wizard from './components/Wizard';
import AddSlideModal from './components/AddSlideModal';

loadGoogleFont('Cormorant Garamond');
loadGoogleFont('DM Sans');

export default function App() {
  const [mode, setMode] = useState('wedding');

  const [currentRatio, setCurrentRatio] = useState('1:1');
  const [slides, setSlides] = useState(() => [createDefaultSlide(generateId())]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [rightTab, setRightTab] = useState('templates');
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [showAddSlide, setShowAddSlide] = useState(false);
  const [showWizard, setShowWizard] = useState(true);
  const [recentFonts, setRecentFonts] = useState([]);

  const { brandKit, saveBrandKit, resetBrandKit } = useBrandKit();
  const currentSlide = slides[currentSlideIdx] || slides[0];
  const accentColor = getAccentColor(mode);
  const historyRef = useRef([]);

  // Per-slide ratio: use current slide's ratio if set, else global default
  const displayRatio = currentSlide.ratio || currentRatio;
  const ratio = RATIOS.find(r => r.id === displayRatio) || RATIOS[0];

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  // Load persisted photos from IndexedDB on mount
  useEffect(() => {
    loadSavedPhotos().then(saved => {
      if (saved.length > 0) setPhotos(saved);
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (mod && e.key === 's') { e.preventDefault(); exportCurrentSlide(currentSlide); return; }

      if (inInput) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) setCurrentSlideIdx(i => Math.max(0, i - 1));
        else setCurrentSlideIdx(i => Math.min(slides.length - 1, i + 1));
      }
      if (!mod) {
        if (e.key === 'd' || e.key === 'D') duplicateSlide(currentSlideIdx);
        if (e.key === 'e' || e.key === 'E') exportCurrentSlide(currentSlide);
      }
      if (e.key === 'ArrowLeft') setCurrentSlideIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentSlideIdx(i => Math.min(slides.length - 1, i + 1));
      if (e.key === 'Escape') { setSelectedZone(null); setSelectedTextId(null); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId) { e.preventDefault(); deleteTextBlock(selectedTextId); }
        else if (selectedZone) { e.preventDefault(); unassignZone(selectedZone); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, currentSlideIdx, selectedTextId]);

  const { exporting, exportProgress, exportCurrentSlide, exportAllSlides, exportTikTok } = useExport(
    slides, photos, logoDataUrl, displayRatio
  );

  // ── Undo ──────────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    setSlides(prev);
  }, []);

  // ── Wizard completion ─────────────────────────────────────────────────────────
  const handleWizardComplete = useCallback(({ mode: m, photos: p, ratio: r, templateId: t }) => {
    setMode(m);
    setCurrentRatio(r);
    setPhotos(p);
    p.forEach(photo => savePhoto(photo));

    setSlides([{
      ...createDefaultSlide(generateId()),
      ratio: r,
      templateId: t,
      photoAssignments: {},
      zoom: {},
      globalPreset: brandKit.autoApply ? brandKit.defaultPreset : 'natural',
    }]);
    setCurrentSlideIdx(0);
    setShowWizard(false);
  }, [brandKit]);

  // ── Add slide from modal ──────────────────────────────────────────────────────
  const handleAddSlide = useCallback(({ ratio: r, templateId: t }) => {
    const newSlide = {
      ...createDefaultSlide(generateId()),
      ratio: r,
      templateId: t,
      globalPreset: brandKit.autoApply ? brandKit.defaultPreset : 'natural',
    };
    setSlides(s => { historyRef.current = [...historyRef.current.slice(-29), s]; return [...s, newSlide]; });
    setCurrentSlideIdx(slides.length);
    setCurrentRatio(r);
    setShowAddSlide(false);
  }, [slides.length, brandKit]);

  // ── Slide management ─────────────────────────────────────────────────────────
  const removeSlide = useCallback((idx) => {
    if (slides.length === 1) return;
    setSlides(s => { historyRef.current = [...historyRef.current.slice(-29), s]; return s.filter((_, i) => i !== idx); });
    setCurrentSlideIdx(i => Math.min(i, slides.length - 2));
  }, [slides.length]);

  const duplicateSlide = useCallback((idx) => {
    const clone = { ...slides[idx], id: generateId() };
    clone.textBlocks = (clone.textBlocks || []).map(t => ({ ...t, id: generateId() }));
    setSlides(s => { historyRef.current = [...historyRef.current.slice(-29), s]; const n = [...s]; n.splice(idx + 1, 0, clone); return n; });
    setCurrentSlideIdx(idx + 1);
  }, [slides]);

  const updateCurrentSlide = useCallback((updates) => {
    setSlides(prev => {
      historyRef.current = [...historyRef.current.slice(-29), prev];
      return prev.map((sl, i) => i === currentSlideIdx ? { ...sl, ...updates } : sl);
    });
  }, [currentSlideIdx]);

  const applyTemplate = useCallback((templateId) => {
    const tmplObj = getTemplate(templateId, TEMPLATE_CATEGORIES);
    const newSlots = tmplObj?.slots || 1;
    const ratioObj = RATIOS.find(r => r.id === (currentSlide.ratio || currentRatio)) || RATIOS[0];
    const gutter = currentSlide.borderSettings?.gutter ?? 4;
    const allZones = tmplObj ? computeZones(tmplObj, ratioObj.w, ratioObj.h, gutter) : [];

    // Keep assignments for zones that still exist; trim any beyond new slot count
    const currentAssignments = currentSlide.photoAssignments || {};
    const newAssignments = {};
    const zoomScale = {};
    const zoomX = {};
    const zoomY = {};
    for (let i = 0; i < newSlots; i++) {
      const zoneKey = `zone-${i}`;
      const photoId = currentAssignments[zoneKey];
      if (photoId) {
        newAssignments[zoneKey] = photoId;
        const photo = photos.find(p => p.id === photoId);
        const zoneObj = allZones[i];
        if (zoneObj && photo?.w && photo?.h) {
          zoomScale[zoneKey] = Math.max(zoneObj.w / photo.w, zoneObj.h / photo.h);
          zoomX[zoneKey] = 0;
          zoomY[zoneKey] = 0;
        }
      }
    }
    updateCurrentSlide({ templateId, photoAssignments: newAssignments, zoom: { scale: zoomScale, x: zoomX, y: zoomY } });
    setSelectedZone(null);
  }, [photos, currentSlide, currentRatio, updateCurrentSlide]);

  // ── Photo management ─────────────────────────────────────────────────────────
  const handlePhotosAdded = useCallback((newPhotos) => {
    setPhotos(p => {
      const next = [...p, ...newPhotos].slice(0, MAX_PHOTOS);
      newPhotos.forEach(ph => savePhoto(ph));
      return next;
    });
  }, []);

  const reorderPhotos = useCallback((fromIdx, toIdx) => {
    setPhotos(p => { const n = [...p]; const [m] = n.splice(fromIdx, 1); n.splice(toIdx, 0, m); return n; });
  }, []);

  const removePhoto = useCallback((photoId) => {
    setPhotos(p => p.filter(ph => ph.id !== photoId));
    dbDeletePhoto(photoId);
    setSlides(s => s.map(sl => {
      const pa = { ...sl.photoAssignments };
      Object.keys(pa).forEach(k => { if (pa[k] === photoId) delete pa[k]; });
      return { ...sl, photoAssignments: pa };
    }));
  }, []);

  const assignPhotoToZone = useCallback((zoneKey, photoId) => {
    const photo = photos.find(p => p.id === photoId);
    const tmpl = getTemplate(currentSlide.templateId, TEMPLATE_CATEGORIES);
    const ratioObj = RATIOS.find(r => r.id === (currentSlide.ratio || currentRatio)) || RATIOS[0];
    const gutter = currentSlide.borderSettings?.gutter ?? 4;
    const zoneIdx = parseInt(zoneKey.replace('zone-', ''), 10);
    const allZones = tmpl ? computeZones(tmpl, ratioObj.w, ratioObj.h, gutter) : [];
    const zoneObj = allZones[zoneIdx];

    const updates = { photoAssignments: { ...currentSlide.photoAssignments, [zoneKey]: photoId } };
    if (photo && zoneObj && photo.w && photo.h) {
      updates.zoom = {
        ...currentSlide.zoom,
        scale: { ...currentSlide.zoom?.scale, [zoneKey]: Math.max(zoneObj.w / photo.w, zoneObj.h / photo.h) },
        x: { ...currentSlide.zoom?.x, [zoneKey]: 0 },
        y: { ...currentSlide.zoom?.y, [zoneKey]: 0 },
      };
    }
    updateCurrentSlide(updates);
  }, [currentSlide, photos, currentRatio, updateCurrentSlide]);

  const unassignZone = useCallback((zoneKey) => {
    const pa = { ...currentSlide.photoAssignments };
    delete pa[zoneKey];
    const zoom = { ...currentSlide.zoom };
    if (zoom.scale) { zoom.scale = { ...zoom.scale }; delete zoom.scale[zoneKey]; }
    if (zoom.x) { zoom.x = { ...zoom.x }; delete zoom.x[zoneKey]; }
    if (zoom.y) { zoom.y = { ...zoom.y }; delete zoom.y[zoneKey]; }
    updateCurrentSlide({ photoAssignments: pa, zoom });
  }, [currentSlide, updateCurrentSlide]);

  const flipPhotoInZone = useCallback((zoneKey) => {
    const photoId = currentSlide.photoAssignments[zoneKey];
    if (!photoId) return;
    setPhotos(p => p.map(ph => {
      if (ph.id !== photoId) return ph;
      updatePhotoFlip(ph.id, !ph.flipH);
      return { ...ph, flipH: !ph.flipH };
    }));
  }, [currentSlide]);

  const swapZonePhotos = useCallback((fromZone, toZone) => {
    const pa = { ...currentSlide.photoAssignments };
    const fromPhoto = pa[fromZone]; const toPhoto = pa[toZone];
    if (fromPhoto) pa[toZone] = fromPhoto; else delete pa[toZone];
    if (toPhoto) pa[fromZone] = toPhoto; else delete pa[fromZone];
    updateCurrentSlide({ photoAssignments: pa });
  }, [currentSlide, updateCurrentSlide]);

  // ── Text management ───────────────────────────────────────────────────────────
  const addTextBlock = useCallback(() => {
    const tb = createDefaultTextBlock(generateId(), accentColor);
    updateCurrentSlide({ textBlocks: [...(currentSlide.textBlocks || []), tb] });
    setSelectedTextId(tb.id);
    setRightTab('text');
  }, [currentSlide, updateCurrentSlide, accentColor]);

  const addTextBlockWithStyle = useCallback((style) => {
    const tb = { ...createDefaultTextBlock(generateId(), accentColor), ...style };
    updateCurrentSlide({ textBlocks: [...(currentSlide.textBlocks || []), tb] });
    setSelectedTextId(tb.id);
    setRightTab('text');
  }, [currentSlide, updateCurrentSlide, accentColor]);

  const updateTextBlock = useCallback((tbId, updates) => {
    const updated = (currentSlide.textBlocks || []).map(t => t.id === tbId ? { ...t, ...updates } : t);
    updateCurrentSlide({ textBlocks: updated });
    if (updates.font) {
      loadGoogleFont(updates.font);
      setRecentFonts(rf => [updates.font, ...rf.filter(f => f !== updates.font)].slice(0, 5));
    }
  }, [currentSlide, updateCurrentSlide]);

  const deleteTextBlock = useCallback((tbId) => {
    updateCurrentSlide({ textBlocks: (currentSlide.textBlocks || []).filter(t => t.id !== tbId) });
    setSelectedTextId(null);
  }, [currentSlide, updateCurrentSlide]);

  const applyQuickStyle = useCallback((style) => {
    if (!selectedTextId) return;
    updateTextBlock(selectedTextId, style);
  }, [selectedTextId, updateTextBlock]);

  // ── Presets / zoom / borders ──────────────────────────────────────────────────
  const applyPresetToZone = useCallback((presetId, zoneKey) => {
    updateCurrentSlide({ presets: { ...currentSlide.presets, [zoneKey]: presetId } });
  }, [currentSlide, updateCurrentSlide]);

  const applyPresetToAll = useCallback((presetId) => {
    updateCurrentSlide({ globalPreset: presetId, presets: {} });
  }, [updateCurrentSlide]);

  const updateZoom = useCallback((zoneKey, axis, value) => {
    const zoom = { ...currentSlide.zoom };
    zoom[axis] = { ...zoom[axis], [zoneKey]: value };
    updateCurrentSlide({ zoom });
  }, [currentSlide, updateCurrentSlide]);

  const presets = mode === 'wedding' ? WEDDING_PRESETS : SPORTS_PRESETS;
  const selectedTextBlock = (currentSlide.textBlocks || []).find(t => t.id === selectedTextId);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0F0F0F' }}>
      <TopBar
        mode={mode}
        setMode={setMode}
        currentRatio={displayRatio}
        setCurrentRatio={(r) => { setCurrentRatio(r); updateCurrentSlide({ ratio: r }); }}
        accentColor={accentColor}
        onExportCurrent={() => exportCurrentSlide(currentSlide)}
        onExportAll={exportAllSlides}
        onExportTikTok={() => exportTikTok(currentSlide)}
        exporting={exporting}
        exportProgress={exportProgress}
        onAddText={addTextBlock}
        onBrandKit={() => setShowBrandKit(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          photos={photos}
          onPhotosAdded={handlePhotosAdded}
          onReorder={reorderPhotos}
          onRemove={removePhoto}
          onAssignToZone={assignPhotoToZone}
          onUnassignFromZone={unassignZone}
          selectedZone={selectedZone}
          accentColor={accentColor}
          currentSlide={currentSlide}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
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
            onSwapZones={swapZonePhotos}
            logoDataUrl={brandKit.logoDataUrl || logoDataUrl}
            allPresets={[...WEDDING_PRESETS, ...SPORTS_PRESETS]}
          />

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

        <RightSidebar
          mode={mode}
          tab={rightTab}
          setTab={setRightTab}
          accentColor={accentColor}
          slide={currentSlide}
          selectedZone={selectedZone}
          selectedTextBlock={selectedTextBlock}
          photos={photos}
          presets={presets}
          recentFonts={recentFonts}
          onApplyTemplate={applyTemplate}
          onApplyPresetToZone={applyPresetToZone}
          onApplyPresetToAll={applyPresetToAll}
          onUpdateTextBlock={updateTextBlock}
          onDeleteTextBlock={deleteTextBlock}
          onApplyQuickStyle={applyQuickStyle}
          onAddTextWithStyle={addTextBlockWithStyle}
          onUpdateBorderSettings={(bs) => updateCurrentSlide({ borderSettings: { ...currentSlide.borderSettings, ...bs } })}
          onUpdateLogoSettings={(ls) => updateCurrentSlide({ logoSettings: { ...currentSlide.logoSettings, ...ls } })}
          logoDataUrl={brandKit.logoDataUrl || logoDataUrl}
          onLogoUpload={setLogoDataUrl}
          onFlipZone={flipPhotoInZone}
        />
      </div>

      {showBrandKit && (
        <BrandKitModal
          brandKit={brandKit}
          onSave={saveBrandKit}
          onReset={resetBrandKit}
          onClose={() => setShowBrandKit(false)}
          accentColor={accentColor}
        />
      )}

      {showAddSlide && (
        <AddSlideModal
          onAdd={handleAddSlide}
          onClose={() => setShowAddSlide(false)}
          defaultRatio={displayRatio}
          vibe={null}
          accentColor={accentColor}
        />
      )}

      {showWizard && (
        <Wizard
          onComplete={handleWizardComplete}
          initialPhotos={photos}
          accentColor={accentColor}
        />
      )}

      {exporting && exportProgress && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2 text-sm"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F0F0F0' }}>
          {exportProgress}
        </div>
      )}
    </div>
  );
}
