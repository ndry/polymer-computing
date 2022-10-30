import { Plugin } from "vite";
import { OutputAsset } from "rollup";
import { JSDOM } from "jsdom";
import svgToMiniDataURI from 'mini-svg-data-uri';


/**
 * Vite inlines assets, vite-plugin-singlefile inlines scripts and styles
 * None of them inlines svgs in links
 * So, this plugin inlines svgs in links
 */
export function viteInlineLinkSvg() {
    return ({
        name: "vite:inline-link-svg",
        enforce: "post",
        generateBundle: (_, bundle) => {
            const htmlFiles = Object.keys(bundle).filter((i) => i.endsWith(".html"));
            const svgAssets = Object.keys(bundle).filter((i) => i.endsWith(".svg"));
            const bundlesToDelete = [] as string[];
            for (const name of htmlFiles) {
                const htmlChunk = bundle[name] as OutputAsset;
                const dom = new JSDOM(htmlChunk.source);
                for (const svgName of svgAssets) {
                    const svgChunk = bundle[svgName] as OutputAsset;
                    const links = dom.window.document.querySelectorAll<HTMLLinkElement>(
                        `link[href="${svgChunk.fileName}"]`
                        + `, link[href="./${svgChunk.fileName}"]`);
                    for (const link of links) {
                        bundlesToDelete.push(svgName);
                        link.href = svgToMiniDataURI(svgChunk.source.toString());
                    }
                }
                htmlChunk.source = dom.serialize();
            }
            for (const name of bundlesToDelete) {
                delete bundle[name];
            }
        },
    }) as Plugin;
}
