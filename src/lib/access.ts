// Vigencia del acceso: UNA sola fuente de verdad.
//
// El acceso fundador dejó de ser vitalicio. Se compra un año; vencido,
// hay 30 días de gracia en los que el usuario ya NO entra al programa
// pero todavía puede descargar su diario. Pasada la gracia se borra el
// contenido personal (la cuenta y el registro de pago se conservan: uno
// para poder volver, el otro porque es contabilidad).
//
// OJO — quien compró ANTES del cambio compró "acceso vitalicio" y lo
// conserva. Esos usuarios llevan stoicom_lifetime = true y no vencen
// nunca. La marca la pone supabase_v14_vigencia.sql y NADA en este
// código la quita: convertirlos a un año sería cambiarles el trato
// después de haber cobrado.
//
// El estado vive en app_metadata (solo el service role la escribe, el
// usuario no puede auto-renovarse), igual que stoicom_approved.

/** Días entre el vencimiento y el borrado del contenido personal. */
export const GRACE_DAYS = 30

/** Meses que dura una compra o una renovación. */
export const VIGENCIA_MESES = 12

export type AccessState =
  /** Vitalicio: comprador anterior al cambio, o acceso sin vencimiento (becas, códigos) */
  | 'lifetime'
  /** Dentro del año pagado */
  | 'active'
  /** Vencido, dentro de los 30 días de gracia: solo exportar y renovar */
  | 'grace'
  /** Pasada la gracia: el contenido personal ya se borró (o se borra en la próxima pasada) */
  | 'expired'
  /** Sin aprobación: nunca entró, o se le revocó (reembolso) */
  | 'none'

/**
 * Los campos de app_metadata que decide este módulo.
 *
 * El índice abierto no es adorno: Supabase tipa app_metadata como un
 * diccionario libre, y sin él TypeScript no deja pasar el objeto real.
 */
export interface AccessMetadata {
  stoicom_approved?: boolean
  stoicom_lifetime?: boolean
  stoicom_expires_at?: string | null
  stoicom_plan?: string
  [key: string]: unknown
}

export interface Access {
  state: AccessState
  /** null en vitalicios y en accesos sin vencimiento */
  expiresAt: Date | null
  /** Cuándo se borra el contenido personal. null si no vence */
  purgeAt: Date | null
  /** Días hasta el vencimiento. Negativo si ya venció. null si no vence */
  daysToExpiry: number | null
  /** Días hasta el borrado. Negativo si ya pasó. null si no vence */
  daysToPurge: number | null
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Días enteros entre dos fechas (hacia arriba: "quedan 0 días" solo el mismo día). */
function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / DAY_MS)
}

/** Suma meses conservando el día del mes (31 de enero + 1 mes = 28/29 de febrero). */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime())
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  // setMonth desborda al mes siguiente cuando el día no existe (31 → 3 de marzo).
  // Retroceder al último día del mes esperado es lo que espera un comprador.
  if (d.getDate() !== day) d.setDate(0)
  return d
}

/**
 * Vigencia nueva tras un pago.
 *
 * Se extiende desde el vencimiento actual si todavía no ha llegado, no
 * desde hoy: quien renueva con dos meses de sobra no puede perderlos por
 * pagar temprano. Vencido, cuenta desde hoy.
 */
export function nextExpiry(current: string | null | undefined, now = new Date()): Date {
  const base = current ? new Date(current) : null
  const from = base && !Number.isNaN(base.getTime()) && base > now ? base : now
  return addMonths(from, VIGENCIA_MESES)
}

/** Estado de acceso de un usuario a partir de su app_metadata. */
export function readAccess(meta: AccessMetadata | null | undefined, now = new Date()): Access {
  const none: Access = {
    state: 'none',
    expiresAt: null,
    purgeAt: null,
    daysToExpiry: null,
    daysToPurge: null,
  }

  if (!meta || meta.stoicom_approved !== true) return none

  // Vitalicio explícito: comprador anterior al cambio de modelo
  if (meta.stoicom_lifetime === true) {
    return { ...none, state: 'lifetime' }
  }

  const raw = meta.stoicom_expires_at
  const expiresAt = raw ? new Date(raw) : null

  // Aprobado sin fecha: becas, códigos de invitación y cuentas antiguas.
  // Se tratan como sin vencimiento a propósito — ante la duda NO se echa
  // a nadie que ya tenía acceso legítimo.
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return { ...none, state: 'lifetime' }
  }

  const purgeAt = new Date(expiresAt.getTime() + GRACE_DAYS * DAY_MS)
  const daysToExpiry = daysBetween(now, expiresAt)
  const daysToPurge = daysBetween(now, purgeAt)

  let state: AccessState
  if (now < expiresAt) state = 'active'
  else if (now < purgeAt) state = 'grace'
  else state = 'expired'

  return { state, expiresAt, purgeAt, daysToExpiry, daysToPurge }
}

/** ¿Puede entrar al programa? Solo vitalicios y vigentes. */
export function canUseProgram(access: Access): boolean {
  return access.state === 'lifetime' || access.state === 'active'
}

/** ¿Sigue habiendo datos que pueda descargar? Vigentes y en gracia. */
export function canExport(access: Access): boolean {
  return access.state !== 'none' && access.state !== 'expired'
}

/** Atajo para el caso más común: leer app_metadata y decidir si entra. */
export function hasProgramAccess(meta: AccessMetadata | null | undefined, now = new Date()): boolean {
  return canUseProgram(readAccess(meta, now))
}
