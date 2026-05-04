import { theme as antTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { BrandTokens, BrandShorthand, BrandThemeBundle, BrandColors } from './types';
import { normalizeTokens, normalizeLogo } from './normalize';
import { validateBrandTokens } from './validate';
import { neutralLightTheme } from '../themes/neutral.light';
import { neutralDarkTheme } from '../themes/neutral.dark';
import { deepMerge } from '../utils/deepMerge';

function colorsToToken(colors: BrandColors): Record<string, unknown> {
  const token: Record<string, unknown> = {};
  if (colors.colorPrimary) token.colorPrimary = colors.colorPrimary;
  if (colors.colorLink) token.colorLink = colors.colorLink;
  if (colors.colorLinkHover) token.colorLinkHover = colors.colorLinkHover;
  if (colors.colorSuccess) token.colorSuccess = colors.colorSuccess;
  if (colors.colorWarning) token.colorWarning = colors.colorWarning;
  if (colors.colorError) token.colorError = colors.colorError;
  if (colors.colorInfo) token.colorInfo = colors.colorInfo;
  if (colors.colorBgLayout) token.colorBgLayout = colors.colorBgLayout;
  if (colors.colorTextBase) token.colorTextBase = colors.colorTextBase;
  return token;
}

/**
 * Crée un bundle de thème à partir de tokens de marque.
 * Accepte `BrandTokens` (forme normale) ou `BrandShorthand` (forme courte).
 *
 * Le bundle résultant est prêt à être passé à `<ThemeProvider brand={...} />`.
 */
export function createBrandTheme(input: BrandTokens | BrandShorthand): BrandThemeBundle {
  const tokens = normalizeTokens(input);
  validateBrandTokens(tokens);

  const logo = normalizeLogo(tokens.logo, tokens.name);
  const darkColors = tokens.dark ?? tokens.light;

  const lightToken = {
    ...colorsToToken(tokens.light),
    ...(tokens.typography?.fontFamily ? { fontFamily: tokens.typography.fontFamily } : {}),
    ...(tokens.typography?.fontSize ? { fontSize: tokens.typography.fontSize } : {}),
    ...(tokens.typography?.fontSizeHeading1 ? { fontSizeHeading1: tokens.typography.fontSizeHeading1 } : {}),
    ...(tokens.borderRadius !== undefined ? { borderRadius: tokens.borderRadius } : {}),
  };

  const darkToken = {
    ...colorsToToken(darkColors),
    ...(tokens.typography?.fontFamily ? { fontFamily: tokens.typography.fontFamily } : {}),
    ...(tokens.typography?.fontSize ? { fontSize: tokens.typography.fontSize } : {}),
    ...(tokens.typography?.fontSizeHeading1 ? { fontSizeHeading1: tokens.typography.fontSizeHeading1 } : {}),
    ...(tokens.borderRadius !== undefined ? { borderRadius: tokens.borderRadius } : {}),
  };

  const lightTheme = deepMerge(
    neutralLightTheme as Record<string, unknown>,
    { token: lightToken } as Record<string, unknown>,
  ) as ThemeConfig;

  const darkTheme = deepMerge(
    neutralDarkTheme as Record<string, unknown>,
    {
      algorithm: antTheme.darkAlgorithm,
      token: darkToken,
    } as Record<string, unknown>,
  ) as ThemeConfig;

  return {
    __brand: true,
    name: tokens.name,
    light: lightTheme,
    dark: darkTheme,
    logo,
  };
}
