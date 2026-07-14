// Server-only. Plantillas de correo + envío vía Resend.
// No importar desde componentes cliente.

const BRAND = 'StoiCom'
const ACCENT = '#c9a84c' // Gold/Amber
const TEXT_LIGHT = '#1c1917'
const MUTED_LIGHT = '#57534e'
const BORDER_LIGHT = '#e7e5e4'
const BG_LIGHT = '#fafaf9'
const CARD_LIGHT = '#ffffff'

export type EmailContent = { subject: string; html: string }

// Layout HTML responsivo compatible con clientes de correo
function baseLayout(opts: { preheader?: string; heading: string; body: string }): string {
  const { preheader = '', heading, body } = opts
  const appUrl = (process.env.APP_URL || 'https://stoic-mu.vercel.app').replace(/\/$/, '')
  const logoUrl = `${appUrl}/sculpture.png`

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:${BG_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_LIGHT};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD_LIGHT};border:1px solid ${BORDER_LIGHT};border-radius:6px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="padding:20px 32px;border-bottom:1px solid ${BORDER_LIGHT};background:#111116;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;font-size:18px;font-weight:800;color:#f8fafc;letter-spacing:1px;">
                  <img src="${logoUrl}" width="30" height="30" style="vertical-align:middle;margin-right:10px;border-radius:50%;display:inline-block;" alt="Logo" />
                  <span style="vertical-align:middle;display:inline-block;">Stoi<span style="color:${ACCENT};">Com</span></span>
                </td>
                <td align="right" style="vertical-align:middle;font-size:10px;text-transform:uppercase;color:${ACCENT};font-weight:700;letter-spacing:1.5px;">
                  Memento Mori
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:32px;color:${TEXT_LIGHT};">
            <h1 style="margin:0 0 16px;font-size:18px;line-height:1.4;color:#111116;font-weight:800;border-left:3px solid ${ACCENT};padding-left:12px;">${heading}</h1>
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid ${BORDER_LIGHT};font-size:11px;color:${MUTED_LIGHT};line-height:1.6;background:#f5f5f4;">
            Enviado por ${BRAND}. Este es un correo automatizado para tu preparación diaria del entrenamiento de 90 días.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED_LIGHT};">${html}</p>`
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 8px;">
    <tr><td style="border-radius:4px;background:#111116;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:4px;border:1px solid ${ACCENT};">${label}</a>
    </td></tr>
  </table>`
}

export function dailyReflectionEmail(opts: {
  name: string
  dayNumber: number
  phase: number
  phaseLabel: string
  quote: { text: string; author: string }
  habits: { name: string; description: string }[]
  challenge: { title: string; description: string } | null
  appUrl: string
  aiReflection?: { reflection: string; actionableTip: string } | null
}): EmailContent {
  const habitsList = opts.habits
    .map(
      (h) => `
    <li style="margin-bottom:12px;font-size:13px;line-height:1.5;color:${TEXT_LIGHT};">
      <strong style="color:#ab841d;">${h.name}:</strong> ${h.description}
    </li>`
    )
    .join('')

  const challengeHtml = opts.challenge
    ? `
    <div style="margin-top:20px;padding:16px;background:#fcfaf2;border:1px dashed #d6c38a;border-radius:4px;">
      <h3 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#8e6d15;">Desafío de la Semana: ${opts.challenge.title}</h3>
      <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED_LIGHT};">${opts.challenge.description}</p>
    </div>`
    : ''

  const introHtml = opts.aiReflection
    ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${TEXT_LIGHT};font-weight:500;">${opts.aiReflection.reflection}</p>`
    : paragraph(`Estás en la <strong>Fase ${opts.phase}: ${opts.phaseLabel}</strong>. Recuerda abordar cada conversación del día con plena conciencia racional.`)

  const aiTipHtml = opts.aiReflection
    ? `
    <div style="margin:20px 0 16px;padding:16px;background:#f3f4f6;border:1px solid ${BORDER_LIGHT};border-radius:4px;">
      <h3 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#111116;text-transform:uppercase;letter-spacing:0.5px;">Consejo del Mentor Estoico</h3>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED_LIGHT};">${opts.aiReflection.actionableTip}</p>
    </div>`
    : ''

  return {
    subject: `Día ${opts.dayNumber} · Preparación Estoica y Comunicación`,
    html: baseLayout({
      preheader: `Tu preparación para hoy: "${opts.quote.text.substring(0, 50)}..."`,
      heading: `Hola ${opts.name}, este es tu entrenamiento para el Día ${opts.dayNumber}`,
      body:
        introHtml +
        `
        <!-- Cita del día -->
        <div style="margin:20px 0;padding:20px;background:#f5f5f4;border-left:4px solid ${ACCENT};border-radius:0 4px 4px 0;">
          <p style="margin:0 0 8px;font-size:15px;font-style:italic;line-height:1.6;color:${TEXT_LIGHT};">&ldquo;${opts.quote.text}&rdquo;</p>
          <p style="margin:0;font-size:12px;font-weight:700;color:#ab841d;text-align:right;">— ${opts.quote.author}</p>
        </div>
        
        <!-- Hábitos diarios -->
        <h2 style="margin:24px 0 12px;font-size:15px;font-weight:700;color:#111116;text-transform:uppercase;letter-spacing:0.5px;">Hábitos a entrenar hoy:</h2>
        <ul style="margin:0 0 20px;padding-left:20px;">
          ${habitsList}
        </ul>
        
        ${challengeHtml}
        ${aiTipHtml}
        
        ` +
        button('Registrar Progreso en la App', `${opts.appUrl}`),
    }),
  }
}

// --- V2: correo del programa de 90 días (un bloque por track activo) ---
export interface TrackEmailBlock {
  trackName: string
  dayNumber: number
  moduleLabel: string
  title: string
  instructions: string
  rationale: string | null
  sourceAuthor: string | null
  weeklyChallenge: { title: string; description: string } | null
  reading?: string | null // Lección completa del día (párrafos separados por \n\n)
}

export function dailyProgramEmail(opts: {
  name: string
  quote: { text: string; author: string }
  blocks: TrackEmailBlock[]
  appUrl: string
  aiReflection?: { reflection: string; actionableTip: string } | null
}): EmailContent {
  const blocksHtml = opts.blocks
    .map(
      (b) => `
      <div style="margin:20px 0;padding:20px;background:${CARD_LIGHT};border:1px solid ${BORDER_LIGHT};border-radius:6px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ab841d;">
              ${b.trackName} · Día ${b.dayNumber} · ${b.moduleLabel}
            </td>
            ${b.sourceAuthor ? `<td align="right" style="font-size:10px;color:${MUTED_LIGHT};">${b.sourceAuthor}</td>` : ''}
          </tr>
        </table>
        <h3 style="margin:8px 0 10px;font-size:16px;font-weight:800;color:#111116;">${b.title}</h3>
        <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};">${b.instructions}</p>
        ${b.rationale ? `
        <div style="padding:10px 14px;background:#fcfaf2;border-left:3px solid ${ACCENT};border-radius:0 4px 4px 0;">
          <p style="margin:0;font-size:12px;line-height:1.5;font-style:italic;color:${MUTED_LIGHT};"><strong style="color:#8e6d15;font-style:normal;">Por qué funciona:</strong> ${b.rationale}</p>
        </div>` : ''}
        ${b.weeklyChallenge ? `
        <div style="margin-top:12px;padding:12px 14px;background:#f0fdf4;border:1px dashed #86efac;border-radius:4px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#15803d;">Reto de la semana: ${b.weeklyChallenge.title}</p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED_LIGHT};">${b.weeklyChallenge.description}</p>
        </div>` : ''}
        ${b.reading ? `
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid ${BORDER_LIGHT};">
          <p style="margin:0 0 10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ab841d;">Lectura del día</p>
          ${b.reading.split(/\n\n+/).filter(p => p.trim()).map(p => `<p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:${TEXT_LIGHT};">${p}</p>`).join('')}
        </div>` : ''}
      </div>`
    )
    .join('')

  const aiHtml = opts.aiReflection
    ? `
    <div style="margin:20px 0;padding:16px;background:#f3f4f6;border:1px solid ${BORDER_LIGHT};border-radius:4px;">
      <h3 style="margin:0 0 8px;font-size:13px;font-weight:800;color:#111116;text-transform:uppercase;letter-spacing:0.5px;">Reflexión del Mentor</h3>
      <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:${MUTED_LIGHT};">${opts.aiReflection.reflection}</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};"><strong style="color:#8e6d15;">Consejo accionable:</strong> ${opts.aiReflection.actionableTip}</p>
    </div>`
    : ''

  const primary = opts.blocks[0]
  return {
    subject: primary
      ? `Día ${primary.dayNumber} · ${primary.title}`
      : 'Tu entrenamiento estoico de hoy',
    html: baseLayout({
      preheader: `"${opts.quote.text.substring(0, 60)}..."`,
      heading: `Hola ${opts.name}, esto es lo que toca hoy`,
      body:
        `
        <!-- Cita del día -->
        <div style="margin:0 0 8px;padding:20px;background:#f5f5f4;border-left:4px solid ${ACCENT};border-radius:0 4px 4px 0;">
          <p style="margin:0 0 8px;font-size:15px;font-style:italic;line-height:1.6;color:${TEXT_LIGHT};">&ldquo;${opts.quote.text}&rdquo;</p>
          <p style="margin:0;font-size:12px;font-weight:700;color:#ab841d;text-align:right;">— ${opts.quote.author}</p>
        </div>
        ${blocksHtml}
        ${aiHtml}
        ` +
        button('Registrar el día en la App', `${opts.appUrl}`),
    }),
  }
}

// --- V2: recordatorio nocturno (cierre del día + examen de Séneca) ---
export interface EveningTrackStatus {
  trackName: string
  dayNumber: number
  title: string
  completed: boolean
  streak: number
}

export function eveningReviewEmail(opts: {
  name: string
  statuses: EveningTrackStatus[]
  appUrl: string
}): EmailContent {
  const allDone = opts.statuses.every(s => s.completed)
  const pending = opts.statuses.filter(s => !s.completed)

  const statusHtml = opts.statuses
    .map(
      (s) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
        <tr>
          <td style="padding:12px 16px;background:${s.completed ? '#f0fdf4' : '#fef2f2'};border:1px solid ${s.completed ? '#86efac' : '#fecaca'};border-radius:6px;">
            <p style="margin:0;font-size:12px;font-weight:800;color:${s.completed ? '#15803d' : '#b91c1c'};">
              ${s.completed ? '&#10003;' : '&#9675;'} ${s.trackName} · Día ${s.dayNumber}
            </p>
            <p style="margin:4px 0 0;font-size:13px;color:${TEXT_LIGHT};">
              ${s.completed ? `Completado. Racha: ${s.streak} día${s.streak === 1 ? '' : 's'}.` : `Pendiente: <strong>${s.title}</strong>`}
            </p>
          </td>
        </tr>
      </table>`
    )
    .join('')

  const examHtml = `
    <div style="margin:20px 0;padding:16px 20px;background:#f5f5f4;border-left:4px solid ${ACCENT};border-radius:0 4px 4px 0;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ab841d;">Examen nocturno de Séneca</p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};">1. ¿Qué hice mal hoy y cómo afectó mi paz o mis relaciones?</p>
      <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};">2. ¿Qué hice bien y qué virtud apliqué?</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};">3. ¿Qué haría diferente mañana?</p>
    </div>`

  const intro = allDone
    ? paragraph('Todo lo de hoy está completado. Queda lo más importante: cerrar el día por escrito antes de dormir.')
    : paragraph(`Todavía tienes <strong>${pending.length} ejercicio${pending.length === 1 ? '' : 's'} pendiente${pending.length === 1 ? '' : 's'}</strong>. Un día perdido se marca y no se recupera: aún estás a tiempo de que hoy no sea uno de ellos.`)

  return {
    subject: allDone
      ? 'Cierra el día: examen nocturno'
      : `Aún estás a tiempo: ${pending.length} pendiente${pending.length === 1 ? '' : 's'} de hoy`,
    html: baseLayout({
      preheader: allDone ? 'Todo completado. Cierra el ciclo con el examen nocturno.' : 'El día aún no termina.',
      heading: `${opts.name}, el día se cierra por escrito`,
      body:
        intro +
        statusHtml +
        examHtml +
        button(allDone ? 'Escribir examen nocturno' : 'Completar el día ahora', `${opts.appUrl}${allDone ? '/journal' : ''}`),
    }),
  }
}

// --- Bienvenida al aprobar el código de acceso ---
export function welcomeEmail(opts: { name: string; appUrl: string }): EmailContent {
  return {
    subject: 'Bienvenido a StoiCom: así funciona tu entrenamiento',
    html: baseLayout({
      preheader: 'Tu programa de 90 días está listo para empezar.',
      heading: `${opts.name}, tu entrenamiento está listo`,
      body:
        paragraph(
          'Tu correo quedó aprobado. StoiCom es un programa de 90 días con un ejercicio concreto al día: así funciona tu rutina a partir de ahora.'
        ) +
        `
        <div style="margin:20px 0;padding:16px 20px;background:#f5f5f4;border-left:4px solid ${ACCENT};border-radius:0 4px 4px 0;">
          <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};"><strong style="color:#8e6d15;">En la mañana</strong> — te llega el ejercicio del día con su lección completa, a la hora que elijas en Preferencias.</p>
          <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};"><strong style="color:#8e6d15;">Durante el día</strong> — ejecutas el ejercicio en tu vida real y lo marcas en la app. Los días perdidos se marcan; el calendario nunca se reorganiza.</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};"><strong style="color:#8e6d15;">En la noche</strong> — el examen nocturno de Séneca: tres preguntas por escrito en tu diario.</p>
        </div>` +
        paragraph(
          'Dos cosas antes de empezar: <strong>1)</strong> fija tu fecha de inicio y la hora de tus correos, y <strong>2)</strong> activa la campana de notificaciones en el menú para recibir los recordatorios en tu teléfono.'
        ) +
        button('Configurar mi programa', `${opts.appUrl}/welcome`),
    }),
  }
}

// --- Resumen semanal del domingo ---
export interface WeeklyTrackSummary {
  trackName: string
  dayNumber: number
  completedThisWeek: number
  missedThisWeek: number
  totalCompleted: number
  streak: number
}

export function weeklySummaryEmail(opts: {
  name: string
  appUrl: string
  summaries: WeeklyTrackSummary[]
  moodAvg: number | null
  nextChallenge: { title: string; description: string } | null
}): EmailContent {
  const rows = opts.summaries
    .map(
      s => `
      <div style="margin:0 0 12px;padding:14px 16px;background:${CARD_LIGHT};border:1px solid ${BORDER_LIGHT};border-radius:6px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#ab841d;">${s.trackName} · vas en el día ${s.dayNumber}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:${TEXT_LIGHT};">
          Esta semana: <strong>${s.completedThisWeek} de ${s.completedThisWeek + s.missedThisWeek} días completados</strong>${s.missedThisWeek > 0 ? ` (${s.missedThisWeek} marcado${s.missedThisWeek === 1 ? '' : 's'} como perdido${s.missedThisWeek === 1 ? '' : 's'})` : ' — semana impecable'}.
          Racha actual: ${s.streak} día${s.streak === 1 ? '' : 's'}. Total del programa: ${s.totalCompleted}/90.
        </p>
      </div>`
    )
    .join('')

  const moodHtml =
    opts.moodAvg !== null
      ? paragraph(
          `Tu ánimo promedio de la semana fue <strong>${opts.moodAvg.toFixed(1)}/5</strong> según tu diario.`
        )
      : ''

  const challengeHtml = opts.nextChallenge
    ? `
      <div style="margin:20px 0;padding:14px 16px;background:#f0fdf4;border:1px dashed #86efac;border-radius:4px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#15803d;">La semana que viene: ${opts.nextChallenge.title}</p>
        <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED_LIGHT};">${opts.nextChallenge.description}</p>
      </div>`
    : ''

  return {
    subject: 'Tu semana estoica en números',
    html: baseLayout({
      preheader: 'Balance de la semana y lo que viene.',
      heading: `${opts.name}, así cerró tu semana`,
      body:
        paragraph(
          'El domingo es para el balance, no para el juicio: los números de abajo son información, no un veredicto.'
        ) +
        rows +
        moodHtml +
        challengeHtml +
        button('Ver mi progreso', `${opts.appUrl}/evaluation`),
    }),
  }
}

// --- Rescate tras días de inactividad ---
export function rescueEmail(opts: {
  name: string
  appUrl: string
  daysInactive: number
  tracks: { trackName: string; dayNumber: number; title: string }[]
}): EmailContent {
  const list = opts.tracks
    .map(
      t =>
        `<li style="margin-bottom:8px;font-size:13px;line-height:1.5;color:${TEXT_LIGHT};"><strong style="color:#ab841d;">${t.trackName}</strong> — hoy es tu día ${t.dayNumber}: ${t.title}</li>`
    )
    .join('')

  return {
    subject: 'El programa sigue contando tus días',
    html: baseLayout({
      preheader: 'Volver hoy cuesta menos que volver mañana.',
      heading: `${opts.name}, llevas ${opts.daysInactive} días sin marcar`,
      body:
        paragraph(
          'Sin culpa y sin discurso: los días perdidos ya están marcados y no se recuperan. Lo único que importa es el de hoy, y el de hoy todavía está abierto.'
        ) +
        `<ul style="margin:0 0 16px;padding-left:20px;">${list}</ul>` +
        `
        <div style="margin:20px 0;padding:16px 20px;background:#f5f5f4;border-left:4px solid ${ACCENT};border-radius:0 4px 4px 0;">
          <p style="margin:0;font-size:14px;font-style:italic;line-height:1.6;color:${TEXT_LIGHT};">&ldquo;No pospongas nada. Equilibra la balanza de la vida cada día.&rdquo;</p>
          <p style="margin:6px 0 0;font-size:12px;font-weight:700;color:#ab841d;text-align:right;">— Séneca</p>
        </div>` +
        button('Retomar hoy', opts.appUrl),
    }),
  }
}

export async function sendEmail(to: string, content: EmailContent): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('RESEND_API_KEY no configurada en las variables de entorno.')
    return false
  }
  const from = process.env.EMAIL_FROM || `StoiCom <no-reply@notifications.juanmontoya.me>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: content.subject, html: content.html }),
    })
    if (!res.ok) {
      console.error('Resend rechazó el correo:', res.status, await res.text().catch(() => ''))
    }
    return res.ok
  } catch (error) {
    console.error('Error al enviar el correo vía Resend:', error)
    return false
  }
}
