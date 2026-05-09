import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RATIOS, createDefaultSlide, createDefaultTextBlock, WEDDING_PRESETS, SPORTS_PRESETS } from './constants';
import { generateId, getAccentColor, loadGoogleFont } from './utils';
import { useBrandKit } from './hooks/useBrandKit';
import { useExport } from './hooks/useExport';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import CanvasEditor from './components/CanvasEditor';
import RightSidebar from './components/RightSidebar';
import BrandKitModal from './components/BrandKitModal';
import SlideNavigator from './components/SlideNavigator';

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
  const [recentFonts, setRecentFonts] = useState([]);
  const [lastTemplateId, setLastTemplateId] = useState('full-bleed');

  const { brandKit, saveBrandKit, resetBrandKit } = useBrandKit();
  const currentSlide = slides[currentSlideIdx] || slides[0];
  const accentColor = getAccentColor(mode);
  const historyRef = useRef([]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const mod = e.ctrlKey || e.metaKey;

      // Global modifier shortcuts (work everywhere)
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
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTextId) {
        e.preventDefault(); deleteTextBlock(selectedTextId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, currentSlideIdx, selectedTextId]);

  const { exporting, exportProgress, exportCurrentSlide, exportAllSlides, exportTikTok } = useExport(
    slides, photos, logoDataUrl, currentRatio
  );

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    setSlides(prev);
  }, []);

  const addSlide = useCallback(() => {
    const newSlide = { ...createDefaultSlide(generateId()), ratio: currentRatio, templateId: lastTemplateId };
    if (brandKit.autoApply) newSlide.globalPreset = brandKit.defaultPreset;
    setSlides(s => { historyRef.current = [...historyRef.current.slice(-29), s]; return [...s, newSlide]; });
    setCurrentSlideIdx(slides.length);
  }, [currentRatio, lastTemplateId, brandKit, slides.length]);

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
    setLastTemplateId(templateId);
    const assignments = {};
    photos.forEach((p, i) => { assignments[`zone-${i}`] = p.id; });
    updateCurrentSlide({ templateId, photoAssignments: assignments });
    setSelectedZone(null);
  }, [photos, updateCurrentSlide]);

  const handlePhotosAdded = useCallback((newPhotos) => {
    setPhotos(p => [...p, ...newPhotos].slice(0, 20));
  }, []);

  const reorderPhotos = useCallback((fromIdx, toIdx) => {
    setPhotos(p => { const n = [...p]; const [m] = n.splice(fromIdx, 1); n.splice(toIdx, 0, m); return n; });
  }, []);

  const removePhoto = useCallback((photoId) => {
    setPhotos(p => p.filter(ph => ph.id !== photoId));
    setSlides(s => s.map(sl => {
      const pa = { ...sl.photoAssignments };
      Object.keys(pa).forEach(k => { if (pa[k] === photoId) delete pa[k]; });
      return { ...sl, photoAssignments: pa };
    }));
  }, []);

  const assignPhotoToZone = useCallback((zoneKey, photoId) => {
    updateCurrentSlide({ photoAssignments: { ...currentSlide.photoAssignments, [zoneKey]: photoId } });
  }, [currentSlide, updateCurrentSlide]);

  const flipPhotoInZone = useCallback((zoneKey) => {
    const photoId = currentSlide.photoAssignments[zoneKey];
    if (!photoId) return;
    setPhotos(p => p.map(ph => ph.id === photoId ? { ...ph, flipH: !ph.flipH } : ph));
  }, [currentSlide]);

  const swapZonePhotos = useCallback((fromZone, toZone) => {
    const pa = { ...currentSlide.photoAssignments };
    const fromPhoto = pa[fromZone];
    const toPhoto = pa[toZone];
    if (fromPhoto) pa[toZone] = fromPhoto; else delete pa[toZone];
    if (toPhoto) pa[fromZone] = toPhoto; else delete pa[fromZone];
    updateCurrentSlide({ photoAssignments: pa });
  }, [currentSlide, updateCurrentSlide]);

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
  const ratio = RATIOS.find(r => r.id === currentRatio) || RATIOS[0];
  const selectedTextBlock = (currentSlide.textBlocks || []).find(t => t.id === selectedTextId);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0F0F0F' }}>
      <TopBar
        mode={mode}
        setMode={setMode}
        currentRatio={currentRatio}
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
            onAdd={addSlide}
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

      {exporting && exportProgress && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2 text-sm"
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#F0F0F0' }}>
          {exportProgress}
        </div>
      )}
    </div>
  );
}
