import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

import { loginUser } from '../../../auth/auth-client';
import { saveAuthToken } from '../../../auth/auth-storage';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { getErrorMessages } from '../../../lib/api-errors';
import { AuthShell } from './AuthShell';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessages([]);

    try {
      const response = await loginUser({ email, password });
      saveAuthToken(response.accessToken);
      await router.push('/');
    } catch (error) {
      setMessages(getErrorMessages(error));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Entre na sua conta e acompanhe seus palpites."
      description="Acesse seu perfil, veja sua pontuação e continue participando do Bolão da Copa 2026."
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Informe seu e-mail e senha para acessar sua conta.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <TextField
          id="email"
          name="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          value={email}
          onChange={event => setEmail(event.target.value)}
        />

        <TextField
          id="password"
          name="password"
          label="Senha"
          type="password"
          minLength={8}
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <Alert messages={messages} />

      <p className="mt-8 text-center text-sm text-slate-600">
        Ainda não possui conta?{' '}
        <Link
          className="font-semibold text-emerald-700 hover:text-emerald-800"
          href="/register"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}
