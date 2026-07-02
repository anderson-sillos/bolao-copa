import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1716312000000 implements MigrationInterface {
  name = 'InitialSetup1716312000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_groups_name" UNIQUE ("name"),
        CONSTRAINT "PK_groups" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "country_code" character varying(3) NOT NULL,
        "flag_icon_code" character varying NOT NULL,
        "group_id" uuid,
        CONSTRAINT "UQ_teams_name" UNIQUE ("name"),
        CONSTRAINT "UQ_teams_country_code" UNIQUE ("country_code"),
        CONSTRAINT "PK_teams" PRIMARY KEY ("id"),
        CONSTRAINT "FK_teams_group"
          FOREIGN KEY ("group_id") REFERENCES "groups"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "games" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "team_a_id" uuid,
        "team_b_id" uuid,
        "game_time" TIMESTAMP NOT NULL,
        "phase" character varying NOT NULL,
        "score_a" integer,
        "score_b" integer,
        "penalty_score_a" integer,
        "penalty_score_b" integer,
        "match_number" integer,
        "bracket_order" integer,
        "team_a_source" character varying,
        "team_b_source" character varying,
        CONSTRAINT "PK_games" PRIMARY KEY ("id"),
        CONSTRAINT "FK_games_team_a"
          FOREIGN KEY ("team_a_id") REFERENCES "teams"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_games_team_b"
          FOREIGN KEY ("team_b_id") REFERENCES "teams"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "bets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "game_id" uuid NOT NULL,
        "score_a" integer NOT NULL,
        "score_b" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_bets_user_game" UNIQUE ("user_id", "game_id"),
        CONSTRAINT "PK_bets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bets_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_bets_game"
          FOREIGN KEY ("game_id") REFERENCES "games"("id")
          ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bets"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "groups"`);
  }
}
