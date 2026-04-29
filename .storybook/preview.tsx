import React, { useEffect } from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';
import { ConfigProvider } from 'antd';
import { customTheme } from './manager';
import {
  geo2franceLightTheme,
  geo2franceDarkTheme,
  neutralLightTheme,
  neutralDarkTheme,
} from '../src/theme';
import type { ThemeName } from '../src/theme';

type ThemeMode = 'light' | 'dark';
type ThemeKey = `${ThemeName}-${ThemeMode}`;

const THEMES: Record<ThemeKey, object> = {
  'geo2france-light': geo2franceLightTheme,
  'geo2france-dark':  geo2franceDarkTheme,
  'neutral-light':    neutralLightTheme,
  'neutral-dark':     neutralDarkTheme,
};

const BG: Record<ThemeMode, string> = {
  light: '#ffffff',
  dark:  '#141414',
};

/**
 * Decorator global : enveloppe chaque story dans un ConfigProvider Ant Design
 * correspondant au couple (theme × mode) sélectionné dans la toolbar Storybook.
 *
 * Note : les stories qui contiennent leur propre <DashboardApp> (qui expose son
 * propre <ThemeProvider>) ignoreront ce decorator pour la partie layout — c'est
 * le comportement attendu (ConfigProvider nested with inherit:true).
 */
const withTheme: Decorator = (Story, context) => {
  const themeName = (context.globals.themeName as ThemeName) ?? 'geo2france';
  const themeMode = (context.globals.themeMode as ThemeMode) ?? 'light';
  const key: ThemeKey = `${themeName}-${themeMode}`;
  const antdTheme = THEMES[key] ?? THEMES['geo2france-light'];
  const bg = BG[themeMode];

  useEffect(() => {
    document.body.style.backgroundColor = bg;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [bg]);

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <ConfigProvider theme={antdTheme}>
        <Story />
      </ConfigProvider>
    </div>
  );
};

const preview: Preview = {
  tags: ['autodocs'],

  globalTypes: {
    themeName: {
      name: 'Thème',
      defaultValue: 'geo2france',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'geo2france', title: 'Géo2France' },
          { value: 'neutral',    title: 'Neutral'    },
        ],
        dynamicTitle: true,
      },
    },
    themeMode: {
      name: 'Mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', right: '☀️' },
          { value: 'dark',  title: 'Dark',  right: '🌙' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [withTheme],

  parameters: {
    codePanel: true,
    docs: {
      theme: customTheme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Documentation', ['Introduction'],
          'Layout', ['DashboardApp'],
          'Dataset',
          'Dataviz',
          'Controle',
        ],
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
