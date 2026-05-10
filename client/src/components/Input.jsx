import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    inputClassName = '',
    id,
    required,
    ...rest
  },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-xs font-bold uppercase tracking-widest ${
            hasError ? 'text-red-500' : 'text-(--app-color-text-muted)'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--app-color-text-muted)">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          className={[
            'w-full rounded-xl border bg-(--app-color-surface-elevated) px-4 py-2.5 text-sm text-(--app-color-text) outline-none transition-all',
            'placeholder:text-(--app-color-text-muted)',
            'focus:ring-2',
            Icon ? 'pl-10' : '',
            hasError
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-(--app-color-border) focus:border-(--app-color-primary) focus:ring-(--app-color-primary)/10',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {hasError && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400">
            <AlertCircle size={16} />
          </span>
        )}
      </div>

      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-500"
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {!hasError && helperText && (
        <p className="text-xs text-(--app-color-text-muted)">{helperText}</p>
      )}
    </div>
  );
});

export default Input;