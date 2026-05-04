import { useMemo } from 'react';
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
import { createBrandTheme } from './brand/createBrandTheme';
import { isBundle } from './brand/normalize';
import type { BrandThemeBundle, BrandTokens, BrandShorthand, BrandLogo } from './brand/types';

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
   * Branding personnalisé. Trois formes acceptées :
   * - `BrandThemeBundle` (généré par `createBrandTheme()`) — recommandé en prod
   * - `BrandTokens` (objet brut avec `light`) — auto-wrappé par le provider
   * - `BrandShorthand` (`{ name, primary }`) — démarrage rapide
   *
   * Mutuellement exclusif avec `theme` (priorité à `brand` si les deux sont fournis).
   */
  brand?: BrandThemeBundle | BrandTokens | BrandShorthand;

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
 * - support du branding personnalisé via `brand`
 * - couche de rétrocompatibilité pour les anciens `ThemeConfig` directs
 * - exposition du contexte `ThemeContext` aux composants enfants
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = 'geo2france',
  brand,
  mode: modeProp = 'auto',
  children,
}) => {
  const { mode, resolvedMode, setMode } = useThemeMode();

  const effectiveResolvedMode = modeProp !== 'auto' && mode === 'auto' ? modeProp : resolvedMode;
  const effectiveMode = modeProp !== 'auto' && mode === 'auto' ? modeProp : mode;

  const modeKey: 'light' | 'dark' = effectiveResolvedMode === 'dark' ? 'dark' : 'light';

  // Mémoïse le bundle brand pour éviter les re-créations inutiles
  const brandBundle = useMemo<BrandThemeBundle | undefined>(() => {
    if (!brand) return undefined;
    if (isBundle(brand)) return brand;
    return createBrandTheme(brand as BrandTokens | BrandShorthand);
  }, [brand]);

  let resolvedThemeName: ThemeName = 'geo2france';
  let antdTheme: ThemeConfig;
  let logo: BrandLogo | undefined;

  if (brand && brandBundle) {
    // Brand a priorité sur theme
    if (theme && isThemeConfig(theme)) {
      console.error(
        '[api-dashboard] Les props `brand` et `theme` (ThemeConfig) sont mutuellement exclusives. ' +
          '`brand` est utilisé en priorité. Retirez la prop `theme`.',
      );
    }
    resolvedThemeName = 'neutral';
    antdTheme = brandBundle[modeKey];
    logo = brandBundle.logo;
  } else if (typeof theme === 'string' && (theme === 'geo2france' || theme === 'neutral')) {
    resolvedThemeName = theme;
    antdTheme = PRESETS[resolvedThemeName][modeKey];
  } else if (isThemeConfig(theme)) {
    console.warn(
      '[api-dashboard] Passer un ThemeConfig directement à <ThemeProvider theme={...}> est déprécié et sera retiré en v4. ' +
        'Migration : utilisez `brand={{ name: "myBrand", primary: "#xxx" }}` pour le cas simple, ' +
        'ou `createBrandTheme({ name, light: {...} })` pour un contrôle complet. ' +
        'En attendant, votre configuration est mergée avec le thème geo2france.',
    );
    antdTheme = deepMerge(
      PRESETS.geo2france[modeKey] as Record<string, unknown>,
      theme as Record<string, unknown>,
    ) as ThemeConfig;
  } else {
    antdTheme = PRESETS.geo2france[modeKey];
  }

  return (
    <ThemeContext.Provider
      value={{
        themeName: resolvedThemeName,
        mode: effectiveMode,
        resolvedMode: effectiveResolvedMode === 'dark' ? 'dark' : 'light',
        setMode,
        logo,
      }}
    >
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
