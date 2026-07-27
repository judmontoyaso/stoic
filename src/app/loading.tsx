// Esqueleto de navegación: aparece al instante al cambiar de página,
// mientras el servidor responde y carga el chunk del módulo destino.
// Sin esto, tocar un enlace dejaba la página anterior congelada sin
// feedback — la queja exacta de "se queda como pausado".
export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse" aria-busy="true" aria-label="Cargando">
      {/* Título */}
      <div className="h-7 w-48 rounded-lg bg-[var(--sidebar-bg)]" />
      {/* Tarjetas */}
      <div className="h-40 rounded-2xl bg-[var(--sidebar-bg)]" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl bg-[var(--sidebar-bg)]" />
        <div className="h-56 rounded-2xl bg-[var(--sidebar-bg)]" />
      </div>
    </div>
  )
}
