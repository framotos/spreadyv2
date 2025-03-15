import React from 'react';
import { cva } from 'class-variance-authority';
import { ToggleButtonProps } from '@/lib/types';

const buttonStyles = cva('px-3 py-1 rounded-full text-sm', {
  variants: {
    active: {
      true: 'bg-primary-600 text-white',
      false: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  },
  defaultVariants: {
    active: false
  }
});

const ToggleButtonComponent: React.FC<ToggleButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button onClick={onClick} className={buttonStyles({ active: isActive })}>
      {label}
    </button>
  );
};

export default ToggleButtonComponent; 