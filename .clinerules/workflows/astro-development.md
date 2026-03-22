# Astro Project Workflow

A structured workflow for developing Astro projects from initialization to deployment.

## Phase 1: Project Setup

### Initialize Project
1. Create new Astro project or identify existing:
   - Check for `astro.config.mjs`
   - Verify `src/pages/` directory
   - Confirm `astro` in dependencies

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add integrations as needed:
   ```bash
   npx astro add react
   npx astro add tailwind
   npx astro add mdx
   ```

### Project Structure
- Define component organization
- Set up content collections if using MDX
- Configure layouts hierarchy
- Establish styling approach

## Phase 2: Component Development

### Create Components

1. **Layouts** (`src/layouts/`)
   - Base layout with head/metadata
   - View Transitions setup
   - Header/Footer components

2. **Pages** (`src/pages/`)
   - File-based routing setup
   - Index and common pages
   - Dynamic routes with getStaticPaths

3. **UI Components** (`src/components/`)
   - Reusable Astro components
   - Interactive islands (React/Vue)
   - Image components using astro:assets

### Content Management

1. **Content Collections** (if applicable):
   - Define schema in `src/content/config.ts`
   - Create collection directories
   - Set up frontmatter validation

2. **Markdown/MDX**:
   - Use for blog posts, docs
   - Configure syntax highlighting
   - Set up remark/rehype plugins

## Phase 3: Styling & Design

### CSS Setup
- Global styles in `src/styles/`
- Scoped component styles
- Tailwind configuration (if using)

### Design System
- Typography scale
- Color palette
- Spacing system
- Component variants

## Phase 4: Development

### Running Development
```bash
npm run dev
```

### Common Tasks
- Add new pages
- Create components
- Implement content
- Test responsiveness

### Testing
- Browser testing with Playwright
- Lighthouse performance check
- Accessibility audit

## Phase 5: Build & Deploy

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Deployment
- Vercel: `npx astro add vercel`
- Netlify: `npx astro add netlify`
- Node adapter: `npx astro add node`
- Or deploy `dist/` folder

## Astro Best Practices Checklist

- [ ] Use Astro components for static content
- [ ] Add `client:*` directive only for interactive components
- [ ] Use View Transitions for SPA-like navigation
- [ ] Optimize images with `<Image />` component
- [ ] Enable prefetch for faster navigation
- [ ] Use content collections for type-safe content
- [ ] Implement proper SEO metadata
- [ ] Ensure accessibility compliance
- [ ] Minimize JavaScript with islands architecture
- [ ] Test Core Web Vitals

## Environment Variables

Create `.env` for:
```
PUBLIC_API_URL=https://api.example.com
```

Access in code:
```typescript
const apiUrl = import.meta.env.PUBLIC_API_URL;