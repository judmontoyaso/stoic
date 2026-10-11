// Server-only. Quién es administrador de StoiCom.

export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || ''
  const envList = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  const defaultAdmins = ['juandavidsolorzano73@gmail.com']
  return Array.from(new Set([...defaultAdmins, ...envList]))
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}
