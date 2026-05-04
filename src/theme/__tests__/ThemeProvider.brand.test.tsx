import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../ThemeProvider';
import { useThemeContext } from '../context';
import { createBrandTheme } from '../brand/createBrandTheme';
import type { BrandShorthand, BrandTokens } from '../brand/types';

const makeMockMatchMedia = (prefersDark = false) =>
  jest.fn().mockImplementation((query: string) => ({
    matches: prefersDark ? query === '(prefers-color-scheme: dark)' : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: makeMockMatchMedia(false),
  });
});

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = makeMockMatchMedia(false);
});

const ThemeConsumer = () => {
  const ctx = useThemeContext();
  return (
    <div>
      <span data-testid="themeName">{ctx.themeName}</span>
      <span data-testid="resolvedMode">{ctx.resolvedMode}</span>
      <span data-testid="logoSrc">{ctx.logo?.src ?? 'none'}</span>
      <span data-testid="logoAlt">{ctx.logo?.alt ?? 'none'}</span>
    </div>
  );
};

describe('ThemeProvider — prop brand', () => {
  test('brand shorthand rend le composant sans crash', () => {
    const brand: BrandShorthand = { name: 'test', primary: '#FF0000' };
    render(
      <ThemeProvider brand={brand}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('neutral');
  });

  test('brand tokens (light seul) fonctionne', () => {
    const brand: BrandTokens = {
      name: 'myBrand',
      light: { colorPrimary: '#00FF00' },
      logo: { src: '/logo.svg', alt: 'My Brand' },
    };
    render(
      <ThemeProvider brand={brand}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('logoSrc')).toHaveTextContent('/logo.svg');
    expect(screen.getByTestId('logoAlt')).toHaveTextContent('My Brand');
  });

  test('brand bundle (pré-créé) est utilisé directement', () => {
    const bundle = createBrandTheme({
      name: 'pre-built',
      light: { colorPrimary: '#0000FF' },
      logo: { src: '/pre.svg', alt: 'Pre' },
    });
    render(
      <ThemeProvider brand={bundle}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('logoSrc')).toHaveTextContent('/pre.svg');
    expect(screen.getByTestId('themeName')).toHaveTextContent('neutral');
  });

  test('brand + theme (ThemeConfig brut) → console.error + brand utilisé', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const brand: BrandShorthand = { name: 'priority', primary: '#111' };
    const legacyTheme = { token: { colorPrimary: '#222' } };

    render(
      <ThemeProvider brand={brand} theme={legacyTheme}>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(error).toHaveBeenCalledWith(expect.stringContaining('mutuellement exclusives'));
    expect(screen.getByTestId('themeName')).toHaveTextContent('neutral');
    error.mockRestore();
  });

  test('mode dark avec brand affiche resolvedMode dark', () => {
    window.matchMedia = makeMockMatchMedia(true);
    const brand: BrandShorthand = { name: 'dark-test', primary: '#333' };
    render(
      <ThemeProvider brand={brand} mode="auto">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('dark');
  });

  test('sans brand ni theme → fallback geo2france', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('geo2france');
  });
});
