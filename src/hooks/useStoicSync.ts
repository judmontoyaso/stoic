'use client'

import { useEffect } from 'react'

/**
 * Ejecuta `load` al montar y cada vez que StoicDB emite 'stoic_data_changed'.
 * `load` debe estar memoizado (useCallback) en el llamador.
 */
export function useStoicSync(load: () => void) {
  useEffect(() => {
    load()
    window.addEventListener('stoic_data_changed', load)
    return () => window.removeEventListener('stoic_data_changed', load)
  }, [load])
}
