// Precio de la Matrícula Anual (1 Año de Acceso Completo): UNA sola fuente de verdad.
//
// Centraliza el valor oficial del programa integral:
//   · Mercado Pago (COP): MERCADOPAGO_FOUNDER_PRICE en Vercel ($199.000 COP / año)
//   · Lemon Squeezy (USD): Precio configurado en el panel ($59 USD / año)
// Cubre 1 año completo (12 meses) de acceso sin renovaciones automáticas ni cobros sorpresa.
// Los números y formatos se mantienen 100% alineados entre pasarelas y frontend.

export const PROGRAM_PRICE = {
  cop: 199000,
  usd: 59,
} as const

/** Alias retrocompatible para integraciones internas */
export const FOUNDER_PRICE = PROGRAM_PRICE

/** "$199.000" — formato colombiano, con punto de miles. */
export const copLabel = `$${PROGRAM_PRICE.cop.toLocaleString('es-CO')}`
/** "$59" — precio internacional en USD */
export const usdLabel = `$${PROGRAM_PRICE.usd}`

