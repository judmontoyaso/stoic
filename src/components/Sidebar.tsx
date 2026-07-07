'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Flame, 
  Target, 
  BookOpen, 
  PenSquare, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Habitos', path: '/habits', icon: Flame },
    { label: 'Retos', path: '/challenges', icon: Target },
    { label: 'Recursos', path: '/resources', icon: BookOpen },
    { label: 'Diario', path: '/journal', icon: PenSquare },
  ]

  const toggleCollapsed = () => setCollapsed(!collapsed)
  const toggleMobile = () => setMobileOpen(!mobileOpen)

  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 70 },
  }

  const renderNavItems = (isMobile = false) => {
    return menuItems.map((item) => {
      const active = pathname === item.path
      const Icon = item.icon
      return (
        <Link
          key={item.path}
          href={item.path}
          onClick={() => isMobile && setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            active
              ? 'bg-[#c9a84c]/10 text-[#c9a84c]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#c9a84c]' : 'text-slate-400'}`} />
          {(!collapsed || isMobile) && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate"
            >
              {item.label}
            </motion.span>
          )}
        </Link>
      )
    })
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111116] border-b border-[#1e1e28] sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
          <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
        </Link>
        <button
          onClick={toggleMobile}
          className="p-1.5 rounded-lg bg-slate-800/50 text-slate-300 hover:text-slate-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 bg-black"
            />

            {/* Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="relative w-64 max-w-xs bg-[#111116] border-r border-[#1e1e28] h-full flex flex-col p-4 z-50"
            >
              <div className="flex items-center gap-2 mb-8 mt-2">
                <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
                <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
              </div>
              <nav className="flex-1 space-y-2">
                {renderNavItems(true)}
              </nav>
              <div className="pt-4 border-t border-[#1e1e28] text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Memento Mori</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className="hidden md:flex flex-col bg-[#111116] border-r border-[#1e1e28] h-screen sticky top-0 p-4 flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 mt-2">
          {(!collapsed) ? (
            <Link href="/" className="flex items-center gap-2">
              <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
              <span className="font-bold text-slate-100 tracking-wider">StoiCom</span>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <img src="/sculpture.png" className="w-8 h-8 rounded-full object-cover border border-[#c9a84c]/30" alt="StoiCom Logo" />
            </Link>
          )}

          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg bg-slate-800/20 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {renderNavItems(false)}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1e1e28] text-center">
          {!collapsed ? (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Memento Mori</p>
          ) : (
            <span className="text-xs text-slate-600 font-bold">M</span>
          )}
        </div>
      </motion.div>
    </>
  )
}
