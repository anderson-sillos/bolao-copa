import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

import { registerUser } from '../../../auth/auth-client';
import { saveAuthToken } from '../../../auth/auth-storage';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { TextField } from '../../../components/ui/TextField';
import { getErrorMessages } from '../../../lib/api-errors';
import { AuthShell } from './AuthShell';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessages([]);

    try {
      const response = await registerUser({ name, email, password });
      saveAuthToken(response.accessToken);
      await router.push('/');
    } catch (error) {
      setMessages(getErrorMessages(error));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Crie sua conta e entre no jogo."
      description="Participe dos palpites, acompanhe sua pontuação e dispute o ranking com uma experiência simples e segura."
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Criar conta</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use nome, e-mail e uma senha com pelo menos 8 caracteres.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <TextField
          id="name"
          name="name"
          label="Nome"
          minLength={2}
          autoComplete="name"
          placeholder="Anderson Martins"
          value={name}
          onChange={event => setName(event.target.value)}
        />

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
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>

      <Alert messages={messages} />

      <p className="mt-8 text-center text-sm text-slate-600">
        Já possui conta?{' '}
        <Link
          className="font-semibold text-emerald-700 hover:text-emerald-800"
          href="/login"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
