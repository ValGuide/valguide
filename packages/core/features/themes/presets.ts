import type { ThemeColors, ThemeFonts, ThemePreset } from './types'

export const themeColorPresets: Record<ThemePreset, ThemeColors> = {
  light: {
    background: '#ffffff',
    foreground: '#0a0a0c',
    card: '#ffffff',
    cardForeground: '#0a0a0c',
    popover: '#ffffff',
    popoverForeground: '#0a0a0c',
    primary: '#18181b',
    primaryForeground: '#fafafa',
    secondary: '#f4f4f5',
    secondaryForeground: '#18181b',
    muted: '#f4f4f5',
    mutedForeground: '#71717a',
    accent: '#f4f4f5',
    accentForeground: '#18181b',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#0a0a0c',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#171717',
    cardForeground: '#fafafa',
    popover: '#171717',
    popoverForeground: '#fafafa',
    primary: '#fafafa',
    primaryForeground: '#171717',
    secondary: '#262626',
    secondaryForeground: '#fafafa',
    muted: '#262626',
    mutedForeground: '#a3a3a3',
    accent: '#262626',
    accentForeground: '#fafafa',
    destructive: '#dc2626',
    destructiveForeground: '#fafafa',
    border: '#262626',
    input: '#262626',
    ring: '#737373',
  },
  blue: {
    background: '#f0f7ff',
    foreground: '#00264d',
    card: '#e6f0ff',
    cardForeground: '#003366',
    popover: '#dce9ff',
    popoverForeground: '#004080',
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#93c5fd',
    secondaryForeground: '#00264d',
    muted: '#bfdbfe',
    mutedForeground: '#1e3a5f',
    accent: '#60a5fa',
    accentForeground: '#001a33',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    border: '#7dd3fc',
    input: '#7dd3fc',
    ring: '#2563eb',
  },
  'blue-dark': {
    background: '#0f172a',
    foreground: '#d1e3ff',
    card: '#1e293b',
    cardForeground: '#e8f0ff',
    popover: '#293548',
    popoverForeground: '#dce8ff',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#334155',
    secondaryForeground: '#d1e3ff',
    muted: '#475569',
    mutedForeground: '#b3cfff',
    accent: '#3b72d6',
    accentForeground: '#cce0ff',
    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',
    border: '#527bb8',
    input: '#527bb8',
    ring: '#3b82f6',
  },
  green: {
    background: '#dcfce7',
    foreground: '#052e16',
    card: '#d1fae5',
    cardForeground: '#064e3b',
    popover: '#bbf7d0',
    popoverForeground: '#065f46',
    primary: '#16a34a',
    primaryForeground: '#ffffff',
    secondary: '#6ee7b7',
    secondaryForeground: '#065f46',
    muted: '#86efac',
    mutedForeground: '#166534',
    accent: '#22c55e',
    accentForeground: '#052e16',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    border: '#4ade80',
    input: '#4ade80',
    ring: '#16a34a',
  },
  'green-dark': {
    background: '#052e16',
    foreground: '#d1fae5',
    card: '#064e3b',
    cardForeground: '#ecfdf5',
    popover: '#065f46',
    popoverForeground: '#d1fae5',
    primary: '#16a34a',
    primaryForeground: '#ffffff',
    secondary: '#166534',
    secondaryForeground: '#d1fae5',
    muted: '#14532d',
    mutedForeground: '#6ee7b7',
    accent: '#15803d',
    accentForeground: '#d1fae5',
    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',
    border: '#14532d',
    input: '#14532d',
    ring: '#16a34a',
  },
  purple: {
    background: '#faf5ff',
    foreground: '#3b0764',
    card: '#f3e8ff',
    cardForeground: '#4c1d95',
    popover: '#ede9fe',
    popoverForeground: '#5b21b6',
    primary: '#9333ea',
    primaryForeground: '#ffffff',
    secondary: '#c4b5fd',
    secondaryForeground: '#3b0764',
    muted: '#ddd6fe',
    mutedForeground: '#6b21a8',
    accent: '#a855f7',
    accentForeground: '#1e0533',
    destructive: '#ef4444',
    destructiveForeground: '#fafafa',
    border: '#c084fc',
    input: '#c084fc',
    ring: '#9333ea',
  },
  'purple-dark': {
    background: '#2e1065',
    foreground: '#f5f3ff',
    card: '#3b0764',
    cardForeground: '#faf5ff',
    popover: '#4c1d95',
    popoverForeground: '#f5f3ff',
    primary: '#a855f7',
    primaryForeground: '#ffffff',
    secondary: '#581c87',
    secondaryForeground: '#f5f3ff',
    muted: '#6b21a8',
    mutedForeground: '#c4b5fd',
    accent: '#7e22ce',
    accentForeground: '#f5f3ff',
    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',
    border: '#6b21a8',
    input: '#6b21a8',
    ring: '#a855f7',
  },
  // ========================
  // SAGE - Soft teal/sage, gallery greens, botanical feel
  // Calming, professional, pairs beautifully with art
  // ========================
  sage: {
    background: '#f8faf9', // Soft sage-tinted white
    foreground: '#1f2d2a', // Deep forest
    card: '#ffffff',
    cardForeground: '#1f2d2a',
    popover: '#ffffff',
    popoverForeground: '#1f2d2a',
    primary: '#4a8f7a', // Soft sage green
    primaryForeground: '#ffffff',
    secondary: '#e8f0ec', // Light sage tint
    secondaryForeground: '#2a3f38',
    muted: '#eef3f0', // Very soft sage
    mutedForeground: '#5a7068', // Muted sage text
    accent: '#dbeae3', // Gentle sage highlight
    accentForeground: '#2a3f38',
    destructive: '#c45c5c', // Softer red
    destructiveForeground: '#ffffff',
    border: '#d4e0da', // Soft sage border
    input: '#d4e0da',
    ring: '#4a8f7a',
  },
  'sage-dark': {
    background: '#141c19', // Deep forest
    foreground: '#e5ebe8', // Soft sage white
    card: '#1a2522', // Dark sage surface
    cardForeground: '#e8ede9',
    popover: '#1e2a26',
    popoverForeground: '#e5ebe8',
    primary: '#5fa88f', // Lighter sage for dark bg
    primaryForeground: '#ffffff',
    secondary: '#243530', // Dark sage
    secondaryForeground: '#d8e2dc',
    muted: '#1e2a26', // Subtle dark sage
    mutedForeground: '#8fa89c', // Muted sage text
    accent: '#2a3b35', // Subtle sage highlight
    accentForeground: '#d8e2dc',
    destructive: '#b85555',
    destructiveForeground: '#ffffff',
    border: '#2a3b35',
    input: '#2f423b',
    ring: '#5fa88f',
  },

  // ========================
  // STONE - Warm taupe/stone, gallery wall neutrals
  // Sophisticated, timeless, unobtrusive
  // ========================
  stone: {
    background: '#faf9f7', // Warm stone white
    foreground: '#2c2825', // Warm charcoal
    card: '#ffffff',
    cardForeground: '#2c2825',
    popover: '#ffffff',
    popoverForeground: '#2c2825',
    primary: '#7d7167', // Warm taupe
    primaryForeground: '#ffffff',
    secondary: '#f0ece8', // Light stone
    secondaryForeground: '#3d3632',
    muted: '#f3f0ec', // Soft stone
    mutedForeground: '#6b635c', // Muted stone text
    accent: '#e8e2db', // Gentle stone highlight
    accentForeground: '#3d3632',
    destructive: '#b85c5c', // Softer red
    destructiveForeground: '#ffffff',
    border: '#ddd6ce', // Soft stone border
    input: '#ddd6ce',
    ring: '#7d7167',
  },
  'stone-dark': {
    background: '#1a1816', // Deep warm charcoal
    foreground: '#e8e4df', // Soft stone white
    card: '#222019', // Dark stone surface
    cardForeground: '#ebe7e2',
    popover: '#26231c',
    popoverForeground: '#e8e4df',
    primary: '#9a8d82', // Lighter taupe for dark bg
    primaryForeground: '#ffffff',
    secondary: '#2e2a25', // Dark stone
    secondaryForeground: '#dbd5cd',
    muted: '#26231e', // Subtle dark stone
    mutedForeground: '#958b80', // Muted stone text
    accent: '#332f29', // Subtle stone highlight
    accentForeground: '#dbd5cd',
    destructive: '#a85050',
    destructiveForeground: '#ffffff',
    border: '#332f29',
    input: '#3a352e',
    ring: '#9a8d82',
  },

  // ========================
  // LAVENDER - Soft lavender/dusty blue
  // Gentle, modern, serene and approachable
  // ========================
  lavender: {
    background: '#f9f9fc', // Soft lavender-tinted white
    foreground: '#252535', // Soft navy
    card: '#ffffff',
    cardForeground: '#252535',
    popover: '#ffffff',
    popoverForeground: '#252535',
    primary: '#7c7aa8', // Soft lavender
    primaryForeground: '#ffffff',
    secondary: '#eeeef5', // Light lavender tint
    secondaryForeground: '#3a3850',
    muted: '#f2f1f7', // Very soft lavender
    mutedForeground: '#6b6988', // Muted lavender text
    accent: '#e4e3f0', // Gentle lavender highlight
    accentForeground: '#3a3850',
    destructive: '#c45c6c', // Softer rose-red
    destructiveForeground: '#ffffff',
    border: '#d8d7e5', // Soft lavender border
    input: '#d8d7e5',
    ring: '#7c7aa8',
  },
  'lavender-dark': {
    background: '#16161e', // Deep navy
    foreground: '#e6e5f0', // Soft lavender white
    card: '#1c1c28', // Dark lavender surface
    cardForeground: '#e9e8f2',
    popover: '#20202d',
    popoverForeground: '#e6e5f0',
    primary: '#9593c0', // Lighter lavender for dark bg
    primaryForeground: '#ffffff',
    secondary: '#282838', // Dark lavender
    secondaryForeground: '#dbd9ea',
    muted: '#20202d', // Subtle dark lavender
    mutedForeground: '#9997b5', // Muted lavender text
    accent: '#2d2d40', // Subtle lavender highlight
    accentForeground: '#dbd9ea',
    destructive: '#b05060',
    destructiveForeground: '#ffffff',
    border: '#2d2d40',
    input: '#333348',
    ring: '#9593c0',
  },

  // ========================
  // SAND - Warm sand/ochre, earth tones
  // Natural history museum feel, grounded and organic
  // ========================
  sand: {
    background: '#faf8f5', // Warm sand white
    foreground: '#2d2820', // Warm earth brown
    card: '#ffffff',
    cardForeground: '#2d2820',
    popover: '#ffffff',
    popoverForeground: '#2d2820',
    primary: '#a08560', // Warm ochre/sand
    primaryForeground: '#ffffff',
    secondary: '#f2ede5', // Light sand
    secondaryForeground: '#3d3528',
    muted: '#f5f0e8', // Soft sand
    mutedForeground: '#736a58', // Muted sand text
    accent: '#ebe3d5', // Gentle sand highlight
    accentForeground: '#3d3528',
    destructive: '#b86050', // Earthy red
    destructiveForeground: '#ffffff',
    border: '#e0d6c6', // Soft sand border
    input: '#e0d6c6',
    ring: '#a08560',
  },
  'sand-dark': {
    background: '#1a1712', // Deep earth brown
    foreground: '#e8e3da', // Soft sand white
    card: '#221e18', // Dark sand surface
    cardForeground: '#ebe6dd',
    popover: '#26221a',
    popoverForeground: '#e8e3da',
    primary: '#b89970', // Lighter ochre for dark bg
    primaryForeground: '#ffffff',
    secondary: '#2e2820', // Dark sand
    secondaryForeground: '#ddd6c8',
    muted: '#262118', // Subtle dark sand
    mutedForeground: '#a09580', // Muted sand text
    accent: '#342e24', // Subtle sand highlight
    accentForeground: '#ddd6c8',
    destructive: '#a85545',
    destructiveForeground: '#ffffff',
    border: '#342e24',
    input: '#3b342a',
    ring: '#b89970',
  },

  // ========================
  // GALLERY - Warm parchment with sage green & terracotta
  // Museum gallery feel, combining warmth with natural elements
  // ========================
  gallery: {
    background: '#faf8f4', // Soft warm parchment
    foreground: '#2a2520', // Deep warm charcoal
    card: '#ffffff',
    cardForeground: '#2a2520',
    popover: '#ffffff',
    popoverForeground: '#2a2520',
    primary: '#4a6b5a', // Muted Sage Green
    primaryForeground: '#fafafa',
    secondary: '#b5725a', // Terracotta
    secondaryForeground: '#fafafa',
    muted: '#ece6dc', // Soft warm muted
    mutedForeground: '#6b6158', // Muted warm text
    accent: '#e8e0d4', // Gentle parchment highlight
    accentForeground: '#3a3530',
    destructive: '#c45c5c', // Softer red
    destructiveForeground: '#ffffff',
    border: '#dfd6c8', // Soft stone border
    input: '#dfd6c8',
    ring: '#4a6b5a',
  },
  'gallery-dark': {
    background: '#1a1815', // Deep warm charcoal
    foreground: '#e8e4dc', // Soft parchment white
    card: '#222018', // Dark parchment surface
    cardForeground: '#ebe7df',
    popover: '#26241c',
    popoverForeground: '#e8e4dc',
    primary: '#6a8b7a', // Lighter sage for dark bg
    primaryForeground: '#ffffff',
    secondary: '#c08268', // Lighter terracotta for dark bg
    secondaryForeground: '#ffffff',
    muted: '#26241c', // Subtle dark parchment
    mutedForeground: '#a09888', // Muted warm text
    accent: '#322f26', // Subtle warm highlight
    accentForeground: '#dbd6c8',
    destructive: '#b85555',
    destructiveForeground: '#ffffff',
    border: '#322f26',
    input: '#3a362c',
    ring: '#6a8b7a',
  },

  // ========================
  // CURATOR - Psychology-optimized museum SaaS theme
  // Research-backed design for non-technical cultural institution staff
  // - Warm off-white reduces eye strain (vs pure white)
  // - Deep forest green: stability, growth, cultural trust
  // - Bronze secondary: artifact warmth, premium without flashy
  // - WCAG AAA contrast ratios for aging demographics
  // - Generous visual breathing room mirrors gallery spacing
  // ========================
  curator: {
    background: '#faf9f6', // Warm archival paper white (reduces eye strain)
    foreground: '#1a1a18', // Near-black with warmth (softer than pure black)
    card: '#ffffff',
    cardForeground: '#1a1a18',
    popover: '#ffffff',
    popoverForeground: '#1a1a18',
    primary: '#2d4a3e', // Deep forest green - institutional trust
    primaryForeground: '#fafafa',
    secondary: '#8b6b4a', // Warm bronze - artifact/premium feel
    secondaryForeground: '#fafafa',
    muted: '#f0eeea', // Very subtle warm gray
    mutedForeground: '#5c5a55', // High contrast muted text (AAA)
    accent: '#e8e5de', // Gentle warm highlight
    accentForeground: '#2a2926',
    destructive: '#b54a4a', // Muted red (less alarming)
    destructiveForeground: '#ffffff',
    border: '#e2dfd8', // Soft warm border
    input: '#e2dfd8',
    ring: '#2d4a3e',
  },
  'curator-dark': {
    background: '#141413', // Deep warm black (not pure black - reduces strain)
    foreground: '#f0eeea', // Warm off-white
    card: '#1c1b1a', // Subtle card elevation
    cardForeground: '#f2f0ec',
    popover: '#201f1e',
    popoverForeground: '#f0eeea',
    primary: '#5a8a72', // Lifted forest green for dark mode
    primaryForeground: '#ffffff',
    secondary: '#c4a882', // Warm bronze for dark bg
    secondaryForeground: '#1a1a18',
    muted: '#252422', // Subtle warm dark muted
    mutedForeground: '#9c9a94', // High contrast muted (AAA)
    accent: '#2c2a28', // Subtle warm highlight
    accentForeground: '#e8e5de',
    destructive: '#c76b6b', // Softer red for dark mode
    destructiveForeground: '#ffffff',
    border: '#2c2a28',
    input: '#343230',
    ring: '#5a8a72',
  },

  // ========================
  // ANGLE - Warm off-white with dark forest green accents
  // Clean, professional SaaS aesthetic inspired by Angle Audio
  // ========================
  angle: {
    background: '#f5f3ed', // Warm off-white
    foreground: '#212530', // Dark charcoal
    card: '#ffffff',
    cardForeground: '#212530',
    popover: '#ffffff',
    popoverForeground: '#212530',
    primary: '#2a5c4d', // Dark forest green
    primaryForeground: '#ffffff',
    secondary: '#eae6dc', // Light warm
    secondaryForeground: '#2b3140',
    muted: '#e5e1d8', // Muted warm
    mutedForeground: '#686e7a', // Muted gray
    accent: '#e0dbd0', // Accent warm
    accentForeground: '#2b3140',
    destructive: '#c75050', // Softer red
    destructiveForeground: '#ffffff',
    border: '#dbd6c9', // Soft warm border
    input: '#dbd6c9',
    ring: '#2a5c4d',
  },
  'angle-dark': {
    background: '#161b1e', // Dark blue-gray
    foreground: '#eae6dc', // Warm off-white
    card: '#1f2528', // Dark surface
    cardForeground: '#f2efe8',
    popover: '#1f2528',
    popoverForeground: '#eae6dc',
    primary: '#45a183', // Brighter teal for dark bg
    primaryForeground: '#161b1e',
    secondary: '#2e3438', // Dark secondary
    secondaryForeground: '#e5e1d8',
    muted: '#2a2f32', // Dark muted
    mutedForeground: '#a39d91', // Muted warm text
    accent: '#32393e', // Dark accent
    accentForeground: '#e5e1d8',
    destructive: '#c54545', // Softer red
    destructiveForeground: '#ffffff',
    border: '#32393e',
    input: '#32393e',
    ring: '#45a183',
  },

  // ========================
  // CLAUDE - Anthropic-inspired warm terracotta theme
  // Professional, warm, and approachable AI aesthetic
  // ========================
  claude: {
    background: '#faf8f6', // Warm cream white
    foreground: '#1f1915', // Warm near-black
    card: '#ffffff',
    cardForeground: '#1f1915',
    popover: '#ffffff',
    popoverForeground: '#1f1915',
    primary: '#da7756', // Terracotta/coral
    primaryForeground: '#ffffff',
    secondary: '#f0ebe5', // Light warm
    secondaryForeground: '#2d2520',
    muted: '#f3eeea', // Soft warm muted
    mutedForeground: '#6b6158', // Muted warm text
    accent: '#ebe4dc', // Gentle warm highlight
    accentForeground: '#2d2520',
    destructive: '#c45050', // Softer red
    destructiveForeground: '#ffffff',
    border: '#e4ddd5', // Soft warm border
    input: '#e4ddd5',
    ring: '#da7756',
  },
  'claude-dark': {
    background: '#1a1614', // Deep warm charcoal
    foreground: '#f0ebe5', // Warm off-white
    card: '#221e1a', // Dark warm surface
    cardForeground: '#f3eeea',
    popover: '#262220',
    popoverForeground: '#f0ebe5',
    primary: '#e8956e', // Lighter terracotta for dark bg
    primaryForeground: '#1a1614',
    secondary: '#2e2824', // Dark warm
    secondaryForeground: '#e8e2da',
    muted: '#262220', // Subtle dark muted
    mutedForeground: '#a09888', // Muted warm text
    accent: '#342e2a', // Subtle warm highlight
    accentForeground: '#e8e2da',
    destructive: '#c76b6b', // Softer red for dark mode
    destructiveForeground: '#ffffff',
    border: '#342e2a',
    input: '#3a3430',
    ring: '#e8956e',
  },
}

export const defaultRadius = 0.5

export const defaultFonts: ThemeFonts = {
  primary: {
    source: 'system',
    family: 'Inter',
    fallback: 'ui-sans-serif, system-ui, sans-serif',
  },
}
