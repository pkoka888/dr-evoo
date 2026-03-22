# Astro Project Development Guide

This rule provides guidance for working with Astro projects. Use this when working with Astro-based websites, blogs, documentation sites, or web applications.

## Project Detection

Astro projects are identified by:
- `astro.config.mjs` or `astro.config.ts` in project root
- `src/pages/` directory with `.astro` files
- `package.json` with `astro` dependency

## Astro Architecture

### Core Concepts
- **Static Site Generation (SSG)**: Default, fastest for content sites
- **Server-Side Rendering (SSR)**: Dynamic content, API routes
- **Hybrid**: Mix of static and dynamic pages
- **Islands Architecture**: Partial hydration for interactive components

### Key Directories
```
src/
├── components/     # Astro components (.astro) and UI components
├── layouts/       # Page layouts
├── pages/         # File-based routing (.astro, .ts, .jsx)
├── content/       # Content collections (Markdown, MDX, frontmatter)
├── styles/        # Global CSS
└── lib/           # Utility functions and helpers
```

## Development Rules

### Component Development

1. **Astro Components** (.astro files):
   - Use for static content and layout
   - Support for slots and named slots
   - Frontmatter (---) for TypeScript logic
   - Can import React/Vue/Svelte components

2. **React Components** in Astro:
   - Use `client:*` directives for hydration:
     - `client:load` - Hydrate immediately
     - `client:visible` - Hydrate when visible
     - `client:idle` - Hydrate when idle
     - `client:media` - Hydrate on media query match
   - Prefer static Astro components when possible for performance

3. **Content Collections**:
   - Define schemas in `src/content/config.ts`
   - Use `getCollection()` for type-safe data access
   - Support for Markdown, MDX, JSON, YAML

### Styling

1. **CSS Integration**:
   - Astro supports scoped styles by default
   - Global styles via `<style is:global>`
   - Support for CSS modules, Tailwind, PostCSS

2. **Tailwind CSS**:
   - Install with `npx astro add tailwind`
   - Use `@tailwindcss/vite` plugin for Vite-based projects

### Performance

1. **Image Optimization**:
   - Use `<Image />` component from `astro:assets`
   - Use `<Picture />` for responsive images

2. **Prefetching**:
   - Enable with `prefetch` config in astro.config
   - Use `data-astro-prefetch` attribute on links

### Build & Deployment

1. **Commands**:
   - `npm run dev` - Development server (port 4321)
   - `npm run build` - Production build
   - `npm run preview` - Preview production build

2. **Adapter Configuration**:
   - Vercel: `npx astro add vercel`
   - Netlify: `npx astro add netlify`
   - Node: `npx astro add node`

## Best Practices

1. **Routing**: Use file-based routing in `src/pages/`
2. **Components**: Keep components small and focused
3. **Data Fetching**: Use getStaticPaths for dynamic routes at build time
4. **SEO**: Use meta tags and Open Graph in layouts
5. **Accessibility**: Ensure semantic HTML and ARIA support

## Context7 Integration

When working with Astro, use Context7 to search:
- Astro documentation for latest APIs
- Integration guides (React, Tailwind, etc.)
- Best practices and patterns

Always prefer Astro-native solutions over client-side JavaScript when possible.