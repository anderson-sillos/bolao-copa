import { IsString, MaxLength, MinLength } from 'class-validator';
import { IsAppEmail } from '../../common/validation';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsAppEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
