import { NextResponse } from 'next/server'
import { GET as dailyEmail } from '../daily-email/route'
import { GET as eveningEmail } from '../evening-email/route'
import { GET as retentionEmail } from '../retention/route'
import { GET as dripEmail } from '../drip/route'

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

export async function POST(request: Request) {
  return GET(request)
}

export async function GET(request: Request) {
  const dailyRes = await dailyEmail(request)
  const daily = await dailyRes.json()

  const eveningRes = await eveningEmail(request)
  const evening = await eveningRes.json()

  const retentionRes = await retentionEmail(request)
  const retention = await retentionRes.json()

  // La captación va al final: si algo falla aquí, los correos del
  // programa (los que ya se ganaron) ya salieron.
  const dripRes = await dripEmail(request)
  const drip = await dripRes.json()

  const unauthorized = dailyRes.status === 401 || eveningRes.status === 401
  return NextResponse.json(
    { ok: !unauthorized, daily, evening, retention, drip },
    { status: unauthorized ? 401 : 200 }
  )
}
