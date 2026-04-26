import { defineConfig } from 'vite';

export default defineConfig({
    base: './',  // Use relative paths so it works when opened from any folder (itch.io)
    build: {
        outDir: 'dist',
        assetsInlineLimit: 0,  // Don't inline any assets as base64
    }
});
