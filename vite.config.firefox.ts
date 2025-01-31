import { resolve } from "path";
import { mergeConfig, defineConfig } from "vite";
import { crx, ManifestV3Export } from "@crxjs/vite-plugin";
import baseConfig, { baseManifest, baseBuildOptions } from "./vite.config.base";

type FirefoxManifestV3Export = ManifestV3Export & {
  browser_specific_settings?: {
    gecko: {
      id: string;
      strict_min_version: string;
    };
  };
};

const outDir = resolve(__dirname, "dist_firefox");

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({
        manifest: {
          ...baseManifest,
          background: {
            scripts: ["src/pages/background/index.ts"],
          },
          browser_specific_settings: {
            gecko: {
              id: "sleep4fajr@amindevs.com",
              strict_min_version: "91.0",
            },
          },
        } as FirefoxManifestV3Export,
        browser: "firefox",
        contentScripts: {
          injectCss: true,
        },
      }),
    ],
    build: {
      ...baseBuildOptions,
      outDir,
    },
    publicDir: resolve(__dirname, "public"),
  }),
);
