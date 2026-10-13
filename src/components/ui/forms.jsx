import React, { useId } from 'react';

const BASE =
  'w-full min-h-12 rounded-xl bg-ablf-surface border border-ablf-line px-4 text-white placeholder-gray-500 focus:border-ablf-green focus:outline-none disabled:opacity-60';

// Campo com rótulo, ajuda e erro ligados por aria (leitores de tela leem tudo junto).
export function Field({ label, hint, error, required, children }) {
  const id = useId();
  const child = React.cloneElement(children, {
    id,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint && `${id}-hint`, error && `${id}-erro`].filter(Boolean).join(' ') || undefined,
  });
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
        {label}{required && <span className="text-ablf-yellow" aria-hidden="true"> *</span>}
      </label>
      {child}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p id={`${id}-erro`} role="alert" className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export const TextInput = React.forwardRef(function TextInput({ className = '', ...props }, ref) {
  return <input ref={ref} {...props} className={`${BASE} ${className}`} />;
});

export function Select({ className = '', children, ...props }) {
  return <select {...props} className={`${BASE} ${className}`}>{children}</select>;
}

export function Textarea({ className = '', ...props }) {
  return <textarea {...props} className={`${BASE} py-3 min-h-28 ${className}`} />;
}

export function Checkbox({ children, ...props }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
      <input type="checkbox" {...props} className="mt-0.5 w-5 h-5 shrink-0 accent-green-500" />
      <span>{children}</span>
    </label>
  );
}
