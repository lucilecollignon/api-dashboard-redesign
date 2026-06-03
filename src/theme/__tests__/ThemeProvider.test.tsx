import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../ThemeProvider';
import { useThemeContext } from '../context';
import { geo2franceLightTheme } from '../themes/geo2france.light';

// ── Mock window.matchMedia (jsdom ne le fournit pas) ──────────────────────────

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
    value: makeMockMatchMedia(false), // OS = light par défaut
  });
});

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = makeMockMatchMedia(false);
});

// ── Helper : lit le ThemeContext depuis un enfant ─────────────────────────────

const ThemeConsumer = () => {
  const ctx = useThemeContext();
  return (
    <div>
      <span data-testid="themeName">{ctx.themeName}</span>
      <span data-testid="mode">{ctx.mode}</span>
      <span data-testid="resolvedMode">{ctx.resolvedMode}</span>
      <span data-testid="isModeLocked">{String(ctx.isModeLocked)}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5.1.1 — Résolution du thème par nom
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — résolution du thème par nom', () => {
  test('theme="geo2france" → themeName = geo2france', () => {
    render(
      <ThemeProvider theme="geo2france">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('geo2france');
  });

  test('theme="neutral" → themeName = neutral', () => {
    render(
      <ThemeProvider theme="neutral">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('neutral');
  });

  test('sans prop theme → par défaut geo2france', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('geo2france');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.1.2 — Résolution du mode
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — résolution du mode', () => {
  test('mode="light" → resolvedMode = light', () => {
    render(
      <ThemeProvider mode="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('light');
  });

  test('mode="dark" → resolvedMode = dark', () => {
    render(
      <ThemeProvider mode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('dark');
  });

  test('mode="auto" + OS light (matchMedia.matches = false) → resolvedMode = light', () => {
    window.matchMedia = makeMockMatchMedia(false);
    render(
      <ThemeProvider mode="auto">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('light');
  });

  test('mode="auto" + OS dark (matchMedia.matches = true) → resolvedMode = dark', () => {
    window.matchMedia = makeMockMatchMedia(true);
    render(
      <ThemeProvider mode="auto">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('dark');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.1.2bis — Mode verrouillé (themeMode forcé → switcher masqué)
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — mode verrouillé (isModeLocked)', () => {
  test('mode="light" → isModeLocked = true', () => {
    render(
      <ThemeProvider mode="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('isModeLocked')).toHaveTextContent('true');
  });

  test('mode="dark" → isModeLocked = true', () => {
    render(
      <ThemeProvider mode="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('isModeLocked')).toHaveTextContent('true');
  });

  test('mode="auto" → isModeLocked = false', () => {
    render(
      <ThemeProvider mode="auto">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('isModeLocked')).toHaveTextContent('false');
  });

  test('sans prop mode → isModeLocked = false (défaut auto)', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('isModeLocked')).toHaveTextContent('false');
  });

  test('mode forcé autoritaire : localStorage="dark" + mode="light" → resolvedMode = light', () => {
    localStorage.setItem('dashboard-theme-mode', 'dark');
    render(
      <ThemeProvider mode="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('light');
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  test('mode="auto" : le choix localStorage="dark" est respecté', () => {
    localStorage.setItem('dashboard-theme-mode', 'dark');
    render(
      <ThemeProvider mode="auto">
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('resolvedMode')).toHaveTextContent('dark');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.1.3 — Couche de rétrocompatibilité (ThemeConfig direct)
// ─────────────────────────────────────────────────────────────────────────────

describe('ThemeProvider — couche de rétrocompatibilité (ThemeConfig direct)', () => {
  test('passer un ThemeConfig déclenche un console.warn avec "[api-dashboard]"', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const legacyTheme = { token: { colorPrimary: '#ff0000' } };

    render(
      <ThemeProvider theme={legacyTheme}>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[api-dashboard]'));
    warn.mockRestore();
  });

  test('ThemeConfig direct : le composant se rend sans crash', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const legacyTheme = { token: { colorPrimary: '#ff0000' } };

    render(
      <ThemeProvider theme={legacyTheme}>
        <span data-testid="child">ok</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    warn.mockRestore();
  });

  test('ThemeConfig avec algorithm est reconnu comme ThemeConfig', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const legacyTheme = { ...geo2franceLightTheme };

    render(
      <ThemeProvider theme={legacyTheme}>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[api-dashboard]'));
    warn.mockRestore();
  });

  test('valeur invalide (null / undefined) → fallback sur geo2france sans crash', () => {
    render(
      // @ts-expect-error test volontaire d'une valeur invalide
      <ThemeProvider theme={null}>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('themeName')).toHaveTextContent('geo2france');
  });
});
