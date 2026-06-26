import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Environment } from '../config/environment';
import { User } from '../entities/user.entity';
import { PublicUser, toPublicUser } from '../users/public-user';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload';
import { validatePasswordPolicy } from './password-policy';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async register(input: RegisterDto): Promise<AuthResponse> {
    const name = input.name.trim();
    const email = this.normalizeEmail(input.email);

    validatePasswordPolicy(input.password, { name, email });

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });
    const user = await this.users.create({ name, email, passwordHash });

    return this.issueToken(user);
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(input.email);
    const user = await this.users.findByEmail(email);

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.issueToken(user);
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return toPublicUser(user);
  }

  private async issueToken(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const expiresIn = this.config.get('AUTH_TOKEN_EXPIRES_IN', {
      infer: true,
    });

    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: this.config.get('AUTH_JWT_SECRET', { infer: true }),
        expiresIn,
      }),
      tokenType: 'Bearer',
      expiresIn: this.toSeconds(expiresIn),
      user: toPublicUser(user),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLocaleLowerCase('pt-BR');
  }

  private toSeconds(expiration: string): number {
    const amount = Number.parseInt(expiration.slice(0, -1), 10);
    const unit = expiration.at(-1);
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    return amount * multipliers[unit ?? 's'];
  }
}
