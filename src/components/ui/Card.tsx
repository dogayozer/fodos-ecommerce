import { HTMLAttributes } from 'react'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding
  interactive?: boolean
}

const paddingClasses: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function Card({ padding = 'md', interactive = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-neutral-0 border border-neutral-200 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] ${
        interactive ? 'transition-shadow duration-normal hover:shadow-[var(--shadow-card-hover)]' : ''
      } ${paddingClasses[padding]} ${className}`}
      {...props}
    />
  )
}
