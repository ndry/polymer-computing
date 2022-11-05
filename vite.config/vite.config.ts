import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import BuildInfo from 'vite-plugin-info';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteInlineLinkSvg } from "./vite-plugin-inlineLinkSvg";

export default defineConfig({
    build: {
        // minify: false,
    },
    plugins: [
        react({
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        BuildInfo(),
        VitePWA({
            injectRegister: 'inline',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            },
            manifest: {
                short_name: "polymer-computing",
                name: "polymer-computing",
                start_url: "./?utm_source=web_app_manifest",
                theme_color: "#f4f1ff",
                background_color: "#f4f1ff",
                display: "standalone",
                icons: [
                    {
                        src: './android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: './android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: './android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: './android-chrome-512x512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                ],
            }
        }),
        viteInlineLinkSvg(),
        viteSingleFile(),
    ],
    server: {
        port: 3686,
    },
    base: "./",
});