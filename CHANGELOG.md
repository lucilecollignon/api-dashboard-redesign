# Changelog

## [Unreleased] — Brand Theming API

### Added

- **`createBrandTheme()`** — factory pour créer un thème de marque personnalisé à partir de tokens simples
- **`BrandTokens`** / **`BrandShorthand`** — contrats stables pour définir un branding client
- **Prop `brand`** sur `<ThemeProvider>` et `<DashboardApp>` — accepte 3 formes :
  - `BrandThemeBundle` (pré-construit via `createBrandTheme()`)
  - `BrandTokens` (auto-wrappé)
  - `BrandShorthand` (`{ name, primary, logo }` — démarrage rapide)
- **`useBrandLogo()`** — hook retournant le logo adapté au mode (light/dark)
- **Intégration automatique du logo** dans `DashboardSider` via `useBrandLogo()` (avec fallback sur la prop `logo` existante)
- Types exportés : `BrandColors`, `BrandTypography`, `BrandLogo`, `BrandTokens`, `BrandShorthand`, `BrandThemeBundle`

### Deprecated

- **`theme={ThemeConfig}`** (objet Ant Design brut) — continue de fonctionner avec un warning enrichi pointant vers `createBrandTheme()`. Sera retiré en v4.

### Migration (3 niveaux)

```tsx
// AVANT (toujours supporté en v3, warning console)
<DashboardApp theme={{ token: { colorPrimary: '#FF6B35' } }} logo="/logo.svg" />

// APRÈS — Niveau 1 : forme courte (recommandé pour démarrer)
<DashboardApp brand={{ name: 'odema', primary: '#FF6B35', logo: '/logo.svg' }} />

// APRÈS — Niveau 2 : light personnalisé, dark dérivé auto
const myBrand = createBrandTheme({
  name: 'odema',
  light: { colorPrimary: '#FF6B35', colorLink: '#0046AD' },
  logo: { src: '/logo.svg', alt: 'Odema' },
});
<DashboardApp brand={myBrand} />

// APRÈS — Niveau 3 : light + dark explicites
const myBrand = createBrandTheme({
  name: 'odema',
  light: { colorPrimary: '#FF6B35' },
  dark:  { colorPrimary: '#FF8A5C' },
  logo: { src: '/logo.svg', alt: 'Odema', srcDark: '/logo-white.svg' },
});
<DashboardApp brand={myBrand} mode="auto" />
```
