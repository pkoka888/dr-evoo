---
name: astro-development
description: Build high-performance Astro websites with optimal architecture. Use this skill when working with Astro projects, including static sites, blogs, documentation, and hybrid applications.
license: MIT
metadata:
  category: development
  source:
    repository: https://github.com/kilocode/kilo-code
    path: .kilocode/skills/astro-development
---

This skill guides development of production-ready Astro projects with focus on performance, maintainability, and best practices.

## When to Use

Use this skill when:
- Working with Astro projects (detected by astro.config.mjs)
- Building static sites, blogs, or documentation
- Creating hybrid SSR/SSG applications
- Adding React/Svelte/Vue components to Astro

## Project Structure

A well-organized Astro project:

```
project/
├── astro.config.mjs      # Astro configuration
├── src/
│   ├── components/       # Astro + UI components
│   ├── layouts/          # Page layouts
│   ├── pages/            # File-based routing
│   ├── content/          # Content collections
│   ├── styles/           # Global styles
│   └── lib/              # Utilities
├── public/               # Static assets
└── package.json
```

## Architecture Decisions

### Rendering Strategy

Choose the right rendering mode:

1. **Static (SSG)** - Best for:
   - Content sites, blogs, docs
   - Fastest performance
   - No server needed

2. **Server (SSR)** - Best for:
   - Dynamic routes
   - User-specific content
   - API endpoints
   - Form handling

3. **Hybrid** - Best for:
   - Mixed content types
   - Blog with comments
   - E-commerce product pages

### Component Strategy

- **Astro components** (.astro): Static content, layouts, header/footer
- **Framework components** (React/Vue/Svelte): Interactive UI only
- **Islands**: Use `client:*` directives only where needed

### Data Strategy

- **Content Collections**: Type-safe Markdown/MDX management
- **getStaticPaths**: Build-time data for dynamic routes
- **API Routes**: Server endpoints for form handling

## Performance Guidelines

### Core Web Vitals

1. **LCP (Largest Contentful Paint)**:
   - Preload hero images
   - Inline critical CSS
   - Use `<Image />` component

2. **CLS (Cumulative Layout Shift)**:
   - Set dimensions on images
   - Reserve space for dynamic content
   - Font-display: swap

3. **INP (Interaction to Next Paint)**:
   - Minimize JavaScript
   - Use Astro islands sparingly
   - Defer non-critical scripts

### Optimization Techniques

- Image optimization with `astro:assets`
- Prefetching with `data-astro-prefetch`
- Partytown for third-party scripts
- View Transitions API

## Common Patterns

### Layout with View Transitions

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Content Collection Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
```

### Hybrid Rendering

```astro
---
export const prerender = false; // SSR
const response = await fetch('https://api.example.com/data');
const data = await response.json();
---
<p>{data.message}</p>
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 4321) |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npx astro add` | Add integrations |

## Context7 Usage

Search Context7 for:
- Astro component API reference
- Integration setup guides
- View Transitions API
- Content Collections documentation