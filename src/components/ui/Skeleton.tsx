// Placeholder con pulso para cargas: da forma al contenido que viene, en
// vez de un spinner en vacío. Se siente más rápido y más pro.
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[var(--border-color)] ${className}`} />
}
