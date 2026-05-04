# Changelog

## [Unreleased] — Visual Identity Theming API

### Added

- **`createVisualIdentity()`** — factory pour créer une identité visuelle personnalisée à partir de tokens simples
- **`VisualIdentityTokens`** / **`VisualIdentityShorthand`** — contrats stables pour définir une identité visuelle client
- **Prop `visualIdentity`** sur `<ThemeProvider>` et `<DashboardApp>` — accepte 3 formes :
  - `VisualIdentityThemeBundle` (pré-construit via `createVisualIdentity()`)
  - `VisualIdentityTokens` (auto-wrappé)
  - `VisualIdentityShorthand` (`{ name, primary, logo }` — démarrage rapide)
- **`useVisualIdentityLogo()`** — hook retournant le logo adapté au mode (light/dark)
- **Intégration automatique du logo** dans `DashboardSider` via `useVisualIdentityLogo()` (avec fallback sur la prop `logo` existante)
- Types exportés : `VisualIdentityColors`, `VisualIdentityTypography`, `VisualIdentityLogo`, `VisualIdentityTokens`, `VisualIdentityShorthand`, `VisualIdentityThemeBundle`

### Deprecated

- **`theme={ThemeConfig}`** (objet Ant Design brut) — continue de fonctionner avec un warning enrichi pointant vers `createVisualIdentity()`. Sera retiré en v4.

### Migration (3 niveaux)

```tsx
// AVANT (toujours supporté en v3, warning console)
<DashboardApp theme={{ token: { colorPrimary: '#FF6B35' } }} logo="/logo.svg" />

// APRÈS — Niveau 1 : forme courte (recommandé pour démarrer)
<DashboardApp visualIdentity={{ name: 'odema', primary: '#FF6B35', logo: '/logo.svg' }} />

// APRÈS — Niveau 2 : light personnalisé, dark dérivé auto
const myVisualIdentity = createVisualIdentity({
  name: 'odema',
  light: { colorPrimary: '#FF6B35', colorLink: '#0046AD' },
  logo: { src: '/logo.svg', alt: 'Odema' },
});
<DashboardApp visualIdentity={myVisualIdentity} />

// APRÈS — Niveau 3 : light + dark explicites
const myVisualIdentity = createVisualIdentity({
  name: 'odema',
  light: { colorPrimary: '#FF6B35' },
  dark:  { colorPrimary: '#FF8A5C' },
  logo: { src: '/logo.svg', alt: 'Odema', srcDark: '/logo-white.svg' },
});
<DashboardApp visualIdentity={myVisualIdentity} mode="auto" />
```
