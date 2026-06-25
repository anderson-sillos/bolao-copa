import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity({ name: 'groups' })
@Unique('UQ_groups_name', ['name'])
export class Group {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_groups',
  })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Team, team => team.group)
  teams: Team[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
