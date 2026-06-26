import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

type DatabaseError = {
  code?: string;
  constraint?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const user = this.users.create(input);
    try {
      return await this.users.save(user);
    } catch (error) {
      const databaseError = error as DatabaseError;
      if (
        databaseError.code === '23505' &&
        databaseError.constraint === 'UQ_users_email'
      ) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }
}
