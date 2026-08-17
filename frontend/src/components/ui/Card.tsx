import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
