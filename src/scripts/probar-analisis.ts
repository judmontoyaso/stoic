// Prueba el análisis mensual del diario contra datos REALES, sin
// levantar el servidor ni pasar por el login de Google.
//
//   npx tsx src/scripts/probar-analisis.ts <correo> [YYYY-MM] [--refresh]
//
// Sin mes, busca el mes con más entradas de esa cuenta. Con --refresh
// ignora la caché y vuelve a pagar la generación.
//
// Necesita en .env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// y DEEPSEEK_API_KEY (u OPENAI_API_KEY como respaldo).

import { createClient } from '@supabase/supabase-js'
import { buildMonthlyAnalysis, etiquetaMes } from '../lib/analysis'

async function main() {
  const [correo, ...resto] = process.argv.slice(2)
  if (!correo) {
    console.error('Uso: npx tsx src/scripts/probar-analisis.ts <correo> [YYYY-MM] [--refresh]')
    process.exit(1)
  }
  const refresh = resto.includes('--refresh')
  const mesPedido = resto.find(a => /^\d{4}-\d{2}$/.test(a))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
    process.exit(1)
  }

  const auth = createClient(url, key)
  const admin = createClient(url, key, { db: { schema: 'stoic' } })

  // Buscar el usuario por correo
  let userId: string | null = null
  let emailReal = ''
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await auth.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw new Error(error.message)
    const match = (data.users || []).find(
      u => u.email?.toLowerCase().includes(correo.toLowerCase())
    )
    if (match) {
      userId = match.id
      emailReal = match.email || ''
      console.log(`Usuario: ${emailReal} (${userId})`)
      console.log(`  plan=${match.app_metadata?.stoicom_plan} vence=${match.app_metadata?.stoicom_expires_at ?? 'nunca'}`)
      break
    }
    if ((data.users || []).length < 1000) break
  }
  if (!userId) {
    console.error(`No se encontró ningún usuario cuyo correo contenga "${correo}"`)
    process.exit(1)
  }

  // Elegir el mes con más entradas si no lo pidieron
  const { data: fechas, error: errFechas } = await admin
    .from('journal_entries')
    .select('date')
    .eq('user_id', userId)
  if (errFechas) throw new Error(errFechas.message)

  const porMes = new Map<string, number>()
  for (const f of (fechas || []) as Array<{ date: string }>) {
    const m = f.date.slice(0, 7)
    porMes.set(m, (porMes.get(m) || 0) + 1)
  }
  if (porMes.size === 0) {
    console.error('Esa cuenta no tiene ninguna entrada de diario. Nada que analizar.')
    process.exit(1)
  }

  console.log('\nEntradas por mes:')
  for (const [m, n] of [...porMes].sort()) console.log(`  ${m}: ${n}`)

  const mes = mesPedido || [...porMes].sort((a, b) => b[1] - a[1])[0][0]
  console.log(`\nAnalizando ${etiquetaMes(mes)} (${porMes.get(mes) ?? 0} entradas)${refresh ? ' [refresh]' : ''}…\n`)

  const t0 = Date.now()
  const out = await buildMonthlyAnalysis(admin, {
    userId,
    month: mes,
    refresh,
    minEntries: 4,
  })
  const segundos = ((Date.now() - t0) / 1000).toFixed(1)

  console.log('─'.repeat(72))
  switch (out.status) {
    case 'generated':
      console.log(`GENERADO en ${segundos}s con ${out.model} · ${out.entriesCount} entradas\n`)
      console.log(out.analysis)
      break
    case 'cached':
      console.log(`CACHEADO (usa --refresh para regenerar) · ${out.entriesCount} entradas\n`)
      console.log(out.analysis)
      break
    case 'too_few':
      console.log(`Muy pocas entradas con texto (${out.entriesCount}); el mínimo es 4.`)
      break
    case 'schema_missing':
      console.log(`Falta esquema: ${out.detail}`)
      break
    case 'failed':
      console.log('El modelo no devolvió análisis. Revisa DEEPSEEK_API_KEY.')
      break
  }
  console.log('─'.repeat(72))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
