import { IsString } from 'class-validator';
import { IsAppEmail } from '../../common/validation';

export class LoginDto {
  @IsAppEmail()
  email: string;

  @IsString()
  password: string;
}
