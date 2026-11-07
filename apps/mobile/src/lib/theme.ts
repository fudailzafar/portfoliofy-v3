import { useColorScheme } from 'react-native';

// The website's colours, so the app and the site read as one product.
const light = {
  background: '#ffffff',
  text: '#111111',
  textSecondary: '#666666',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  buttonBackground: '#ffffff',
  danger: '#b91c1c',
};

const dark: typeof light = {
  background: '#222222',
  text: '#eeeeee',
  textSecondary: '#aaaaaa',
  textMuted: '#9ca3af',
  border: '#333333',
  buttonBackground: '#333333',
  danger: '#f87171',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
