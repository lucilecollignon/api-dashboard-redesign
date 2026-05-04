import type { VisualIdentityTokens } from './types';

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_REGEX = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}/;

function isValidColor(value: string): boolean {
  return HEX_REGEX.test(value) || RGB_REGEX.test(value);
}

export function validateVisualIdentityTokens(tokens: VisualIdentityTokens): void {
  if (process.env.NODE_ENV === 'production') return;

  if (!tokens.light.colorPrimary) {
    console.warn(
      `[api-dashboard/visual-identity] "${tokens.name}": light.colorPrimary est requis.`,
    );
    return;
  }

  if (!isValidColor(tokens.light.colorPrimary)) {
    console.warn(
      `[api-dashboard/visual-identity] "${tokens.name}": light.colorPrimary "${tokens.light.colorPrimary}" n'est pas un format de couleur valide (hex ou rgb attendu).`,
    );
  }

  if (tokens.dark?.colorPrimary && !isValidColor(tokens.dark.colorPrimary)) {
    console.warn(
      `[api-dashboard/visual-identity] "${tokens.name}": dark.colorPrimary "${tokens.dark.colorPrimary}" n'est pas un format de couleur valide.`,
    );
  }

  if (tokens.logo && typeof tokens.logo === 'object' && !tokens.logo.src) {
    console.warn(
      `[api-dashboard/visual-identity] "${tokens.name}": logo.src est requis quand logo est un objet.`,
    );
  }
}
