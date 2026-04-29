import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'motion-control inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-normal transition-smooth disabled:cursor-not-allowed disabled:opacity-45';

  const variantStyles = {
    primary:
      'btn-primary text-white',
    secondary:
      'btn-secondary',
    outline:
      'btn-secondary bg-transparent text-[var(--text-primary)] border-[var(--gw-border-strong)]',
    ghost:
      'btn-ghost',
  };

  const sizeStyles = {
    sm: 'min-h-[40px] px-3.5 text-[var(--gw-font-size-sm)]',
    md: 'min-h-[44px] px-5 text-[var(--gw-font-size-md)]',
    lg: 'min-h-[48px] px-6 text-[var(--gw-font-size-lg)]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
