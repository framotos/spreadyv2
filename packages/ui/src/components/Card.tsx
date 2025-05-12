import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   */
  variant?: 'default' | 'bordered' | 'elevated';
  /**
   * Card padding
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card component for content containers
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    variant = 'default', 
    padding = 'md', 
    ...props 
  }, ref) => {
    // Base classes
    const baseClasses = 'rounded-lg';
    
    // Variant classes
    const variantClasses = {
      default: 'bg-white',
      bordered: 'bg-white border border-gray-200',
      elevated: 'bg-white shadow-md'
    };
    
    // Padding classes
    const paddingClasses = {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6'
    };
    
    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card'; 