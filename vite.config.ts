import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});



// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// import dotenv from "dotenv";

// // Load .env from root
// dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// export default defineConfig({
//   plugins: [
//     react(),
//     runtimeErrorOverlay(),
//     ...(process.env.NODE_ENV !== "production" &&
//     process.env.REPL_ID !== undefined
//       ? [
//           await import("@replit/vite-plugin-cartographer").then((m) =>
//             m.cartographer()
//           ),
//         ]
//       : []),
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "client", "src"), 
//       "@shared": path.resolve(__dirname, "/shared"),
//       "@assets": path.resolve(__dirname, "/attached_assets"),
//     },
//   },
//   root: path.resolve(__dirname, "client"),
//   build: {
//     outDir: path.resolve(__dirname, "/dist"),
//     emptyOutDir: true,
//   },
//   server: {
//     port: 3000,
//     fs: {
//       strict: true,
//       deny: ["**/.*"],
//     },
//   },
// });
