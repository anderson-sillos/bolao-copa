import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Game } from './game.entity';

@Entity({ name: 'bets' })
@Unique('UQ_bets_user_game', ['userId', 'gameId'])
export class Bet {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_bets',
  })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'game_id' })
  gameId: string;

  @Column({ name: 'score_a' })
  scoreA: number;

  @Column({ name: 'score_b' })
  scoreB: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.bets)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_bets_user',
  })
  user: User;

  @ManyToOne(() => Game, game => game.bets)
  @JoinColumn({
    name: 'game_id',
    foreignKeyConstraintName: 'FK_bets_game',
  })
  game: Game;
}
