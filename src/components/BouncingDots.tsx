import React from 'react';

interface BouncingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const BouncingDots: React.FC<BouncingDotsProps> = ({ 
  size = 'md',
  color = 'var(--primary)'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      <div 
        className={`${sizeClasses[size]} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '0ms'
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '150ms'
        }}
      />
      <div 
        className={`${sizeClasses[size]} rounded-full animate-bounce`}
        style={{ 
          backgroundColor: color,
          animationDelay: '300ms'
        }}
      />
    </div>
  );
};

export default BouncingDots;