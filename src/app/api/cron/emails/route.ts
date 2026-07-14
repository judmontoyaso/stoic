import { NextResponse } from 'next/server'
import { GET as dailyEmail } from '../daily-email/route'
import { GET as eveningEmail } from '../evening-email/route'
import { GET as retentionEmail } from '../retention/route'

// Cron combinado: matutino + nocturno + retención (resumen semanal y
// rescate de inactivos) en una sola pasada. Cada endpoint decide por
// usuario si le toca (hora local + last_*_sent), así que este puede
// dispararse cada hora sin duplicar.
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

  const unauthorized = dailyRes.status === 401 || eveningRes.status === 401
  return NextResponse.json(
    { ok: !unauthorized, daily, evening, retention },
    { status: unauthorized ? 401 : 200 }
  )
}
