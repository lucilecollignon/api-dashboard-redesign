import { createContext, useContext } from 'react';
import type { BrandLogo } from './brand/types';

export type ThemeName = 'neutral' | 'geo2france';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeContextValue {
  /** Preset de thème actif */
  themeName: ThemeName;
  /** Mode demandé (peut être 'auto') */
  mode: ThemeMode;
  /** Mode résolu (jamais 'auto' — 'light' ou 'dark' effectif) */
  resolvedMode: 'light' | 'dark';
  /** Changer le mode (persiste en localStorage) */
  setMode: (mode: ThemeMode) => void;
  /** Logo de la marque (fourni via `brand`) */
  logo?: BrandLogo;
}

export const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'geo2france',
  mode: 'light',
  resolvedMode: 'light',
  setMode: () => undefined,
});

export const useThemeContext = () => useContext(ThemeContext);
