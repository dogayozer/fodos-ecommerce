import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-cta-background hover:bg-cta-hover text-white shadow-[var(--shadow-button)]',
  secondary: 'bg-trust-blue-600 hover:bg-trust-blue-600/90 text-white shadow-[var(--shadow-button)]',
  ghost: 'bg-transparent border border-neutral-200 text-trust-blue-600 hover:bg-neutral-50',
  danger: 'bg-risk-red-500 hover:bg-risk-red-500/90 text-white shadow-[var(--shadow-button)]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-md)]',
  md: 'px-4 py-2 text-sm rounded-[var(--radius-lg)]',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-lg)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`font-bold transition-colors duration-normal disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
