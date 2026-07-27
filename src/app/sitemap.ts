import type { MetadataRoute } from 'next'

// Solo páginas públicas (las listadas en el allowlist del proxy).
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || 'https://stoicom.app'
  return [
    { url: `${base}/landing`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/suscripcion`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/reembolsos`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
