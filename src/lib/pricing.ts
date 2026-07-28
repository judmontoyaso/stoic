// Precio del acceso fundador: UNA sola fuente de verdad.
//
// Estaba escrito a mano en la landing, en el JSON-LD y en los docs, y ya
// habían divergido entre sí (199.900 en la landing contra 199.000 en la
// variable de entorno). Anunciar un precio y cobrar otro es un problema
// legal, no un detalle.
//
// OJO — lo que de verdad cobra cada pasarela vive fuera de este archivo:
//   · Mercado Pago: MERCADOPAGO_FOUNDER_PRICE en Vercel (sin separadores)
//   · Lemon Squeezy: el precio del producto en su panel
// Si cambias aquí, cambia allá. Los números deben coincidir.

export const FOUNDER_PRICE = {
  cop: 199000,
  usd: 59,
} as const

/** "$199.900" — formato colombiano, con punto de miles. */
export const copLabel = `$${FOUNDER_PRICE.cop.toLocaleString('es-CO')}`
/** "$60" */
export const usdLabel = `$${FOUNDER_PRICE.usd}`
