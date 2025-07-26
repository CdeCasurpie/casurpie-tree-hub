import Link from 'next/link';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export default function Button({
  href,
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold transition-all transform hover:scale-105 rounded-lg inline-block text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variantClasses = {
    primary: 'bg-accent-green hover:bg-accent-green/80 text-text-primary border border-border disabled:hover:bg-accent-green',
    secondary: 'bg-bg-secondary hover:bg-bg-ternary text-text-primary border border-border hover:border-border-accent disabled:hover:bg-bg-secondary disabled:hover:border-border',
    outline: 'border-2 border-border-accent text-text-primary hover:bg-bg-secondary hover:border-accent-green disabled:hover:bg-transparent disabled:hover:border-border-accent'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const isDisabled = disabled || loading;
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  if (href && !isDisabled) {
    return (
      <Link href={href} className={classes}>
        {loading ? 'Cargando...' : children}
      </Link>
    );
  }
  
  return (
    <button 
      type={type}
      disabled={isDisabled}
      className={classes}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
}