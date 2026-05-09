import { useState, useCallback } from 'react';

const DEFAULT_BRAND = {
  primaryColor: '#C9A96E',
  secondaryColor: '#FFFFFF',
  logoDataUrl: null,
  logoPosition: 'bottom-right',
  logoScale: 0.15,
  displayFont: 'Cormorant Garamond',
  bodyFont: 'DM Sans',
  defaultPreset: 'natural',
  defaultTextStyle: null,
  autoApply: false,
};

export function useBrandKit() {
  const [brandKit, setBrandKit] = useState(() => {
    try {
      const saved = localStorage.getItem('carousel-brand-kit');
      return saved ? { ...DEFAULT_BRAND, ...JSON.parse(saved) } : DEFAULT_BRAND;
    } catch {
      return DEFAULT_BRAND;
    }
  });

  const saveBrandKit = useCallback((updates) => {
    const next = { ...brandKit, ...updates };
    setBrandKit(next);
    try {
      localStorage.setItem('carousel-brand-kit', JSON.stringify(next));
    } catch {}
  }, [brandKit]);

  const resetBrandKit = useCallback(() => {
    setBrandKit(DEFAULT_BRAND);
    localStorage.removeItem('carousel-brand-kit');
  }, []);

  return { brandKit, saveBrandKit, resetBrandKit };
}
