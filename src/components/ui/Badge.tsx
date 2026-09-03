import { HTMLAttributes } from 'react'

type Tone = 'blue' | 'orange' | 'green' | 'red' | 'gray' | 'amber' | 'indigo'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

// Not: 'blue' tonu marka rengi trust-blue token'ını kullanır; diğerleri (green/red/amber/indigo/gray)
// şimdilik Tailwind'in kendi paletinden -100/-800/-200 üçlüsünü kullanıyor. Faz 3'te admin sipariş
// durumu rozetleri için bunlar da token'laştırılacak (bkz. plan).
const toneClasses: Record<Tone, string> = {
  blue: 'bg-trust-blue-50 text-trust-blue-600 border-trust-blue-100',
  orange: 'bg-action-orange-500/10 text-action-orange-600 border-action-orange-500/20',
  green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  red: 'bg-risk-red-500/10 text-risk-red-500 border-risk-red-500/20',
  gray: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
}

export function Badge({ tone = 'gray', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-[var(--radius-sm)] border ${toneClasses[tone]} ${className}`}
      {...props}
    />
  )
}
