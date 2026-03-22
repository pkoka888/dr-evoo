import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    // Prefetch configuration for viewport prefetching
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport',
    },
    // Image optimization
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                limitInputPixels: false,
            },
        },
    },
    // Build optimizations
    build: {
        inlineStylesheets: 'auto',
    },
    // Compression
    compressHTML: true,
    // Vite configuration for optimizations
    vite: {
        plugins: [tailwindcss()],
        build: {
            cssMinify: true,
            minify: 'esbuild',
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vendor-react': ['react', 'react-dom'],
                        'vendor-motion': ['framer-motion'],
                    },
                },
            },
        },
    },
    integrations: [react()],
});
