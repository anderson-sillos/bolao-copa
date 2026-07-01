import { ChangeEventHandler, HTMLInputAutoCompleteAttribute } from 'react';

type TextFieldProps = {
  autoComplete?: HTMLInputAutoCompleteAttribute;
  id: string;
  label: string;
  minLength?: number;
  name: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  type?: 'email' | 'password' | 'text';
  value: string;
};

export function TextField({
  autoComplete,
  id,
  label,
  minLength,
  name,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  value,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        id={id}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
