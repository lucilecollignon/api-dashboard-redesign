import type { ThemeConfig } from 'antd';

export interface BrandColors {
  colorPrimary: string;
  colorLink?: string;
  colorLinkHover?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  colorInfo?: string;
  colorBgLayout?: string;
  colorTextBase?: string;
}

export interface BrandTypography {
  fontFamily?: string;
  fontSize?: number;
  fontSizeHeading1?: number;
}

export interface BrandLogo {
  src: string;
  alt: string;
  srcDark?: string;
  width?: number;
  height?: number;
}

/**
 * Structure plate de tokens de marque.
 * `dark` est optionnel : si absent, `light` est réutilisé avec `darkAlgorithm`.
 */
export interface BrandTokens {
  name: string;
  light: BrandColors;
  dark?: BrandColors;
  typography?: BrandTypography;
  borderRadius?: number;
  logo?: BrandLogo | string;
}

/**
 * Forme courte pour le cas dominant :
 * « je veux juste changer la couleur primaire et poser mon logo ».
 */
export interface BrandShorthand {
  name: string;
  primary: string;
  logo?: BrandLogo | string;
}

/**
 * Bundle généré par `createBrandTheme()`.
 * Le marqueur `__brand` permet au ThemeProvider de distinguer un bundle prêt à l'emploi.
 */
export interface BrandThemeBundle {
  __brand: true;
  name: string;
  light: ThemeConfig;
  dark: ThemeConfig;
  logo?: BrandLogo;
}
