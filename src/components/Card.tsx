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
  glowIntensity = 'subtle',
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const discoveryIntensityStyles = {
    none:
      'border-[rgba(143,128,246,0.08)] shadow-[var(--gw-shadow-dark-xs)]',
    subtle:
      'border-[rgba(143,128,246,0.10)] shadow-[var(--gw-glow-intelligence-soft)]',
    medium:
      'border-[rgba(143,128,246,0.14)] shadow-[0_0_0_1px_rgba(143,128,246,0.08),0_18px_42px_rgba(115,83,230,0.12)]',
    bright:
      'border-[rgba(143,128,246,0.18)] shadow-[0_0_0_1px_rgba(143,128,246,0.12),0_22px_56px_rgba(115,83,230,0.16)]',
  };

  const variantStyles = {
    elevated:
      'surface-panel',
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
