import React from 'react';

export const Badge = ({ variant = 'dark', children, className = '' }) => {
  const variantStyles = {
    dark: 'bg-brand-dark text-white',
    red: 'bg-brand-red text-white',
    white: 'bg-white text-brand-dark shadow-sm border border-brand-gray-light',
    peach: 'bg-brand-peach text-brand-dark',
    gray: 'bg-brand-gray-light text-brand-dark',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-tight ${variantStyles[variant] || variantStyles.dark} ${className}`}>
      {children}
    </span>
  );
};
