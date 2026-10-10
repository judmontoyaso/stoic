// Server & Client helper para Lemon Squeezy (Merchant of Record internacional).
// Genera las URLs de checkout parametrizadas con user_id y email para que el
// webhook /api/webhooks/lemonsqueezy acredite la matrícula anual automáticamente.

export interface LemonCheckoutOptions {
  userId?: string | null
  email?: string | null
  discountCode?: string | null
}

/**
 * Devuelve la URL de checkout de Lemon Squeezy con los parámetros requeridos.
 */
export function getLemonSqueezyCheckoutUrl(opts: LemonCheckoutOptions = {}): string | null {
  const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL || process.env.LEMONSQUEEZY_CHECKOUT_URL
  if (!base) return null

  try {
    const url = new URL(base)
    if (opts.userId) {
      url.searchParams.set('checkout[custom][user_id]', opts.userId)
    }
    if (opts.email) {
      url.searchParams.set('checkout[email]', opts.email)
    }
    if (opts.discountCode) {
      url.searchParams.set('checkout[discount_code]', opts.discountCode)
    }
    return url.toString()
  } catch (err) {
    console.error('Error parseando LEMONSQUEEZY_CHECKOUT_URL:', err)
    // Fallback concatenando si no es una URL absoluta estándar
    const sep = base.includes('?') ? '&' : '?'
    const parts: string[] = []
    if (opts.userId) parts.push(`checkout[custom][user_id]=${encodeURIComponent(opts.userId)}`)
    if (opts.email) parts.push(`checkout[email]=${encodeURIComponent(opts.email)}`)
    if (opts.discountCode) parts.push(`checkout[discount_code]=${encodeURIComponent(opts.discountCode)}`)
    return parts.length ? `${base}${sep}${parts.join('&')}` : base
  }
}
