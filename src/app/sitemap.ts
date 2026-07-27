import type { MetadataRoute } from 'next'

// Solo páginas públicas E indexables. /suscripcion queda fuera a
// propósito: es la página de estado del embudo (confirmación/baja de
// correo) y lleva noindex — un sitemap no debe listar URLs noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || 'https://stoicom.app'
  return [
    { url: `${base}/landing`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/becas`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/reembolsos`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
