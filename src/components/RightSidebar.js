import React from 'react';
import { LayoutGrid, Palette, Type, Frame, Image } from 'lucide-react';
import TemplatesPanel from './panels/TemplatesPanel';
import PresetsPanel from './panels/PresetsPanel';
import TextPanel from './panels/TextPanel';
import BordersPanel from './panels/BordersPanel';
import LogoPanel from './panels/LogoPanel';

const TABS = [
  { id: 'templates', label: 'Templates', icon: LayoutGrid },
  { id: 'presets',   label: 'Presets',   icon: Palette },
  { id: 'text',      label: 'Text',      icon: Type },
  { id: 'borders',   label: 'Borders',   icon: Frame },
  { id: 'logo',      label: 'Logo',      icon: Image },
];

export default function RightSidebar({
  mode, tab, setTab, accentColor, slide, selectedZone, selectedTextBlock,
  photos, presets, recentFonts,
  onApplyTemplate, onApplyPresetToZone, onApplyPresetToAll, onUpdatePresetOpacity,
  onUpdateTextBlock, onDeleteTextBlock, onApplyQuickStyle, onAddTextWithStyle,
  onUpdateBorderSettings, onUpdateLogoSettings, logoDataUrl, onLogoUpload, onFlipZone,
}) {
  return (
    <div className="flex flex-col flex-shrink-0" style={{ width: 300, background: '#1A1A1A', borderLeft: '1px solid #2A2A2A', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid #2A2A2A' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              title={t.label}
              style={{
                flex: 1,
                padding: '10px 4px 8px',
                background: 'transparent',
                border: 'none',
                borderBottom: active ? `2px solid ${accentColor}` : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                transition: 'all 150ms ease',
                color: active ? accentColor : '#555',
              }}
            >
              <Icon size={14} />
              <span style={{ fontSize: 8, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'templates' && (
          <TemplatesPanel
            mode={mode}
            currentTemplateId={slide.templateId}
            onApply={onApplyTemplate}
            accentColor={accentColor}
          />
        )}
        {tab === 'presets' && (
          <PresetsPanel
            presets={presets}
            slide={slide}
            selectedZone={selectedZone}
            onApplyToZone={onApplyPresetToZone}
            onApplyToAll={onApplyPresetToAll}
            onUpdatePresetOpacity={onUpdatePresetOpacity}
            accentColor={accentColor}
          />
        )}
        {tab === 'text' && (
          <TextPanel
            mode={mode}
            selectedTextBlock={selectedTextBlock}
            recentFonts={recentFonts}
            onUpdate={onUpdateTextBlock}
            onDelete={onDeleteTextBlock}
            onApplyQuickStyle={onApplyQuickStyle}
            onAddWithStyle={onAddTextWithStyle}
            accentColor={accentColor}
          />
        )}
        {tab === 'borders' && (
          <BordersPanel
            borderSettings={slide.borderSettings}
            onUpdate={onUpdateBorderSettings}
            accentColor={accentColor}
          />
        )}
        {tab === 'logo' && (
          <LogoPanel
            logoSettings={slide.logoSettings}
            logoDataUrl={logoDataUrl}
            onUpdate={onUpdateLogoSettings}
            onLogoUpload={onLogoUpload}
            accentColor={accentColor}
            selectedZone={selectedZone}
            onFlipZone={onFlipZone}
          />
        )}
      </div>
    </div>
  );
}
