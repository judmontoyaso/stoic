'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Barra de pestañas inferior para móvil/PWA standalone.
// Las 5 rutas principales; el resto vive en el drawer del header
// (el Sidebar usa TABS para no repetirlas allí).
export const TABS = [
  { label: 'Panel', path: '/', icon: '/icons/time.png' },
  { label: 'Calendario', path: '/calendar', icon: '/icons/earth.png' },
  { label: 'Programa', path: '/habits', icon: '/icons/skull.png' },
  { label: 'Diario', path: '/journal', icon: '/icons/papyrus.png' },
  { label: 'Retos', path: '/challenges', icon: '/icons/armour.png' },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--sidebar-bg)] border-t border-[var(--border-color)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around">
        {TABS.map(tab => {
          const active = pathname === tab.path
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 transition-colors ${
                active ? 'text-[var(--primary-gold)]' : 'text-slate-500'
              }`}
            >
              <span className={`flex items-center justify-center w-9 h-7 rounded-full transition-all ${
                active ? 'bg-[var(--primary-gold)]/15' : ''
              }`}>
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className={`w-5 h-5 object-contain ${
                    active
                      ? 'scale-110 drop-shadow-[0_0_3px_rgba(201,168,76,0.4)]'
                      : 'opacity-55 dark:invert dark:opacity-45'
                  }`}
                />
              </span>
              <span className={`text-[9px] font-bold tracking-wide truncate ${active ? '' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
