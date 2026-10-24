// Configuration du service — tout vient de l'environnement (jamais en dur).
export const config = {
  port: Number(process.env.PORT ?? 8788),
  dbPath: process.env.DB_PATH ?? new URL('../data/dx5.sqlite', import.meta.url).pathname,
  hbx: {
    base: (process.env.HBX_API_BASE ?? 'https://dashboard.hbexium.com/api/v1').replace(/\/$/, ''),
    key: process.env.HBX_API_KEY ?? '',
    webhookSecret: process.env.HBX_WEBHOOK_SECRET ?? '',
  },
  // racine des fichiers front (le dépôt), servis tels quels
  frontRoot: new URL('../../', import.meta.url).pathname,
};
