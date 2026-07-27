import { NextResponse } from 'next/server'
import { GET as dailyEmail } from '../daily-email/route'
import { GET as eveningEmail } from '../evening-email/route'
import { GET as retentionEmail } from '../retention/route'
import { GET as dripEmail } from '../drip/route'
import { withDeadline } from '@/lib/cron-budget'

// Cron combinado: matutino + nocturno + retención (resumen semanal y
// rescate de inactivos) + secuencia de captación en una sola pasada.
// Cada endpoint decide por usuario si le toca (hora local +
// last_*_sent), así que este puede dispararse cada hora sin duplicar.
//
// Vercel Hobby solo permite 2 crons diarios: ambos apuntan aquí como
// respaldo. Para horarios por usuario precisos, n8n lo llama cada hora
// (n8n/stoicom-emails.workflow.json).
//
// GET/POST /api/cron/emails?secret=...  (misma autorización que los otros)

export const maxDuration = 300

/** Margen sobre los 300s de Vercel para poder responder el JSON. */
const BATCH_BUDGET_MS = 285_000

/**
 * Reparto del presupuesto entre etapas. El matutino es el caro (llama a
 * IA), pero no puede quedarse con todo: sin reserva, con la base grande
 * agotaría el lote y el nocturno nunca correría. Lo que una etapa no
 * gasta se redistribuye entre las siguientes.
 */
const STAGE_WEIGHTS = { daily: 45, evening: 25, retention: 15, drip: 15 }

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  const batchDeadline = Date.now() + BATCH_BUDGET_MS
  let pendingWeight = STAGE_WEIGHTS.daily + STAGE_WEIGHTS.evening + STAGE_WEIGHTS.retention + STAGE_WEIGHTS.drip

  /** Porción del tiempo que queda, proporcional al peso de la etapa. */
  const sliceFor = (weight: number): number => {
    const share = (batchDeadline - Date.now()) * (weight / pendingWeight)
    pendingWeight -= weight
    return Date.now() + share
  }

  const dailyRes = await dailyEmail(withDeadline(request, sliceFor(STAGE_WEIGHTS.daily)))
  const daily = await dailyRes.json()

  const eveningRes = await eveningEmail(withDeadline(request, sliceFor(STAGE_WEIGHTS.evening)))
  const evening = await eveningRes.json()

  const retentionRes = await retentionEmail(withDeadline(request, sliceFor(STAGE_WEIGHTS.retention)))
  const retention = await retentionRes.json()

  // La captación va al final: si algo falla aquí, los correos del
  // programa (los que ya se ganaron) ya salieron.
  const dripRes = await dripEmail(withDeadline(request, sliceFor(STAGE_WEIGHTS.drip)))
  const drip = await dripRes.json()

  const unauthorized = dailyRes.status === 401 || eveningRes.status === 401
  return NextResponse.json(
    { ok: !unauthorized, daily, evening, retention, drip },
    { status: unauthorized ? 401 : 200 }
  )
}
