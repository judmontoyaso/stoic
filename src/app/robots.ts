import type { MetadataRoute } from 'next'

// Rastreo: solo las páginas públicas importan para SEO. La app tras
// login no debe indexarse (y el proxy la redirige de todos modos).
export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL || 'https://stoicom.app'
  return {
    rules: {
      userAgent: '*',
      allow: ['/landing', '/login', '/terms', '/privacy', '/reembolsos', '/suscripcion'],
      disallow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
