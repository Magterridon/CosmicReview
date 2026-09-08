import { defineConfig } from "astro/config";

// Site 100% statique, pas de CMS ni de backend — cf. stack-technique.md.
// Pensé pour un déploiement Vercel ou Netlify (adapter ajoutable plus tard
// si besoin de SSR, non nécessaire pour la Phase 1).
export default defineConfig({
  site: "https://cosmicreview.fr",
});
