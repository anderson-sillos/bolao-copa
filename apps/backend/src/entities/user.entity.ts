import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Bet } from './bet.entity';

@Entity({ name: 'users' })
@Unique('UQ_users_email', ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_users',
  })
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Bet, bet => bet.user)
  bets: Bet[];
}
