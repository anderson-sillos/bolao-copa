import { BadRequestException } from '@nestjs/common';

type PasswordSubject = {
  name: string;
  email: string;
};

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR');
}

export function validatePasswordPolicy(
  password: string,
  subject: PasswordSubject,
): void {
  if (password.length < 8) {
    throw new BadRequestException(
      'A senha deve possuir pelo menos 8 caracteres',
    );
  }
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    throw new BadRequestException(
      'A senha deve conter pelo menos uma letra e um número',
    );
  }

  const normalizedPassword = normalize(password);
  const normalizedName = normalize(subject.name);
  const normalizedEmail = normalize(subject.email);

  if (
    normalizedPassword === normalizedName ||
    normalizedPassword === normalizedEmail
  ) {
    throw new BadRequestException(
      'A senha não pode ser igual ao nome ou e-mail',
    );
  }
}
