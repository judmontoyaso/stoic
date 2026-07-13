import { Sun, Moon, BookOpen, Feather } from 'lucide-react'
import type { JournalIcon } from '@/lib/journal'

export default function TemplateIcon({ icon, className }: { icon: JournalIcon; className?: string }) {
  switch (icon) {
    case 'sun': return <Sun className={className} />
    case 'moon': return <Moon className={className} />
    case 'book': return <BookOpen className={className} />
    case 'feather': return <Feather className={className} />
  }
}
