'use client';

import { forwardRef } from 'react';
import { UseFormRegister, FieldError, FieldValues } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormFieldProps<T extends FieldValues = FieldValues> {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  error?: FieldError;
  register?: UseFormRegister<T>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  icon?: React.ReactNode;
  autoComplete?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      error,
      register,
      required = false,
      disabled = false,
      className,
      description,
      icon,
      autoComplete,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className={cn('space-y-2', className)}>
        <Label
          htmlFor={name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}

          <Input
            id={name}
            type={inputType}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            ref={ref}
            className={cn(
              'w-full',
              icon && 'pl-10',
              isPasswordField && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            {...(register && register(name))}
            {...props}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
