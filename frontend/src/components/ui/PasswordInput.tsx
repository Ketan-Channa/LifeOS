import React, { useState, forwardRef } from 'react';
import { Input, InputProps } from './Input';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
