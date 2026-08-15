// ===========================================================================
// PM2 — MkulimaChain
//
//   pm2 startOrReload ecosystem.config.js --update-env
//   pm2 save
//
// Les ports restent privés (localhost) : Nginx fait le reverse-proxy.
//   mkulima-api    5600  ->  api.mkulimachain.com
//   mkulima-web    5601  ->  mkulimachain.com
//   mkulima-admin  5602  ->  app.mkulimachain.com
// ===========================================================================

const API_URL = "https://api.mkulimachain.com/api";
const WEB_URL = "https://mkulimachain.com";
const ADMIN_URL = "https://app.mkulimachain.com";

module.exports = {
  apps: [
    // =======================================================================
    // API (NestJS)
    // Lit apps/api/.env.local via @nestjs/config (voir DatabaseModule :
    // envFilePath: '.env.local'). Toutes les variables serveur — DB_*, JWT_*,
    // SMTP_*, CLOUDINARY_*, IPFS_* — vivent dans ce fichier, PAS ici.
    // =======================================================================
    {
      name: "mkulima-api",
      cwd: "./apps/api",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork", // socket.io + état en mémoire : pas de cluster.
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5600,
        FRONTEND_URL: `${WEB_URL},${ADMIN_URL}`,
        WEB_URL,
        ADMIN_URL,
      },
      error_file: "../../logs/api-error.log",
      out_file: "../../logs/api-out.log",
      time: true,
    },

    // =======================================================================
    // Web public (Next.js)
    // NEXT_PUBLIC_* est figé au moment du BUILD : le définir ici ne suffit pas,
    // il doit aussi être exporté dans scripts/deploy.sh et dans la CI.
    // =======================================================================
    {
      name: "mkulima-web",
      cwd: "./apps/web",
      script: "pnpm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5601,
        NEXT_PUBLIC_API_URL: API_URL,
        NEXT_PUBLIC_SITE_URL: WEB_URL,
        WEB_URL,
      },
      error_file: "../../logs/web-error.log",
      out_file: "../../logs/web-out.log",
      time: true,
    },

    // =======================================================================
    // Admin / back-office (Next.js)
    // =======================================================================
    {
      name: "mkulima-admin",
      cwd: "./apps/admin",
      script: "pnpm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5602,
        NEXT_PUBLIC_API_URL: API_URL,
        NEXT_PUBLIC_SITE_URL: ADMIN_URL,
      },
      error_file: "../../logs/admin-error.log",
      out_file: "../../logs/admin-out.log",
      time: true,
    },
  ],
};
