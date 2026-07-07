'use client'

import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      toast.error('Por favor ingresa la contraseña')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Sesión iniciada correctamente')
        // Recargar a la raíz para forzar que middleware verifique la sesión en cookies
        window.location.href = '/'
      } else {
        toast.error(data.error || 'Contraseña incorrecta')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al intentar iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-md shadow-sm space-y-6">
        
        {/* Branding & Logo */}
        <div className="text-center space-y-2">
          <img 
            src="/sculpture.png" 
            alt="Escultura Estoica" 
            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-[var(--primary-gold)]/40 shadow-sm"
          />
          <h1 className="text-xl font-black tracking-wider text-[var(--foreground)] mt-2">
            Stoi<span className="text-[var(--primary-gold)]">Com</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 uppercase tracking-widest font-semibold">
            Preparación Estoica y Comunicación
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
              Contraseña de Acceso
            </label>
            <div className="p-input-icon-left w-full">
              <i className="pi pi-lock text-slate-500 mr-2" />
              <InputText
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            label={loading ? 'Iniciando...' : 'Entrar al Espacio'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            className="w-full p-button-sm font-bold mt-2"
            disabled={loading}
            style={{ 
              backgroundColor: 'var(--primary-gold)', 
              borderColor: 'var(--primary-gold)', 
              color: 'var(--background)',
              borderRadius: '4px'
            }}
          />
        </form>

        {/* Memento Mori Footer */}
        <div className="text-center pt-2 border-t border-[var(--border-color)]">
          <p className="text-[9px] text-slate-550 dark:text-slate-450 uppercase tracking-widest font-black">
            Memento Mori · Carpe Diem
          </p>
        </div>

      </div>
    </div>
  )
}
