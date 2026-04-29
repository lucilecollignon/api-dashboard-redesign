import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ReactNode } from 'react';
import { ThemeContext } from './context';
import type { ThemeName, ThemeMode } from './context';
import { useThemeMode } from './hooks/useThemeMode';
import { geo2franceLightTheme } from './themes/geo2france.light';
import { geo2franceDarkTheme } from './themes/geo2france.dark';
import { neutralLightTheme } from './themes/neutral.light';
import { neutralDarkTheme } from './themes/neutral.dark';
import { deepMerge } from './utils/deepMerge';

const PRESETS: Record<ThemeName, Record<'light' | 'dark', ThemeConfig>> = {
  geo2france: {
    light: geo2franceLightTheme,
    dark: geo2franceDarkTheme,
  },
  neutral: {
    light: neutralLightTheme,
    dark: neutralDarkTheme,
  },
};

function isThemeConfig(value: unknown): value is ThemeConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('token' in value || 'components' in value || 'algorithm' in value)
  );
}

export interface ThemeProviderProps {
  /**
   * Preset de thème (`'geo2france'` ou `'neutral'`), ou un `ThemeConfig` brut
   * pour la rétrocompatibilité (déprécié — affiche un warning console).
   *
   * @default 'geo2france'
   */
  theme?: ThemeName | ThemeConfig;

  /**
   * Mode d'affichage.
   * - `'auto'` : suit la préférence OS (`prefers-color-scheme`)
   * - `'light'` / `'dark'` : forcé
   *
   * @default 'auto'
   */
  mode?: ThemeMode;

  children: ReactNode;
}

/**
 * Fournisseur de thème principal.
 * Wrape `ConfigProvider` d'Ant Design avec :
 * - sélection du preset (geo2france / neutral)
 * - résolution du mode (auto / light / dark)
 * - couche de rétrocompatibilité pour les anciens `ThemeConfig` directs
 * - exposition du contexte `ThemeContext` aux composants enfants
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = 'geo2france',
  mode: modeProp = 'auto',
  children,
}) => {
  const { mode, resolvedMode, setMode } = useThemeMode();

  // Si un mode explicite est passé en prop, on l'utilise comme valeur initiale
  // mais l'état interne (localStorage) prime pour les changements utilisateur.
  const effectiveResolvedMode = modeProp !== 'auto' && mode === 'auto' ? modeProp : resolvedMode;
  const effectiveMode = modeProp !== 'auto' && mode === 'auto' ? modeProp : mode;

  let resolvedThemeName: ThemeName = 'geo2france';
  let antdTheme: ThemeConfig;

  if (typeof theme === 'string' && (theme === 'geo2france' || theme === 'neutral')) {
    resolvedThemeName = theme;
    const modeKey: 'light' | 'dark' = effectiveResolvedMode === 'dark' ? 'dark' : 'light';
    antdTheme = PRESETS[resolvedThemeName][modeKey];
  } else if (isThemeConfig(theme)) {
    console.warn(
      '[api-dashboard] Passer un ThemeConfig directement à <ThemeProvider theme={...}> est déprécié. ' +
        'Utilisez theme="geo2france" ou theme="neutral" à la place. ' +
        'Votre configuration est mergée avec le thème geo2france par défaut.',
    );
    const modeKey: 'light' | 'dark' = effectiveResolvedMode === 'dark' ? 'dark' : 'light';
    antdTheme = deepMerge(
      PRESETS.geo2france[modeKey] as Record<string, unknown>,
      theme as Record<string, unknown>,
    ) as ThemeConfig;
  } else {
    const modeKey: 'light' | 'dark' = effectiveResolvedMode === 'dark' ? 'dark' : 'light';
    antdTheme = PRESETS.geo2france[modeKey];
  }

  return (
    <ThemeContext.Provider
      value={{
        themeName: resolvedThemeName,
        mode: effectiveMode,
        resolvedMode: effectiveResolvedMode === 'dark' ? 'dark' : 'light',
        setMode,
      }}
    >
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
