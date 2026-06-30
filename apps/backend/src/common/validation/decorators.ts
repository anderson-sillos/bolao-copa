import { IsEmail, ValidationOptions } from 'class-validator';
import { validationMessages } from './validation-messages';

export function IsAppEmail(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return IsEmail(
    {},
    {
      message: validationMessages.email.invalid,
      ...validationOptions,
    },
  );
}
