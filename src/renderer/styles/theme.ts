export const theme = {
  colors: {
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      panel: '#0f0f0f',
    },
    text: {
      primary: '#00ff00',
      secondary: '#00cc00',
      inactive: '#006600',
    },
    accent: {
      hover: 'rgba(0, 255, 0, 0.3)',
      border: 'rgba(0, 255, 0, 0.5)',
      error: '#ff0066',
    },
  },
  typography: {
    fontFamily: "'Courier New', 'Consolas', monospace",
    fontSize: {
      base: '14px',
      header: '18px',
      small: '12px',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  border: {
    width: '1px',
    radius: '2px',
  },
  transition: {
    duration: '150ms',
    timing: 'ease-in-out',
  },
  zIndex: {
    base: 0,
    panel: 10,
    overlay: 100,
    modal: 1000,
  },
} as const