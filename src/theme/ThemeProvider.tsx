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
import { createVisualIdentity } from './visual-identity/createVisualIdentity';
import { isBundle } from './visual-identity/normalize';
import type {
  VisualIdentityThemeBundle,
  VisualIdentityTokens,
  VisualIdentityShorthand,
  VisualIdentityLogo,
} from './visual-identity/types';

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
   * Identité visuelle personnalisée. Trois formes acceptées :
   * - `VisualIdentityThemeBundle` (généré par `createVisualIdentity()`) — recommandé en prod
   * - `VisualIdentityTokens` (objet brut avec `light`) — auto-wrappé par le provider
   * - `VisualIdentityShorthand` (`{ name, primary }`) — démarrage rapide
   *
   * Mutuellement exclusif avec `theme` (priorité à `visualIdentity` si les deux sont fournis).
   */
  visualIdentity?: VisualIdentityThemeBundle | VisualIdentityTokens | VisualIdentityShorthand;

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
 * - support de l'identité visuelle personnalisée via `visualIdentity`
 * - couche de rétrocompatibilité pour les anciens `ThemeConfig` directs
 * - exposition du contexte `ThemeContext` aux composants enfants
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = 'geo2france',
  visualIdentity,
  mode: modeProp = 'auto',
  children,
}) => {
  const { mode, resolvedMode, setMode } = useThemeMode();

  // Quand l'intégrateur force un mode (≠ 'auto'), celui-ci est autoritaire :
  // il ignore le choix localStorage et le switcher est masqué (voir Sider).
  const isModeLocked = modeProp !== 'auto';
  const effectiveMode = isModeLocked ? modeProp : mode;
  const effectiveResolvedMode = isModeLocked ? modeProp : resolvedMode;

  const modeKey: 'light' | 'dark' = effectiveResolvedMode === 'dark' ? 'dark' : 'light';

  // Mémoïse le bundle visualIdentity pour éviter les re-créations inutiles
  const visualIdentityBundle = useMemo<VisualIdentityThemeBundle | undefined>(() => {
    if (!visualIdentity) return undefined;
    if (isBundle(visualIdentity)) return visualIdentity;
    return createVisualIdentity(visualIdentity as VisualIdentityTokens | VisualIdentityShorthand);
  }, [visualIdentity]);

  let resolvedThemeName: ThemeName = 'geo2france';
  let antdTheme: ThemeConfig;
  let logo: VisualIdentityLogo | undefined;

  if (visualIdentity && visualIdentityBundle) {
    // visualIdentity a priorité sur theme
    if (theme && isThemeConfig(theme)) {
      console.error(
        '[api-dashboard] Les props `visualIdentity` et `theme` (ThemeConfig) sont mutuellement exclusives. ' +
          '`visualIdentity` est utilisé en priorité. Retirez la prop `theme`.',
      );
    }
    resolvedThemeName = 'neutral';
    antdTheme = visualIdentityBundle[modeKey];
    logo = visualIdentityBundle.logo;
  } else if (typeof theme === 'string' && (theme === 'geo2france' || theme === 'neutral')) {
    resolvedThemeName = theme;
    antdTheme = PRESETS[resolvedThemeName][modeKey];
  } else if (isThemeConfig(theme)) {
    console.warn(
      '[api-dashboard] Passer un ThemeConfig directement à <ThemeProvider theme={...}> est déprécié et sera retiré en v4. ' +
        'Migration : utilisez `visualIdentity={{ name: "myVisualIdentity", primary: "#xxx" }}` pour le cas simple, ' +
        'ou `createVisualIdentity({ name, light: {...} })` pour un contrôle complet. ' +
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
        isModeLocked,
        setMode,
        logo,
      }}
    >
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
