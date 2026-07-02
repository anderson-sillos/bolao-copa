import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Group } from './group.entity';

@Entity({ name: 'teams' })
@Unique('UQ_teams_name', ['name'])
@Unique('UQ_teams_country_code', ['countryCode'])
export class Team {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_teams',
  })
  id: string;

  @Column()
  name: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'flag_icon_code' })
  flagIconCode: string;

  @ManyToOne(() => Group, group => group.teams, {
    nullable: true, // Um time pode não ter um grupo (ex: em fases eliminatórias)
  })
  @JoinColumn({
    name: 'group_id',
    foreignKeyConstraintName: 'FK_teams_group',
  })
  group: Group;
}
