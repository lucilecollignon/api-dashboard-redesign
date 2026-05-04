import { useThemeContext } from '../context';
import type { BrandLogo } from '../brand/types';

/**
 * Retourne le logo adapté au mode actuel.
 * En mode dark, utilise `srcDark` si disponible, sinon fallback sur `src`.
 */
export function useBrandLogo(): BrandLogo | undefined {
  const { logo, resolvedMode } = useThemeContext();
  if (!logo) return undefined;

  if (resolvedMode === 'dark' && logo.srcDark) {
    return { ...logo, src: logo.srcDark };
  }
  return logo;
}
