import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "src");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiUrl =
    env.VITE_API_URL || env.REACT_APP_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.js$/,
      exclude: [],
    },
    resolve: {
      alias: {
        assets: path.join(srcDir, "assets"),
        components: path.join(srcDir, "components"),
        context: path.join(srcDir, "context"),
        utils: path.join(srcDir, "utils"),
        views: path.join(srcDir, "views"),
      },
    },
    define: {
      "process.env.REACT_APP_API_URL": JSON.stringify(apiUrl),
    },
    build: {
      outDir: "build",
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { ".js": "jsx" },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "legacy",
          silenceDeprecations: ["import", "color-functions", "slash-div"],
        },
      },
    },
    server: {
      port: Number.parseInt(env.PORT || "7000", 10),
    },
  };
});
