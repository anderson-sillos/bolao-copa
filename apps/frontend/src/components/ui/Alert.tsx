type AlertProps = {
  messages: string[];
  title?: string;
  variant?: 'error' | 'success';
};

const alertStyles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export function Alert({
  messages,
  title = 'Não foi possível completar a solicitação:',
  variant = 'error',
}: AlertProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-6 rounded-2xl border p-4 text-sm ${alertStyles[variant]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {messages.map(message => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
