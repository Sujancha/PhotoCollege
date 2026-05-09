// ─── ASPECT RATIOS ─────────────────────────────────────────────────────────────
export const RATIOS = [
  { id: '1:1',  label: '1:1',  w: 1080, h: 1080, exportW: 3000, exportH: 3000 },
  { id: '4:5',  label: '4:5',  w: 864,  h: 1080, exportW: 2400, exportH: 3000 },
  { id: '9:16', label: '9:16', w: 608,  h: 1080, exportW: 1080, exportH: 1920 },
  { id: '16:9', label: '16:9', w: 1080, h: 608,  exportW: 3000, exportH: 1688 },
  { id: '3:1',  label: '3:1',  w: 1080, h: 360,  exportW: 3000, exportH: 1000 },
];

// ─── TEMPLATES ──────────────────────────────────────────────────────────────────
export const TEMPLATE_CATEGORIES = [
  {
    id: 'single',
    label: 'Single Frame',
    templates: [
      {
        id: 'full-bleed',
        label: 'Full Bleed',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        border: null,
      },
      {
        id: 'white-border',
        label: 'White Border',
        slots: 1,
        padding: 40,
        zones: (w, h) => [{ x: 40, y: 40, w: w - 80, h: h - 80 }],
        outerBg: '#FFFFFF',
      },
      {
        id: 'film-border',
        label: 'Film Border',
        slots: 1,
        padding: 30,
        zones: (w, h) => [{ x: 30, y: 30, w: w - 60, h: h - 60 }],
        outerBg: '#000000',
      },
      {
        id: 'magazine-cover',
        label: 'Magazine Cover',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        gradient: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 50%)',
        textArea: true,
      },
    ],
  },
  {
    id: 'stacked',
    label: 'Stacked / Triptych',
    templates: [
      {
        id: 'split-v',
        label: '2-Photo Vertical Split',
        slots: 2,
        zones: (w, h, g = 4) => [
          { x: 0, y: 0, w: (w - g) / 2, h },
          { x: (w - g) / 2 + g, y: 0, w: (w - g) / 2, h },
        ],
      },
      {
        id: 'triptych-v',
        label: '3-Photo Triptych',
        slots: 3,
        zones: (w, h, g = 4) => [
          { x: 0, y: 0, w: (w - g * 2) / 3, h },
          { x: (w - g * 2) / 3 + g, y: 0, w: (w - g * 2) / 3, h },
          { x: ((w - g * 2) / 3) * 2 + g * 2, y: 0, w: (w - g * 2) / 3, h },
        ],
      },
      {
        id: 'stacked-h',
        label: '3-Photo Stacked Horizontal',
        slots: 3,
        zones: (w, h, g = 4) => [
          { x: 0, y: 0, w, h: (h - g * 2) / 3 },
          { x: 0, y: (h - g * 2) / 3 + g, w, h: (h - g * 2) / 3 },
          { x: 0, y: ((h - g * 2) / 3) * 2 + g * 2, w, h: (h - g * 2) / 3 },
        ],
      },
      {
        id: 'hero-strip',
        label: 'Hero + Strip Below',
        slots: 4,
        zones: (w, h, g = 4) => {
          const heroH = Math.round(h * 0.65);
          const stripH = h - heroH - g;
          const sw = (w - g * 2) / 3;
          return [
            { x: 0, y: 0, w, h: heroH },
            { x: 0, y: heroH + g, w: sw, h: stripH },
            { x: sw + g, y: heroH + g, w: sw, h: stripH },
            { x: sw * 2 + g * 2, y: heroH + g, w: sw, h: stripH },
          ];
        },
      },
    ],
  },
  {
    id: 'collage',
    label: 'Collage Grid',
    templates: [
      {
        id: 'grid-2x2',
        label: '4-Photo 2×2 Grid',
        slots: 4,
        zones: (w, h, g = 4) => {
          const hw = (w - g) / 2;
          const hh = (h - g) / 2;
          return [
            { x: 0, y: 0, w: hw, h: hh },
            { x: hw + g, y: 0, w: hw, h: hh },
            { x: 0, y: hh + g, w: hw, h: hh },
            { x: hw + g, y: hh + g, w: hw, h: hh },
          ];
        },
      },
      {
        id: 'large-left',
        label: '1 Large Left + 2 Right',
        slots: 4,
        zones: (w, h, g = 4) => {
          const lw = Math.round(w * 0.6);
          const rw = w - lw - g;
          const rh = (h - g) / 2;
          return [
            { x: 0, y: 0, w: lw, h },
            { x: lw + g, y: 0, w: rw, h: rh },
            { x: lw + g, y: rh + g, w: rw, h: rh },
          ];
        },
      },
      {
        id: 'large-right',
        label: '2 Left + 1 Large Right',
        slots: 3,
        zones: (w, h, g = 4) => {
          const rw = Math.round(w * 0.6);
          const lw = w - rw - g;
          const lh = (h - g) / 2;
          return [
            { x: 0, y: 0, w: lw, h: lh },
            { x: 0, y: lh + g, w: lw, h: lh },
            { x: lw + g, y: 0, w: rw, h },
          ];
        },
      },
      {
        id: 'grid-3x2',
        label: '6-Photo 3×2 Grid',
        slots: 6,
        zones: (w, h, g = 4) => {
          const cw = (w - g * 2) / 3;
          const rh = (h - g) / 2;
          return [
            { x: 0, y: 0, w: cw, h: rh },
            { x: cw + g, y: 0, w: cw, h: rh },
            { x: cw * 2 + g * 2, y: 0, w: cw, h: rh },
            { x: 0, y: rh + g, w: cw, h: rh },
            { x: cw + g, y: rh + g, w: cw, h: rh },
            { x: cw * 2 + g * 2, y: rh + g, w: cw, h: rh },
          ];
        },
      },
      {
        id: 'grid-3x3',
        label: '9-Photo 3×3 Grid',
        slots: 9,
        zones: (w, h, g = 4) => {
          const cw = (w - g * 2) / 3;
          const rh = (h - g * 2) / 3;
          const zones = [];
          for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++)
              zones.push({ x: c * (cw + g), y: r * (rh + g), w: cw, h: rh });
          return zones;
        },
      },
    ],
  },
  {
    id: 'cinematic',
    label: 'Cinematic / Editorial',
    templates: [
      {
        id: 'quote-card',
        label: 'Full Bleed Quote Card',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        overlay: 'rgba(0,0,0,0.45)',
        textArea: true,
      },
      {
        id: 'three-panel',
        label: '3 Panel Horizontal',
        slots: 3,
        zones: (w, h, g = 4) => {
          const pw = (w - g * 2) / 3;
          return [
            { x: 0, y: 0, w: pw, h },
            { x: pw + g, y: 0, w: pw, h },
            { x: pw * 2 + g * 2, y: 0, w: pw, h },
          ];
        },
      },
      {
        id: 'double-exposure',
        label: 'Double Exposure',
        slots: 2,
        zones: (w, h) => [
          { x: 0, y: 0, w, h },
          { x: 0, y: 0, w, h, blendMode: 'multiply', opacity: 0.7 },
        ],
      },
      {
        id: 'letterbox',
        label: 'Letterbox',
        slots: 1,
        zones: (w, h) => {
          const barH = Math.round(h * 0.12);
          return [{ x: 0, y: barH, w, h: h - barH * 2 }];
        },
        overlay: null,
      },
      {
        id: 'mag-split',
        label: 'Magazine Split',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w: Math.round(w * 0.65), h }],
        solidPanel: { color: '#0D0D0D', x: 0.65, textArea: true },
      },
      {
        id: 'asymmetric-4',
        label: 'Asymmetric 4',
        slots: 4,
        zones: (w, h, g = 4) => {
          const lw = Math.round(w * 0.55);
          const rw = w - lw - g;
          const rh = (h - g * 2) / 3;
          return [
            { x: 0, y: 0, w: lw, h },
            { x: lw + g, y: 0, w: rw, h: rh },
            { x: lw + g, y: rh + g, w: rw, h: rh },
            { x: lw + g, y: rh * 2 + g * 2, w: rw, h: rh },
          ];
        },
      },
      {
        id: 'film-strip-5',
        label: 'Film Strip (5)',
        slots: 5,
        zones: (w, h, g = 3) => {
          const sw = (w - g * 4) / 5;
          return Array.from({ length: 5 }, (_, i) => ({
            x: i * (sw + g), y: 0, w: sw, h,
          }));
        },
      },
      {
        id: 'panoramic-duo',
        label: 'Panoramic Duo',
        slots: 2,
        zones: (w, h, g = 6) => {
          const ph = (h - g) / 2;
          return [
            { x: 0, y: 0, w, h: ph },
            { x: 0, y: ph + g, w, h: ph },
          ];
        },
      },
      {
        id: 'editorial-mosaic',
        label: 'Editorial Mosaic',
        slots: 5,
        zones: (w, h, g = 4) => {
          const col1 = Math.round(w * 0.4);
          const col2 = w - col1 - g;
          const topH = Math.round(h * 0.55);
          const botH = h - topH - g;
          const c2w = (col2 - g) / 2;
          const c2th = Math.round(topH * 0.5);
          return [
            { x: 0, y: 0, w: col1, h: topH },
            { x: col1 + g, y: 0, w: c2w, h: c2th },
            { x: col1 + g + c2w + g, y: 0, w: c2w, h: c2th },
            { x: col1 + g, y: c2th + g, w: col2, h: topH - c2th - g },
            { x: 0, y: topH + g, w, h: botH },
          ];
        },
      },
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    templates: [
      {
        id: 'sports-hero',
        label: 'Sports Hero Shot',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        vignette: true,
        gradient: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)',
        textArea: true,
      },
      {
        id: 'dual-action',
        label: 'Dual Action',
        slots: 2,
        zones: (w, h) => [
          { x: 0, y: 0, w: w / 2, h },
          { x: w / 2, y: 0, w: w / 2, h },
        ],
      },
      {
        id: 'triple-moment',
        label: 'Triple Moment',
        slots: 3,
        zones: (w, h, g = 3) => {
          const pw = (w - g * 2) / 3;
          return [
            { x: 0, y: 0, w: pw, h },
            { x: pw + g, y: 0, w: pw, h },
            { x: pw * 2 + g * 2, y: 0, w: pw, h },
          ];
        },
      },
      {
        id: 'player-profile',
        label: 'Player Profile',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        gradient: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)',
        textArea: true,
      },
      {
        id: 'stat-card',
        label: 'Stat Card',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w: Math.round(w * 0.55), h }],
        solidPanel: { color: '#111111', x: 0.55, textArea: true },
      },
      {
        id: 'squad-card',
        label: 'Squad Card',
        slots: 4,
        zones: (w, h, g = 4) => {
          const heroH = Math.round(h * 0.65);
          const stripH = h - heroH - g;
          const sw = (w - g * 2) / 3;
          return [
            { x: 0, y: 0, w, h: heroH },
            { x: 0, y: heroH + g, w: sw, h: stripH },
            { x: sw + g, y: heroH + g, w: sw, h: stripH },
            { x: sw * 2 + g * 2, y: heroH + g, w: sw, h: stripH },
          ];
        },
      },
      {
        id: 'score-card',
        label: 'Score Card',
        slots: 2,
        zones: (w, h) => [
          { x: 0, y: 0, w: (w - 80) / 2, h },
          { x: (w - 80) / 2 + 80, y: 0, w: (w - 80) / 2, h },
        ],
        centerDivider: true,
        textArea: true,
      },
      {
        id: 'action-triptych',
        label: 'Action Triptych',
        slots: 3,
        zones: (w, h, g = 3) => {
          const rh = (h - g * 2) / 3;
          return [
            { x: 0, y: 0, w, h: rh },
            { x: 0, y: rh + g, w, h: rh },
            { x: 0, y: rh * 2 + g * 2, w, h: rh },
          ];
        },
      },
      {
        id: 'grid-recap',
        label: 'Grid Recap',
        slots: 6,
        titleBar: 60,
        zones: (w, h, g = 4) => {
          const top = 60;
          const cw = (w - g) / 2;
          const rh = (h - top - g * 2) / 3;
          return [
            { x: 0, y: top, w: cw, h: rh },
            { x: cw + g, y: top, w: cw, h: rh },
            { x: 0, y: top + rh + g, w: cw, h: rh },
            { x: cw + g, y: top + rh + g, w: cw, h: rh },
            { x: 0, y: top + (rh + g) * 2, w: cw, h: rh },
            { x: cw + g, y: top + (rh + g) * 2, w: cw, h: rh },
          ];
        },
      },
      {
        id: 'full-bleed-story',
        label: 'Full Bleed Story',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        gradient: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 33%, rgba(0,0,0,0) 67%, rgba(0,0,0,0.7) 100%)',
        textArea: true,
      },
      {
        id: 'split-story',
        label: 'Split Story',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h: Math.round(h * 0.5) }],
        solidPanel: { color: '#0D0D0D', y: 0.5, textArea: true },
      },
      {
        id: 'twitter-banner',
        label: 'Twitter/X Banner',
        slots: 1,
        zones: (w, h) => [{ x: 0, y: 0, w, h }],
        overlay: 'rgba(0,0,0,0.4)',
        textArea: true,
      },
    ],
  },
];

// ─── COLOR PRESETS ──────────────────────────────────────────────────────────────
export const WEDDING_PRESETS = [
  // ── Base ──
  { id: 'natural',          label: 'Natural',          vibe: 'True to life',              filter: 'none' },

  // ── Film Emulation ──
  { id: 'kodak-warm',       label: 'Kodak Warm',       vibe: 'Nostalgic & warm',          filter: 'sepia(0.15) brightness(1.05) contrast(0.95) saturate(1.1)' },
  { id: 'fuji-cool',        label: 'Fuji Cool',        vibe: 'Crisp & refined',           filter: 'hue-rotate(5deg) saturate(0.9) brightness(1.08) contrast(1.05)' },
  { id: 'kodak-portra',     label: 'Kodak Portra',     vibe: 'Skin-friendly & timeless',  filter: 'sepia(0.1) brightness(1.08) contrast(0.92) saturate(1.05) hue-rotate(-3deg)' },
  { id: 'cinematic-fade',   label: 'Cinematic Fade',   vibe: 'Soft & faded film look',    filter: 'brightness(1.1) contrast(0.85) saturate(0.8)' },

  // ── Wedding / Couple ──
  { id: 'airy-light',       label: 'Airy & Light',     vibe: 'Fresh & romantic',          filter: 'brightness(1.2) contrast(0.9) saturate(0.85)' },
  { id: 'pastel-soft',      label: 'Pastel Soft',      vibe: 'Gentle & dreamy',           filter: 'brightness(1.15) contrast(0.88) saturate(0.75) sepia(0.08)' },
  { id: 'champagne',        label: 'Champagne',        vibe: 'Luxe & overexposed',        filter: 'brightness(1.25) contrast(0.82) saturate(0.65) sepia(0.1)' },
  { id: 'golden-hour',      label: 'Golden Hour',      vibe: 'Warm glow & magic light',   filter: 'sepia(0.28) saturate(1.35) brightness(1.1) hue-rotate(-12deg) contrast(0.95)' },
  { id: 'rose-gold',        label: 'Rose Gold',        vibe: 'Blush & feminine warmth',   filter: 'hue-rotate(340deg) saturate(1.15) brightness(1.1) contrast(0.93) sepia(0.08)' },
  { id: 'ethereal',         label: 'Ethereal White',   vibe: 'Angelic & high-key',        filter: 'brightness(1.35) contrast(0.78) saturate(0.6) sepia(0.05)' },

  // ── Dreamy ──
  { id: 'dreamy-haze',      label: 'Dreamy Haze',      vibe: 'Soft focus & fairytale',    filter: 'brightness(1.28) contrast(0.8) saturate(0.65) sepia(0.06)' },
  { id: 'cotton-candy',     label: 'Cotton Candy',     vibe: 'Playful pastel pop',        filter: 'hue-rotate(330deg) saturate(0.85) brightness(1.22) contrast(0.85)' },
  { id: 'morning-mist',     label: 'Morning Mist',     vibe: 'Cool & hazy dawn',          filter: 'brightness(1.18) contrast(0.82) saturate(0.58) hue-rotate(5deg)' },
  { id: 'velvet-dusk',      label: 'Velvet Dusk',      vibe: 'Rich twilight mood',        filter: 'brightness(0.88) contrast(1.15) saturate(1.12) hue-rotate(8deg)' },

  // ── Moody / Editorial ──
  { id: 'moody-dark',       label: 'Moody Dark',       vibe: 'Dramatic & intense',        filter: 'brightness(0.85) contrast(1.2) saturate(0.9)' },
  { id: 'sunset-warm',      label: 'Sunset Warm',      vibe: 'Golden & emotional',        filter: 'sepia(0.2) saturate(1.2) brightness(1.05) hue-rotate(-10deg)' },
  { id: 'lush-greens',      label: 'Lush Greens',      vibe: 'Outdoor & garden fresh',    filter: 'hue-rotate(12deg) saturate(1.2) brightness(1.02) contrast(1.06)' },
  { id: 'overcast-blue',    label: 'Overcast Blue',    vibe: 'Calm & intimate grey',      filter: 'hue-rotate(10deg) saturate(0.85) brightness(1.05)' },
  { id: 'film-noir-mix',    label: 'Film Noir',        filter: 'grayscale(0.55) contrast(1.2) brightness(0.95) sepia(0.1)',
    vibe: 'Mysterious & editorial' },

  // ── Black & White ──
  { id: 'clean-bw',         label: 'Clean B&W',        vibe: 'Timeless & classic',        filter: 'grayscale(1) contrast(1.1)' },
  { id: 'hc-bw',            label: 'Hi-Con B&W',       vibe: 'Bold contrast & drama',     filter: 'grayscale(1) contrast(1.4) brightness(0.95)' },
  { id: 'soft-bw',          label: 'Soft B&W',         vibe: 'Gentle & nostalgic',        filter: 'grayscale(1) contrast(0.9) brightness(1.1)' },
  { id: 'selenium',         label: 'Selenium',         vibe: 'Fine art darkroom',         filter: 'grayscale(1) contrast(1.1) brightness(1.02) sepia(0.18)' },

  // ── New Popular Looks ──
  { id: 'matte-fade',       label: 'Matte Fade',       vibe: 'Flat & modern — VSCO-inspired', filter: 'brightness(1.12) contrast(0.72) saturate(0.88)' },
  { id: 'lomo-chrome',      label: 'Lomo Chrome',      vibe: 'Vivid cross-processed film',    filter: 'hue-rotate(15deg) saturate(1.65) contrast(1.28) brightness(0.97)' },
  { id: 'autumn-ember',     label: 'Autumn Ember',     vibe: 'Rich amber & rust tones',       filter: 'sepia(0.35) saturate(1.45) hue-rotate(-18deg) brightness(1.06) contrast(1.08)' },
  { id: 'dusty-lavender',   label: 'Dusty Lavender',   vibe: 'Misty lilac & romantic',        filter: 'hue-rotate(282deg) saturate(0.68) brightness(1.12) contrast(0.88)' },
  { id: 'faded-teal',       label: 'Faded Teal',       vibe: 'Moody editorial teal fade',     filter: 'hue-rotate(175deg) saturate(0.62) brightness(1.15) contrast(0.85)' },
];

export const SPORTS_PRESETS = [
  // ── Base ──
  { id: 'natural',          label: 'Natural',          vibe: 'True to life',              filter: 'none' },

  // ── Punchy / Action ──
  { id: 'stadium-punch',    label: 'Stadium Punch',    vibe: 'Vivid & electric energy',   filter: 'contrast(1.3) saturate(1.4) brightness(1.05)' },
  { id: 'clean-bright',     label: 'Clean & Bright',   vibe: 'Sharp & professional',      filter: 'brightness(1.1) contrast(1.1) saturate(1.15)' },
  { id: 'golden-glory',     label: 'Golden Glory',     vibe: 'Championship moment feel',  filter: 'sepia(0.15) saturate(1.35) brightness(1.08) contrast(1.15) hue-rotate(-10deg)' },
  { id: 'action-red',       label: 'Action Red',       vibe: 'High-intensity & bold',     filter: 'hue-rotate(-8deg) saturate(1.5) contrast(1.25) brightness(1.02)' },

  // ── Cinematic ──
  { id: 'warrior-grade',    label: 'Warrior Grade',    vibe: 'Cinematic battle-ready',    filter: 'hue-rotate(-15deg) saturate(1.3) contrast(1.2)' },
  { id: 'netflix-doc',      label: 'Netflix Doc',      vibe: 'Film documentary realism',  filter: 'hue-rotate(-20deg) saturate(1.2) contrast(1.18) brightness(0.97)' },
  { id: 'teal-orange',      label: 'Teal & Orange',    vibe: 'Hollywood blockbuster',     filter: 'hue-rotate(-18deg) saturate(1.4) contrast(1.15) brightness(1.02)' },

  // ── Gritty / Raw ──
  { id: 'bleach-bypass',    label: 'Bleach Bypass',    vibe: 'Gritty desaturated punch',  filter: 'saturate(0.3) contrast(1.4)' },
  { id: 'dust-gravel',      label: 'Dust & Gravel',    vibe: 'Raw outdoor & earthy',      filter: 'sepia(0.25) saturate(1.1) brightness(1.05) hue-rotate(-5deg)' },
  { id: 'raw-earth',        label: 'Raw Earth',        vibe: 'Rugged & authentic feel',   filter: 'sepia(0.35) saturate(1.05) contrast(1.1) brightness(1.0) hue-rotate(-8deg)' },

  // ── Night / Indoor ──
  { id: 'neon-night',       label: 'Neon Night',       vibe: 'Stadium lights & energy',   filter: 'hue-rotate(10deg) saturate(1.2) brightness(1.1) contrast(1.15)' },
  { id: 'ice-blue',         label: 'Ice Blue',         vibe: 'Cool indoor arena glow',    filter: 'hue-rotate(195deg) saturate(0.9) brightness(1.08) contrast(1.12)' },
  { id: 'indoor-tungsten',  label: 'Indoor Tungsten',  vibe: 'Warm court/gym lighting',   filter: 'sepia(0.3) saturate(1.1) brightness(1.05) hue-rotate(-20deg) contrast(1.05)' },

  // ── Black & White ──
  { id: 'bw-impact',        label: 'B&W Impact',       vibe: 'Powerful & newspaper press',filter: 'grayscale(1) contrast(1.5) brightness(0.9)' },
  { id: 'bw-dramatic',      label: 'B&W Dramatic',     vibe: 'Classic sports photography',filter: 'grayscale(1) contrast(1.6) brightness(0.85) sepia(0.05)' },
  { id: 'bw-clean-sport',   label: 'B&W Clean',        vibe: 'Crisp editorial B&W',       filter: 'grayscale(1) contrast(1.2) brightness(1.05)' },

  // ── New Popular Looks ──
  { id: 'cross-process',    label: 'Cross Process',    vibe: 'Psychedelic film cross',        filter: 'hue-rotate(22deg) saturate(1.8) contrast(1.3) brightness(0.94)' },
  { id: 'hyper-vivid',      label: 'Hyper Vivid',      vibe: 'Max saturation & pop',          filter: 'saturate(1.95) contrast(1.25) brightness(1.05)' },
  { id: 'purple-haze',      label: 'Purple Haze',      vibe: 'Violet & electric atmosphere',  filter: 'hue-rotate(258deg) saturate(1.12) brightness(1.06) contrast(1.15)' },
  { id: 'amber-strike',     label: 'Amber Strike',     vibe: 'Aggressive warm & punchy',      filter: 'sepia(0.28) saturate(1.55) hue-rotate(-22deg) brightness(1.08) contrast(1.22)' },
  { id: 'infrared',         label: 'Infrared',         vibe: 'Surreal shifted spectrum',      filter: 'hue-rotate(100deg) saturate(1.35) contrast(1.15) brightness(1.02)' },
];

// ─── FONTS ──────────────────────────────────────────────────────────────────────
export const FONT_BUCKETS = [
  {
    id: 'romantic',
    label: 'Romantic / Editorial',
    mode: 'wedding',
    fonts: ['Playfair Display', 'Cormorant Garamond', 'IM Fell English', 'Bodoni Moda'],
  },
  {
    id: 'modern',
    label: 'Modern Minimal',
    mode: 'both',
    fonts: ['Josefin Sans', 'DM Sans', 'Raleway', 'Tenor Sans'],
  },
  {
    id: 'cinematic',
    label: 'Cinematic / Luxury',
    mode: 'both',
    fonts: ['Cinzel', 'Bebas Neue', 'Italiana', 'Forum'],
  },
  {
    id: 'handwritten',
    label: 'Handwritten / Organic',
    mode: 'wedding',
    fonts: ['Dancing Script', 'Great Vibes', 'Sacramento', 'Parisienne'],
  },
  {
    id: 'hype',
    label: 'Hype / Bold',
    mode: 'sports',
    fonts: ['Bebas Neue', 'Anton', 'Barlow Condensed', 'Oswald'],
  },
  {
    id: 'sports-headline',
    label: 'Player Name / Sports',
    mode: 'sports',
    fonts: ['Rajdhani', 'Teko', 'Russo One', 'Big Shoulders Display'],
  },
  {
    id: 'mono',
    label: 'Stats / Monospace',
    mode: 'sports',
    fonts: ['DM Mono', 'Space Mono', 'IBM Plex Mono', 'Roboto Mono'],
  },
  {
    id: 'cultural',
    label: 'Cultural / Community',
    mode: 'both',
    fonts: ['Yatra One', 'Tiro Devanagari Latin', 'Noto Serif Devanagari', 'Hind'],
  },
];

// Google Fonts URL name mappings (some need +weight suffix or different name)
export const GOOGLE_FONT_NAMES = {
  'Playfair Display': 'Playfair+Display:ital,wght@0,400;0,700;1,400',
  'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400',
  'IM Fell English': 'IM+Fell+English:ital@0;1',
  'Bodoni Moda': 'Bodoni+Moda:ital,wght@0,400;0,700;1,400',
  'Josefin Sans': 'Josefin+Sans:wght@300;400;600;700',
  'DM Sans': 'DM+Sans:wght@300;400;500;700',
  'Raleway': 'Raleway:wght@300;400;600;700',
  'Tenor Sans': 'Tenor+Sans',
  'Cinzel': 'Cinzel:wght@400;700;900',
  'Bebas Neue': 'Bebas+Neue',
  'Italiana': 'Italiana',
  'Forum': 'Forum',
  'Dancing Script': 'Dancing+Script:wght@400;700',
  'Great Vibes': 'Great+Vibes',
  'Sacramento': 'Sacramento',
  'Parisienne': 'Parisienne',
  'Anton': 'Anton',
  'Barlow Condensed': 'Barlow+Condensed:wght@400;600;700',
  'Oswald': 'Oswald:wght@400;600;700',
  'Rajdhani': 'Rajdhani:wght@400;600;700',
  'Teko': 'Teko:wght@400;600;700',
  'Russo One': 'Russo+One',
  'Big Shoulders Display': 'Big+Shoulders+Display:wght@400;700;900',
  'DM Mono': 'DM+Mono:wght@400;500',
  'Space Mono': 'Space+Mono:wght@400;700',
  'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;700',
  'Roboto Mono': 'Roboto+Mono:wght@400;700',
  'Yatra One': 'Yatra+One',
  'Tiro Devanagari Latin': 'Tiro+Devanagari+Latin',
  'Noto Serif Devanagari': 'Noto+Serif+Devanagari',
  'Hind': 'Hind:wght@400;600;700',
};

// ─── QUICK TEXT STYLES ───────────────────────────────────────────────────────────
export const QUICK_STYLES_WEDDING = [
  {
    id: 'romantic-quote',
    label: 'Romantic Quote',
    style: { font: 'Cormorant Garamond', size: 52, color: '#FFFFFF', align: 'center', letterSpacing: 3, italic: true, shadow: true, opacity: 1 },
  },
  {
    id: 'elegant-caption',
    label: 'Elegant Caption',
    style: { font: 'Josefin Sans', size: 28, color: '#FFFFFF', align: 'center', letterSpacing: 6, transform: 'uppercase', opacity: 0.8 },
  },
  {
    id: 'editorial-overlay',
    label: 'Editorial Overlay',
    style: { font: 'Cinzel', size: 64, color: '#FFFFFF', align: 'center', transform: 'uppercase', letterSpacing: 10 },
  },
  {
    id: 'date-location',
    label: 'Date / Location',
    style: { font: 'DM Sans', size: 22, color: '#FFFFFF', align: 'center', opacity: 0.7 },
  },
];

export const QUICK_STYLES_SPORTS = [
  {
    id: 'player-name',
    label: 'Player Name Card',
    style: { font: 'Bebas Neue', size: 96, color: '#FFFFFF', letterSpacing: 8, transform: 'uppercase', shadow: true },
  },
  {
    id: 'stat-block',
    label: 'Stat Block',
    style: { font: 'DM Mono', size: 48, color: '#FFFFFF', transform: 'uppercase' },
  },
  {
    id: 'match-result',
    label: 'Match Result',
    style: { font: 'Russo One', size: 72, color: '#FFFFFF', align: 'center', transform: 'uppercase' },
  },
  {
    id: 'caption-strip',
    label: 'Caption Strip',
    style: { font: 'Barlow Condensed', size: 32, color: '#FFFFFF', opacity: 0.8 },
  },
  {
    id: 'team-name',
    label: 'Team Name',
    style: { font: 'Anton', size: 56, color: '#00A8FF', transform: 'uppercase' },
  },
  {
    id: 'hashtag-strip',
    label: 'Hashtag Strip',
    style: { font: 'DM Sans', size: 24, color: '#FFFFFF', opacity: 0.6, transform: 'lowercase' },
  },
];

// ─── TEXT COLOR PRESETS ──────────────────────────────────────────────────────────
export const TEXT_COLOR_PRESETS = [
  { color: '#FFFFFF', label: 'White' },
  { color: '#000000', label: 'Black' },
  { color: '#F5F0E8', label: 'Cream' },
  { color: '#2C2C2C', label: 'Charcoal' },
  { color: '#C9A96E', label: 'Gold' },
  { color: '#00A8FF', label: 'Electric Blue' },
  { color: '#E63946', label: 'Red' },
];

// ─── PHOTO LIMIT ─────────────────────────────────────────────────────────────────
export const MAX_PHOTOS = 30;

// ─── ONBOARDING VIBES ────────────────────────────────────────────────────────────
export const VIBES = {
  wedding: [
    { id: 'ceremony',   label: 'Wedding Ceremony',      icon: '💒' },
    { id: 'couple',     label: 'Couple Portraits',       icon: '💑' },
    { id: 'engagement', label: 'Engagement Session',     icon: '💍' },
    { id: 'reception',  label: 'Reception / Party',      icon: '🥂' },
    { id: 'fineart',    label: 'Pre-Wedding / Fine Art', icon: '🌿' },
  ],
  sports: [
    { id: 'team',       label: 'Team Shot',              icon: '🏆' },
    { id: 'highlights', label: 'Match Highlights',       icon: '⚽' },
    { id: 'player',     label: 'Player Feature',         icon: '⭐' },
    { id: 'action',     label: 'Action Shots',           icon: '⚡' },
    { id: 'training',   label: 'Training / BTS',         icon: '💪' },
  ],
};

// Ordered template category IDs per vibe (most relevant first)
export const VIBE_TEMPLATE_ORDER = {
  ceremony:   ['single', 'cinematic', 'stacked', 'collage', 'sports'],
  couple:     ['single', 'stacked', 'cinematic', 'collage', 'sports'],
  engagement: ['cinematic', 'single', 'stacked', 'collage', 'sports'],
  reception:  ['collage', 'stacked', 'single', 'cinematic', 'sports'],
  fineart:    ['cinematic', 'single', 'stacked', 'collage', 'sports'],
  team:       ['collage', 'stacked', 'sports', 'single', 'cinematic'],
  highlights: ['stacked', 'cinematic', 'sports', 'collage', 'single'],
  player:     ['single', 'sports', 'cinematic', 'stacked', 'collage'],
  action:     ['sports', 'single', 'cinematic', 'stacked', 'collage'],
  training:   ['stacked', 'collage', 'sports', 'cinematic', 'single'],
};

// ─── TEXT PRESETS ────────────────────────────────────────────────────────────────
export const TEXT_PRESETS = [
  // Wedding / Editorial
  { id: 'tp-romantic',     label: 'Romantic Script', category: 'wedding', preview: 'Great Vibes',         style: { font: 'Great Vibes',          size: 72, italic: false, bold: false, color: '#FFFFFF', letterSpacing: 2,  transform: 'none',      align: 'center', shadow: true,  shadowIntensity: 8 } },
  { id: 'tp-elegant',      label: 'Elegant Serif',   category: 'wedding', preview: 'Cormorant Garamond',  style: { font: 'Cormorant Garamond',   size: 56, italic: true,  bold: false, color: '#FFFFFF', letterSpacing: 6,  transform: 'uppercase', align: 'center', shadow: true,  shadowIntensity: 5 } },
  { id: 'tp-minimal',      label: 'Minimal Caps',    category: 'wedding', preview: 'Josefin Sans',        style: { font: 'Josefin Sans',         size: 28, italic: false, bold: false, color: '#FFFFFF', letterSpacing: 12, transform: 'uppercase', align: 'center', shadow: false } },
  { id: 'tp-gold',         label: 'Gold Foil',       category: 'wedding', preview: 'Playfair Display',    style: { font: 'Playfair Display',     size: 52, italic: false, bold: true,  color: '#C9A96E', letterSpacing: 3,  transform: 'none',      align: 'center', shadow: true,  shadowIntensity: 6, gradient: { angle: 135, stops: ['#C9A96E', '#F5E6C8', '#C9A96E'] } } },
  // Couples / Love
  { id: 'tp-love',         label: 'Love Vibes',      category: 'couples', preview: 'Dancing Script',      style: { font: 'Dancing Script',       size: 60, italic: false, bold: false, color: '#FFB3C6', letterSpacing: 1,  transform: 'none',      align: 'center', shadow: true,  shadowIntensity: 8, gradient: { angle: 135, stops: ['#FFB3C6', '#FF8FAB', '#C77DFF'] } } },
  { id: 'tp-dreamy',       label: 'Dreamy Italic',   category: 'couples', preview: 'Lora',                style: { font: 'Lora',                 size: 48, italic: true,  bold: false, color: '#FFE4E1', letterSpacing: 1,  transform: 'none',      align: 'center', shadow: true,  shadowIntensity: 10 } },
  { id: 'tp-couple-names', label: 'Couple Names',    category: 'couples', preview: 'DM Mono',             style: { font: 'DM Mono',              size: 22, italic: false, bold: false, color: '#FFFFFF', letterSpacing: 6,  transform: 'uppercase', align: 'center', shadow: false } },
  // Sports
  { id: 'tp-hype',         label: 'Hype Bold',       category: 'sports',  preview: 'Bebas Neue',          style: { font: 'Bebas Neue',           size: 80, italic: false, bold: false, color: '#FFFFFF', letterSpacing: 6,  transform: 'uppercase', align: 'center', shadow: true,  shadowIntensity: 8 } },
  { id: 'tp-fire',         label: 'Fire Stats',      category: 'sports',  preview: 'Barlow Condensed',    style: { font: 'Barlow Condensed',     size: 64, italic: true,  bold: true,  color: '#FF6B35', letterSpacing: 2,  transform: 'uppercase', align: 'center', shadow: true,  shadowIntensity: 6, gradient: { angle: 90, stops: ['#FF6B35', '#FFD700'] } } },
  { id: 'tp-athletic',     label: 'Athletic',        category: 'sports',  preview: 'Oswald',              style: { font: 'Oswald',               size: 52, italic: false, bold: false, color: '#00A8FF', letterSpacing: 8,  transform: 'uppercase', align: 'center', shadow: false } },
  { id: 'tp-action',       label: 'Action Block',    category: 'sports',  preview: 'Anton',               style: { font: 'Anton',                size: 72, italic: false, bold: false, color: '#FFFFFF', letterSpacing: 4,  transform: 'uppercase', align: 'center', bgPill: true, bgColor: 'rgba(0,0,0,0.75)', shadow: false } },
];

// ─── DEFAULT SLIDE ────────────────────────────────────────────────────────────────
export function createDefaultSlide(id) {
  return {
    id,
    templateId: 'full-bleed',
    ratio: '1:1',
    photoAssignments: {},
    textBlocks: [],
    presets: {},
    globalPreset: 'natural',
    borderSettings: {
      innerBorder: 'none',
      gutter: 4,
      gutterColor: '#FFFFFF',
      bgColor: '#FFFFFF',
      vignette: false,
    },
    logoSettings: {
      enabled: false,
      x: 0.85,
      y: 0.9,
      scale: 0.15,
      opacity: 1,
    },
    zoom: { x: {}, y: {}, scale: {} },
  };
}

export function createDefaultTextBlock(id, accentColor) {
  return {
    id,
    text: 'Your Text Here',
    x: 50,
    y: 50,
    font: 'DM Sans',
    size: 36,
    color: '#FFFFFF',
    align: 'center',
    opacity: 1,
    letterSpacing: 0,
    lineHeight: 1.2,
    transform: 'none',
    bold: false,
    italic: false,
    shadow: false,
    shadowIntensity: 4,
    bgPill: false,
    width: 400,
  };
}
