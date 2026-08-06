import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import { readAccess, canExport } from '@/lib/access'

// Descarga del diario completo.
//
// Existe para que el borrado tras la vigencia no sea una amenaza: quien
// no renueva se lleva lo que escribió. Es lo que convierte la cláusula en
// algo que se puede anunciar sin vergüenza, y de paso cubre el derecho de
// portabilidad de la Ley 1581.
//
// GET /api/export/journal            → Markdown, legible e imprimible
// GET /api/export/journal?format=json → JSON, para portabilidad real
//
// Abierta en el proxy porque el vencido ya no pasa el filtro de vigencia;
// la sesión se valida aquí dentro. Disponible mientras haya algo que
// bajar: vigentes y en gracia. Pasada la gracia ya no queda nada.

export const maxDuration = 60

interface JournalRow {
  date: string
  entry_type: string
  mood: number | null
  content: Record<string, string> | null
}

interface ReflectionRow {
  date: string
  reflection: string
  actionable_tip: string | null
}

interface DayLogRow {
  date: string
  day_number: number
  completed: boolean
  notes: string | null
}

const TIPO_TITULO: Record<string, string> = {
  morning: 'Mañana',
  evening: 'Examen nocturno',
  weekly: 'Revisión semanal',
  free: 'Entrada libre',
}

/** Etiquetas de los campos de content, por tipo de entrada. */
const CAMPO_TITULO: Record<string, string> = {
  did_well: 'Qué hice bien',
  to_improve: 'Qué puedo mejorar',
  learned: 'Qué aprendí',
  gratitude: 'Agradecimiento',
  why_wake_up: 'Por qué me levanto',
  praise_self: 'Qué me reconozco',
  sacrifice: 'Qué sacrifiqué',
  next_week: 'La semana que viene',
  text: '',
}

function toMarkdown(
  email: string,
  journal: JournalRow[],
  reflections: ReflectionRow[],
  dayLogs: DayLogRow[]
): string {
  const hoy = new Date().toISOString().slice(0, 10)
  const partes: string[] = [
    '# Mi diario de StoiCom',
    '',
    `Cuenta: ${email}`,
    `Exportado el ${hoy}`,
    `${journal.length} entradas de diario · ${dayLogs.filter(d => d.completed).length} días completados`,
    '',
    '---',
    '',
  ]

  // Una sección por fecha, con todo lo de ese día junto
  const fechas = [...new Set([
    ...journal.map(j => j.date),
    ...reflections.map(r => r.date),
    ...dayLogs.filter(d => d.notes).map(d => d.date),
  ])].sort()

  for (const fecha of fechas) {
    partes.push(`## ${fecha}`, '')

    const log = dayLogs.find(d => d.date === fecha)
    if (log) {
      partes.push(`*Día ${log.day_number} · ${log.completed ? 'completado' : 'sin completar'}*`, '')
      if (log.notes) partes.push(log.notes, '')
    }

    for (const entrada of journal.filter(j => j.date === fecha)) {
      partes.push(`### ${TIPO_TITULO[entrada.entry_type] || entrada.entry_type}`)
      if (entrada.mood) partes.push(`Ánimo: ${entrada.mood}/5`)
      partes.push('')
      const content = entrada.content || {}
      for (const [campo, valor] of Object.entries(content)) {
        if (!valor) continue
        const titulo = CAMPO_TITULO[campo]
        if (titulo) partes.push(`**${titulo}**`, '')
        partes.push(String(valor), '')
      }
    }

    const reflexion = reflections.find(r => r.date === fecha)
    if (reflexion) {
      partes.push('### Lo que te escribió StoiCom ese día', '', reflexion.reflection, '')
      if (reflexion.actionable_tip) partes.push(`*${reflexion.actionable_tip}*`, '')
    }

    partes.push('')
  }

  return partes.join('\n')
}

export async function GET(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sin sesión activa' }, { status: 401 })
  }

  const access = readAccess(user.app_metadata)
  if (!canExport(access)) {
    return NextResponse.json(
      {
        error:
          access.state === 'expired'
            ? 'Pasó el mes de gracia y el contenido ya se borró.'
            : 'Esta cuenta no tiene diario que descargar.',
      },
      { status: 403 }
    )
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: 'stoic' },
  })

  const [journalRes, reflectionsRes, dayLogsRes] = await Promise.all([
    admin.from('journal_entries').select('date, entry_type, mood, content')
      .eq('user_id', user.id).order('date'),
    admin.from('daily_reflections').select('date, reflection, actionable_tip')
      .eq('user_id', user.id).order('date'),
    admin.from('day_logs').select('date, day_number, completed, notes')
      .eq('user_id', user.id).order('date'),
  ])

  const journal = (journalRes.data || []) as JournalRow[]
  const reflections = (reflectionsRes.data || []) as ReflectionRow[]
  const dayLogs = (dayLogsRes.data || []) as DayLogRow[]

  const stamp = new Date().toISOString().slice(0, 10)

  if (new URL(request.url).searchParams.get('format') === 'json') {
    const payload = {
      cuenta: user.email,
      exportado: new Date().toISOString(),
      vence: access.expiresAt?.toISOString() ?? null,
      journal,
      reflections,
      dayLogs,
    }
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="stoicom-diario-${stamp}.json"`,
      },
    })
  }

  return new NextResponse(toMarkdown(user.email || '', journal, reflections, dayLogs), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="stoicom-diario-${stamp}.md"`,
    },
  })
}
