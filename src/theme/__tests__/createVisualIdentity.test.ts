import { createVisualIdentity } from '../visual-identity/createVisualIdentity';
import type { VisualIdentityTokens, VisualIdentityShorthand } from '../visual-identity/types';

describe('createVisualIdentity', () => {
  describe('forme courte (VisualIdentityShorthand)', () => {
    test('accepte { name, primary } et retourne un VisualIdentityThemeBundle', () => {
      const input: VisualIdentityShorthand = { name: 'test', primary: '#FF6B35' };
      const result = createVisualIdentity(input);

      expect(result.__visualIdentity).toBe(true);
      expect(result.name).toBe('test');
      expect(result.light).toBeDefined();
      expect(result.dark).toBeDefined();
      expect(result.light.token?.colorPrimary).toBe('#FF6B35');
    });

    test('dark hérite de light quand absent', () => {
      const input: VisualIdentityShorthand = { name: 'test', primary: '#FF6B35' };
      const result = createVisualIdentity(input);

      expect(result.dark.token?.colorPrimary).toBe('#FF6B35');
    });

    test('logo string est normalisé en objet VisualIdentityLogo', () => {
      const input: VisualIdentityShorthand = { name: 'acme', primary: '#000', logo: '/logo.svg' };
      const result = createVisualIdentity(input);

      expect(result.logo).toEqual({ src: '/logo.svg', alt: 'acme' });
    });
  });

  describe("forme normale (VisualIdentityTokens) -- light seul", () => {
    test('crée un bundle avec dark dérivé de light', () => {
      const input: VisualIdentityTokens = {
        name: 'identity-light-only',
        light: { colorPrimary: '#0046AD', colorLink: '#1890ff' },
      };
      const result = createVisualIdentity(input);

      expect(result.__visualIdentity).toBe(true);
      expect(result.light.token?.colorPrimary).toBe('#0046AD');
      expect(result.light.token?.colorLink).toBe('#1890ff');
      expect(result.dark.token?.colorPrimary).toBe('#0046AD');
      expect(result.dark.token?.colorLink).toBe('#1890ff');
    });

    test('typography et borderRadius sont propagés', () => {
      const input: VisualIdentityTokens = {
        name: 'typo-test',
        light: { colorPrimary: '#333' },
        typography: { fontFamily: 'Roboto, sans-serif', fontSize: 16 },
        borderRadius: 8,
      };
      const result = createVisualIdentity(input);

      expect(result.light.token?.fontFamily).toBe('Roboto, sans-serif');
      expect(result.light.token?.fontSize).toBe(16);
      expect(result.light.token?.borderRadius).toBe(8);
      expect(result.dark.token?.fontFamily).toBe('Roboto, sans-serif');
    });
  });

  describe('forme complète (VisualIdentityTokens) -- light + dark', () => {
    test('dark override est respecté', () => {
      const input: VisualIdentityTokens = {
        name: 'full',
        light: { colorPrimary: '#FF6B35' },
        dark: { colorPrimary: '#FF8A5C' },
      };
      const result = createVisualIdentity(input);

      expect(result.light.token?.colorPrimary).toBe('#FF6B35');
      expect(result.dark.token?.colorPrimary).toBe('#FF8A5C');
    });
  });

  describe('logo normalization', () => {
    test('logo objet est conservé tel quel', () => {
      const input: VisualIdentityTokens = {
        name: 'logo-test',
        light: { colorPrimary: '#000' },
        logo: { src: '/logo.svg', alt: 'My Visual Identity', srcDark: '/logo-dark.svg', width: 120 },
      };
      const result = createVisualIdentity(input);

      expect(result.logo).toEqual({
        src: '/logo.svg',
        alt: 'My Visual Identity',
        srcDark: '/logo-dark.svg',
        width: 120,
      });
    });

    test('pas de logo -> logo undefined dans le bundle', () => {
      const input: VisualIdentityTokens = { name: 'no-logo', light: { colorPrimary: '#000' } };
      const result = createVisualIdentity(input);
      expect(result.logo).toBeUndefined();
    });
  });

  describe('validation (dev warnings)', () => {
    test('colorPrimary manquant déclenche un warning', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const input: VisualIdentityTokens = {
        name: 'no-primary',
        light: { colorPrimary: '' },
      };
      createVisualIdentity(input);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('colorPrimary est requis'));
      warn.mockRestore();
    });

    test('format couleur invalide déclenche un warning', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const input: VisualIdentityTokens = {
        name: 'bad-color',
        light: { colorPrimary: 'not-a-color' },
      };
      createVisualIdentity(input);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('format de couleur valide'));
      warn.mockRestore();
    });
  });

  describe('structure du bundle', () => {
    test('contient toujours __visualIdentity: true', () => {
      const result = createVisualIdentity({ name: 'x', primary: '#fff' });
      expect(result.__visualIdentity).toBe(true);
    });

    test('light et dark contiennent algorithm (hérité de neutral)', () => {
      const result = createVisualIdentity({ name: 'x', primary: '#fff' });
      expect(result.light.algorithm).toBeDefined();
      expect(result.dark.algorithm).toBeDefined();
    });
  });
});
