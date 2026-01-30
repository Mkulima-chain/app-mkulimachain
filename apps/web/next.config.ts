import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  // Configuration SEO et rendu statique
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  // Optimisations pour le SEO
  compress: true,
  poweredByHeader: false,
  // Permet le rendu statique pour améliorer l'indexation
  trailingSlash: false,
  // Configuration webpack pour résoudre les problèmes de webcrypto et ws
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Polyfill webcrypto pour le côté serveur
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
      // Résoudre @peculiar/webcrypto correctement
      config.resolve.alias = {
        ...config.resolve.alias,
        "@peculiar/webcrypto": require.resolve("@peculiar/webcrypto"),
      };
    } else {
      // Côté client : exclure les packages Node.js qui ne peuvent pas être utilisés
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
      };
      // Alias pour ws côté client - utiliser un module vide
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      config.resolve.alias = {
        ...config.resolve.alias,
        ws: path.resolve(__dirname, "./lib/ws-shim.ts"),
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
