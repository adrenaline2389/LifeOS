export const retroTokens = {
  colors: {
    ink: "#111111",
    paper: "#f7f7f0",
    desktop: "#c7c7bd",
    chrome: "#deded6",
    shadow: "#000000",
    highlight: "#ffffff",
    muted: "#666666",
    accent: "#1f5c8f",
    caution: "#d9a900",
    danger: "#9f2f2f",
  },
  fonts: {
    ui: "var(--lifeos-retro-font, Chicago, Geneva, Monaco, 'Courier New', monospace)",
    mono: "var(--lifeos-retro-mono, Monaco, 'Courier New', monospace)",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.5rem",
  },
  borders: {
    hairline: "1px solid #111111",
    chunky: "2px solid #111111",
    double: "3px double #111111",
  },
  radius: {
    none: "0",
    slight: "2px",
  },
  shadows: {
    window: "6px 6px 0 #000000",
    button: "2px 2px 0 #000000",
    inset: "inset 2px 2px 0 #8a8a82, inset -2px -2px 0 #ffffff",
  },
} as const;

export type RetroTokens = typeof retroTokens;
