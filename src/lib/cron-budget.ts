// Presupuesto de tiempo compartido por los crons de correo.
//
// En producción el scheduler llama a /api/cron/emails, que ejecuta los
// cuatro crons en la MISMA invocación: los 300s de Vercel se reparten
// entre todos. Sin un límite, el matutino podría consumirlos y dejar al
// nocturno sin ejecutar — o peor, morir a mitad del bucle de usuarios.
//
// El límite viaja por cabecera para que los sub-crons sepan cuánto queda
// del presupuesto común. Llamados directamente, cada uno usa el suyo.

const HEADER = 'x-cron-deadline'

/** Copia la petición añadiendo el instante límite (epoch ms) del lote. */
export function withDeadline(request: Request, deadline: number): Request {
  const headers = new Headers(request.headers)
  headers.set(HEADER, String(deadline))
  return new Request(request.url, { method: 'GET', headers })
}

/** Instante límite del lote, o uno propio si el cron corre suelto. */
export function deadlineFrom(request: Request, ownBudgetMs: number): number {
  const raw = request.headers.get(HEADER)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : Date.now() + ownBudgetMs
}

/**
 * ¿Queda tiempo para procesar un usuario más?
 *
 * `reserveMs` es lo que cuesta la iteración más lenta: se corta ANTES de
 * empezarla, no en mitad. Los usuarios no alcanzados no quedan marcados
 * como enviados, así que la siguiente pasada del cron los recoge.
 */
export function outOfTime(deadline: number, reserveMs: number): boolean {
  return Date.now() > deadline - reserveMs
}
