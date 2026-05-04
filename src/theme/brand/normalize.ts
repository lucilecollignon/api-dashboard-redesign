import type { BrandTokens, BrandShorthand, BrandThemeBundle, BrandLogo } from './types';

export function isShorthand(input: unknown): input is BrandShorthand {
  return (
    typeof input === 'object' &&
    input !== null &&
    'primary' in input &&
    !('light' in input) &&
    !('__brand' in input)
  );
}

export function isBundle(input: unknown): input is BrandThemeBundle {
  return (
    typeof input === 'object' &&
    input !== null &&
    '__brand' in input &&
    (input as BrandThemeBundle).__brand === true
  );
}

export function normalizeLogo(
  logo: BrandLogo | string | undefined,
  brandName: string,
): BrandLogo | undefined {
  if (!logo) return undefined;
  if (typeof logo === 'string') {
    return { src: logo, alt: brandName };
  }
  return logo;
}

export function normalizeTokens(input: BrandTokens | BrandShorthand): BrandTokens {
  if (isShorthand(input)) {
    return {
      name: input.name,
      light: { colorPrimary: input.primary },
      logo: input.logo,
    };
  }
  return input;
}
