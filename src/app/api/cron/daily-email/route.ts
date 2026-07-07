import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { STOIC_QUOTES } from '@/lib/quotes'
import { dailyReflectionEmail, sendEmail } from '@/lib/email'
import { getPhaseLabel } from '@/lib/utils'
import { generateDailyReflection } from '@/lib/ai'

// Endpoint de Cron diario para enviar preparación estoica
// GET /api/cron/daily-email?secret=...&to=...&day=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const forceTo = searchParams.get('to')
  const forceDay = searchParams.get('day')

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const appUrl = process.env.APP_URL || 'http://localhost:3000'

  if (!supabaseServiceKey) {
    return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })
  }

  // Cliente con privilegios de administrador para leer auth.users y hacer bypass de RLS si es necesario
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'stoic' },
  })

  let recipients: { email: string; name: string; dayNumber: number }[] = []

  // 1. Caso de prueba manual o correo directo
  if (forceTo) {
    const day = forceDay ? parseInt(forceDay, 10) : 1
    recipients.push({
      email: forceTo,
      name: forceTo.split('@')[0],
      dayNumber: isNaN(day) ? 1 : day,
    })
  } else {
    // 2. Resolver desde la base de datos de usuarios
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      const now = new Date()
      authData.users.forEach((user) => {
        if (user.email) {
          const createdAt = new Date(user.created_at)
          const diffTime = Math.abs(now.getTime() - createdAt.getTime())
          const dayNumber = Math.min(90, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1)
          
          recipients.push({
            email: user.email,
            name: user.user_metadata?.full_name?.split(' ')[0] || user.email.split('@')[0],
            dayNumber,
          })
        }
      })
    } catch (dbError: any) {
      console.error('Error cargando usuarios de auth:', dbError.message)
      // Fallback a NOTIFICATION_EMAIL si no hay usuarios o falla
      const fallbackEmail = process.env.NOTIFICATION_EMAIL || 'no-reply@notifications.juanmontoya.me'
      const day = forceDay ? parseInt(forceDay, 10) : 1
      recipients.push({
        email: fallbackEmail,
        name: 'Practicante',
        dayNumber: isNaN(day) ? 1 : day,
      })
    }
  }

  let sent = 0
  let failed = 0

  for (const recipient of recipients) {
    try {
      const dayNumber = recipient.dayNumber
      const phase = Math.min(3, Math.max(1, Math.ceil(dayNumber / 30)))
      const week = Math.min(12, Math.max(1, Math.ceil(dayNumber / 7)))
      
      // Obtener hábitos de la fase actual
      const { data: habits } = await supabase
        .from('habits')
        .select('name, description')
        .eq('phase', phase)
        .order('sort_order')

      // Obtener el reto de la semana actual
      const { data: challenges } = await supabase
        .from('challenges')
        .select('title, description')
        .eq('week', week)
        .limit(1)

      const challenge = challenges && challenges[0] ? challenges[0] : null
      const quote = STOIC_QUOTES[(dayNumber - 1) % STOIC_QUOTES.length]

      // Generar reflexión inteligente usando IA (Gemini) si hay API Key
      const aiReflection = await generateDailyReflection({
        dayNumber,
        phase,
        phaseLabel: getPhaseLabel(phase),
        quote,
        habits: habits || [],
        challenge,
      })

      const emailContent = dailyReflectionEmail({
        name: recipient.name,
        dayNumber,
        phase,
        phaseLabel: getPhaseLabel(phase),
        quote,
        habits: habits || [],
        challenge,
        appUrl,
        aiReflection,
      })

      const success = await sendEmail(recipient.email, emailContent)
      if (success) {
        sent++
      } else {
        failed++
      }
    } catch (err) {
      console.error(`Error enviando correo a ${recipient.email}:`, err)
      failed++
    }
  }

  return NextResponse.json({
    ok: true,
    totalProcessed: recipients.length,
    sent,
    failed,
  })
}
