import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  id: string;
  labelClassName?: string;
}

export function FormInput({ label, id, className, labelClassName, ...props }: FormInputProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label htmlFor={id} className={labelClassName || 'text-xs text-content-secondary'}>
        {label}
      </Label>
      <Input id={id} {...props} />
    </div>
  );
}
