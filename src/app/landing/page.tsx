import { Cinzel } from 'next/font/google'
import Link from 'next/link'
import LeadForm from '@/components/LeadForm'

// Landing pública (listada en el proxy): la cara de StoiCom para
// visitantes sin sesión. Siempre oscura, independiente del tema.

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' })

export const metadata = {
  title: 'StoiCom · 90 días de entrenamiento estoico',
  description:
    'El programa de 90 días que entrena cómo hablas — con los demás y contigo mismo. Un ejercicio al día, filosofía estoica aplicada, sin trampas.',
}

const GOLD = '#c9a84c'

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={`${cinzel.className} text-[11px] tracking-[0.35em] uppercase`}
      style={{ color: GOLD }}
    >
      {children}
    </p>
  )
}

export default function LandingPage() {
  return (
    <div className={`${cinzel.variable} min-h-screen w-full bg-[#0a0a0f] text-slate-300`}>
      {/* Nav */}
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sculpture.png"
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-[#c9a84c]/40"
          />
          <span className={`${cinzel.className} text-lg tracking-[0.2em] text-slate-100`}>
            STOI<span style={{ color: GOLD }}>COM</span>
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs font-bold tracking-wider uppercase px-4 py-2 rounded border border-[#c9a84c]/40 text-slate-200 hover:bg-[#c9a84c]/10 transition-colors"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-20 md:pt-24 md:pb-28 text-center">
        <Eyebrow>Programa de 90 días · Filosofía estoica aplicada</Eyebrow>
        <h1
          className={`${cinzel.className} mt-6 text-4xl md:text-6xl leading-[1.15] text-slate-100`}
        >
          Entrena cómo hablas.
          <br />
          <span style={{ color: GOLD }}>Con los demás y contigo.</span>
        </h1>
        <p className="mt-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed text-slate-400">
          Un ejercicio concreto cada día, a la hora que tú elijas. Sin frases de
          taza, sin atajos: percepción, acción y voluntad, entrenadas como
          entrenaban los estoicos — por escrito y contra el reloj de un día real.
        </p>
        <div className="mt-10">
          <p className="mb-5 text-sm font-bold text-slate-200">
            Empieza gratis: los primeros 7 días del programa, en tu correo.
          </p>
          <LeadForm source="landing-hero" />
          <p className="mt-6 text-xs text-slate-500">
            ¿Ya tienes acceso?{' '}
            <Link href="/login" className="underline hover:text-slate-300 transition-colors">
              Entrar con Google
            </Link>
          </p>
        </div>
      </section>

      {/* Firma: un día real del programa */}
      <section className="border-y border-[#c9a84c]/15 bg-[#0d0d13]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow>Así se ve un día</Eyebrow>
            <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100 leading-snug`}>
              El programa no se lee.
              <br />
              Se ejecuta.
            </h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                  6:00
                </span>
                <p className="text-sm leading-relaxed text-slate-400">
                  Llega tu correo con el ejercicio del día y una lección completa
                  escrita para ese día exacto de tu proceso. A la hora que tú fijes,
                  en tu zona horaria.
                </p>
              </li>
              <li className="flex gap-4">
                <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                  El día
                </span>
                <p className="text-sm leading-relaxed text-slate-400">
                  Ejecutas el ejercicio en tu vida real: una conversación, una
                  auditoría de tu lenguaje, un silencio a tiempo. Lo marcas en la
                  app. Los días perdidos se marcan — el calendario nunca se
                  reorganiza para consolarte.
                </p>
              </li>
              <li className="flex gap-4">
                <span className={`${cinzel.className} text-sm pt-0.5 w-14 shrink-0 text-right`} style={{ color: GOLD }}>
                  20:00
                </span>
                <p className="text-sm leading-relaxed text-slate-400">
                  El examen nocturno de Séneca: tres preguntas, por escrito. El día
                  se cierra en el diario, no en la cabeza.
                </p>
              </li>
            </ul>
          </div>

          {/* Carta del día: artefacto real */}
          <div className="relative">
            <div className="rounded-lg border border-[#c9a84c]/25 bg-[#111116] p-7 shadow-[0_20px_60px_-20px_rgba(201,168,76,0.15)]">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
                  Comunicación · Día 12
                </p>
                <p className="text-[10px] tracking-wider uppercase text-slate-500">Percepción</p>
              </div>
              <h3 className={`${cinzel.className} mt-4 text-xl text-slate-100`}>
                Auditoría de la primera reacción
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Hoy, en cada conversación que te incomode, no respondas a la primera
                frase que se te forme. Anota (mentalmente o en el teléfono) qué fue
                lo primero que quisiste decir. En la noche revisa la lista: ¿cuántas
                de esas primeras reacciones eran juicio y cuántas eran información?
              </p>
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-xs leading-relaxed text-slate-500 italic">
                  <span className="not-italic font-bold" style={{ color: GOLD }}>Por qué funciona: </span>
                  Epicteto separa lo que ocurre de tu opinión sobre lo que ocurre.
                  La primera reacción casi siempre es la opinión. Verla escrita le
                  quita el disfraz de &ldquo;verdad&rdquo;.
                </p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-600">
              Ejercicio real del programa — hay 180 como este, uno por día y por track.
            </p>
          </div>
        </div>
      </section>

      {/* Las tres fases: secuencia real del programa */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center">
          <Eyebrow>Tres fases de 30 días</Eyebrow>
          <h2 className={`${cinzel.className} mt-4 text-2xl md:text-3xl text-slate-100`}>
            La disciplina estoica, en orden
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              numeral: 'I',
              title: 'Percepción',
              body: 'Días 1–30. Ver las conversaciones y tus pensamientos como son, no como los tiñe la primera emoción. Aquí se entrena el juicio.',
            },
            {
              numeral: 'II',
              title: 'Acción',
              body: 'Días 31–60. Hablar, callar, preguntar y sostener lo difícil — a propósito. Aquí el entrenamiento sale al mundo.',
            },
            {
              numeral: 'III',
              title: 'Voluntad',
              body: 'Días 61–90. Sostener el estándar cuando nadie aplaude y el ánimo no acompaña. Aquí se consolida el carácter.',
            },
          ].map(f => (
            <div key={f.numeral} className="rounded-lg border border-slate-800 bg-[#0d0d13] p-6">
              <span className={`${cinzel.className} text-3xl`} style={{ color: GOLD }}>
                {f.numeral}
              </span>
              <h3 className={`${cinzel.className} mt-3 text-lg text-slate-100`}>{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Qué incluye */}
      <section className="border-y border-[#c9a84c]/15 bg-[#0d0d13]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center">
            <Eyebrow>Qué incluye</Eyebrow>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl mx-auto">
            {[
              ['Dos tracks paralelos', 'Comunicación con los demás y diálogo interno. Cada uno con sus 90 días propios; puedes llevar uno o los dos.'],
              ['Lección diaria escrita', 'Cada día trae una lección completa de 400–550 palabras para ese punto exacto del proceso, no un tip genérico.'],
              ['Diario con examen nocturno', 'Plantillas de mañana y noche basadas en Séneca y Marco Aurelio, con registro de ánimo y su gráfico.'],
              ['Retos semanales y mensuales', '13 retos que suben la apuesta cada semana, y un hito al cierre de cada fase.'],
              ['Correo y push a tu hora', 'El ejercicio en la mañana y el cierre en la noche, a la hora que elijas y en tu zona horaria.'],
              ['Tu progreso es tuyo', 'Racha real, días perdidos visibles, evaluación honesta. Sin insignias infladas ni rachas de mentira.'],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: GOLD }} />
                <div>
                  <p className="text-sm font-bold text-slate-200">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cita */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <p className={`${cinzel.className} text-xl md:text-2xl leading-relaxed text-slate-200`}>
          &ldquo;Tenemos dos oídos y una boca para escuchar el doble de lo que hablamos.&rdquo;
        </p>
        <p className="mt-4 text-xs tracking-[0.3em] uppercase" style={{ color: GOLD }}>
          Zenón de Citio
        </p>
      </section>

      {/* CTA final */}
      <section className="border-t border-[#c9a84c]/15">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center">
          <h2 className={`${cinzel.className} text-2xl md:text-3xl text-slate-100`}>
            Noventa días. Un ejercicio al día.
          </h2>
          <p className="mt-4 mb-8 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Prueba los siete primeros sin pagar nada. Si para el día 7 el
            programa no te ha movido nada, te das de baja y ya está.
          </p>
          <LeadForm source="landing-footer" />
          <p className="mt-6 text-xs text-slate-500">
            ¿Ya tienes acceso?{' '}
            <Link href="/login" className="underline hover:text-slate-300 transition-colors">
              Entrar con Google
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`${cinzel.className} text-[10px] tracking-[0.35em] uppercase text-slate-600`}>
            Memento Mori · Carpe Diem
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
