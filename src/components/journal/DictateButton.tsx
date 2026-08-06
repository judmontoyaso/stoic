'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Botón de dictado para los campos del diario. Graba con MediaRecorder y
// manda el audio a /api/transcribe, que es quien habla con Deepgram: la
// llave nunca sale al navegador.
//
// Lo transcrito se AÑADE a lo que ya haya escrito, no lo pisa. Dictar
// sobre un párrafo a medias y perderlo sería la peor manera de estrenar
// la función.
//
// La primera vez pide autorización explícita: el audio del diario sale
// hacia un tercero fuera del país y eso se pregunta, no se asume.

interface Props {
  /** Recibe el texto transcrito para que el padre lo concatene */
  onTranscript: (texto: string) => void
  /** Etiqueta del campo, para el aria-label */
  campo: string
}

/** El navegador decide el formato; se toma el primero que soporte. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const candidatos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  return candidatos.find(m => MediaRecorder.isTypeSupported(m))
}

export default function DictateButton({ onTranscript, campo }: Props) {
  const [grabando, setGrabando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [pidiendoPermiso, setPidiendoPermiso] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  /** Audio grabado que quedó a la espera de la autorización.
   *  Va en estado y no en ref porque el aviso lo muestra al pintar, y
   *  leer un ref durante el render es justo lo que React prohíbe. */
  const [pendiente, setPendiente] = useState<Blob | null>(null)
  /** null = todavía no se sabe; se consulta al montar, no al grabar. */
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  const enviar = useCallback(
    async (blob: Blob) => {
      setEnviando(true)
      try {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'audio/webm' },
          body: blob,
        })
        const data = await res.json()

        if (res.status === 403 && data.needsConsent) {
          // No debería llegar aquí: el permiso se pide ANTES de grabar.
          // Si pasa, se guarda el audio para reenviarlo en cuanto
          // autorice — perder lo que la persona acaba de dictar es la
          // peor forma de estrenar la función.
          setPendiente(blob)
          setPidiendoPermiso(true)
          return
        }
        if (!res.ok) {
          toast.error(data.error || 'No se pudo transcribir')
          return
        }
        if (!data.transcript) {
          toast('No se entendió nada. Habla más cerca del micrófono.', { icon: '🎙️' })
          return
        }
        onTranscript(data.transcript)
        if (typeof data.minutosRestantes === 'number' && data.minutosRestantes <= 10) {
          toast(`Te quedan ${data.minutosRestantes} minutos de dictado este mes`, { icon: '⏳' })
        }
      } catch {
        toast.error('Sin conexión')
      } finally {
        setEnviando(false)
      }
    },
    [onTranscript]
  )

  const detener = useCallback(() => {
    recorderRef.current?.stop()
    setGrabando(false)
  }, [])

  const empezar = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Tu navegador no permite grabar. Usa el micrófono del teclado.')
      return
    }
    // El permiso se pide ANTES de grabar. Pedirlo después es hacer que
    // alguien hable dos minutos para luego preguntarle si se puede usar.
    if (autorizado === false) {
      setPidiendoPermiso(true)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        // Soltar el micrófono: sin esto el indicador del navegador se
        // queda encendido y parece que seguimos escuchando.
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size > 0) enviar(blob)
      }

      recorder.start()
      recorderRef.current = recorder
      setGrabando(true)
    } catch {
      toast.error('No diste permiso al micrófono')
    }
  }, [enviar, autorizado])

  // Se consulta al montar, no al grabar: así el permiso se pide antes de
  // que la persona empiece a hablar.
  useEffect(() => {
    fetch('/api/transcribe/estado')
      .then(res => res.json())
      .then(d => setAutorizado(d.autorizado === true))
      .catch(() => setAutorizado(null))
  }, [])

  const autorizar = async () => {
    try {
      const res = await fetch('/api/transcribe', { method: 'PUT' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'No se pudo guardar la autorización')
        return
      }
      setAutorizado(true)
      setPidiendoPermiso(false)
      // Si había audio esperando, se manda solo: la persona ya habló y no
      // tiene por qué repetirlo.
      if (pendiente) {
        setPendiente(null)
        await enviar(pendiente)
      }
    } catch {
      toast.error('Sin conexión')
    }
  }

  if (pidiendoPermiso) {
    return (
      <div className="mt-2 rounded-lg border border-[var(--primary-gold)]/40 bg-[var(--background)] p-3">
        <p className="text-xs leading-relaxed text-slate-500">
          Transcribimos con Deepgram. No guardamos el audio, solo el texto.
          {pendiente ? ' Tu grabación está esperando: autoriza y se transcribe sola.' : ''}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={autorizar}
            className="rounded bg-[var(--primary-gold)] px-3 py-1.5 text-[11px] font-bold text-[#0a0a0f]"
          >
            Activar
          </button>
          <button
            type="button"
            onClick={() => setPidiendoPermiso(false)}
            className="rounded border border-[var(--border-color)] px-3 py-1.5 text-[11px] font-bold text-slate-500"
          >
            Ahora no
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={grabando ? detener : empezar}
      disabled={enviando}
      aria-label={grabando ? `Detener el dictado de ${campo}` : `Dictar ${campo}`}
      title={grabando ? 'Detener y transcribir' : 'Dictar en voz alta'}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
        grabando
          ? 'bg-red-500/15 text-red-400'
          : 'text-slate-500 hover:bg-[var(--primary-gold)]/10 hover:text-[var(--primary-gold)]'
      }`}
    >
      {enviando ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transcribiendo
        </>
      ) : grabando ? (
        <>
          <Square className="h-3.5 w-3.5 fill-current" /> Detener
        </>
      ) : (
        <>
          <Mic className="h-3.5 w-3.5" /> Dictar
        </>
      )}
    </button>
  )
}
