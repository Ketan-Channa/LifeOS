import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string | null;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium my-3">
      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
      <span>{message}</span>
    </div>
  );
};
