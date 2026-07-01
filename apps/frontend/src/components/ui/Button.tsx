import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
};

const buttonVariants = {
  primary:
    'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 focus:ring-emerald-200 disabled:bg-slate-400 disabled:shadow-none',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 disabled:bg-slate-100 disabled:text-slate-400',
};

export function Button({
  className = '',
  fullWidth = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-xl px-4 py-3 font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed',
        buttonVariants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      type={type}
      {...props}
    />
  );
}
