import { ReactNode } from 'react';

type GlowIntensity = 'none' | 'subtle' | 'medium' | 'bright';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'glass' | 'flat' | 'discovery';
  glowIntensity?: GlowIntensity;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'elevated',
  glowIntensity = 'none',
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const discoveryIntensityStyles = {
    none:
      'border-[rgba(143,128,246,0.06)] shadow-[var(--gw-shadow-dark-xs)]',
    subtle:
      'border-[rgba(143,128,246,0.08)] shadow-[var(--gw-glow-intelligence-soft)]',
    medium:
      'border-[rgba(143,128,246,0.11)] shadow-[0_0_0_1px_rgba(143,128,246,0.06),0_14px_32px_rgba(115,83,230,0.07)]',
    bright:
      'border-[rgba(143,128,246,0.14)] shadow-[0_0_0_1px_rgba(143,128,246,0.08),0_18px_42px_rgba(115,83,230,0.1)]',
  };

  const variantStyles = {
    elevated:
      'clinical-card',
    glass:
      'surface-panel-soft glass-sheen',
    flat:
      'surface-panel-quiet',
    discovery: `surface-intelligence ${discoveryIntensityStyles[glowIntensity]}`,
  };

  return (
    <div className={`${variantStyles[variant]} motion-card ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
