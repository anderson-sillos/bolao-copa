import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Team } from './team.entity';
import { Bet } from './bet.entity';

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_games',
  })
  id: string;

  @Column({ name: 'team_a_id', type: 'uuid', nullable: true })
  teamAId: string | null;

  @Column({ name: 'team_b_id', type: 'uuid', nullable: true })
  teamBId: string | null;

  @Column({ name: 'game_time' })
  gameTime: Date;

  @Column()
  phase: string;

  @Column({ name: 'score_a', type: 'integer', nullable: true })
  scoreA: number | null;

  @Column({ name: 'score_b', type: 'integer', nullable: true })
  scoreB: number | null;

  @Column({ name: 'penalty_score_a', type: 'integer', nullable: true })
  penaltyScoreA: number | null;

  @Column({ name: 'penalty_score_b', type: 'integer', nullable: true })
  penaltyScoreB: number | null;

  @Column({ name: 'match_number', type: 'integer', nullable: true })
  matchNumber: number | null;

  @Column({ name: 'bracket_order', type: 'integer', nullable: true })
  bracketOrder: number | null;

  @Column({ name: 'team_a_source', type: 'varchar', nullable: true })
  teamASource: string | null;

  @Column({ name: 'team_b_source', type: 'varchar', nullable: true })
  teamBSource: string | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({
    name: 'team_a_id',
    foreignKeyConstraintName: 'FK_games_team_a',
  })
  teamA: Team | null;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({
    name: 'team_b_id',
    foreignKeyConstraintName: 'FK_games_team_b',
  })
  teamB: Team | null;

  @OneToMany(() => Bet, bet => bet.game)
  bets: Bet[];
}
