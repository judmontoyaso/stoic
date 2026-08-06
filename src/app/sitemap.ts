import type { MetadataRoute } from 'next'

// Solo páginas públicas E indexables. /suscripcion queda fuera a
// propósito: es la página de estado del embudo (confirmación/baja de
// correo) y lleva noindex — un sitemap no debe listar URLs noindex.
//
// La raíz es la entrada principal: el proxy sirve ahí la landing con
// rewrite y la canónica de /landing apunta a `/`. Por eso /landing NO va
// en el sitemap: listar las dos URLs del mismo contenido es pedirle a
// Google que elija, y ya elegimos nosotros.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL || 'https://stoicom.app').replace(/\/$/, '')
  const hoy = new Date()
  return [
    { url: `${base}/`, lastModified: hoy, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/becas`, lastModified: hoy, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/reembolsos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
