import { MigrationInterface, QueryRunner } from "typeorm"

export class initial1575560655099 implements MigrationInterface {
  name = "initial1575560655099"

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "public"."like" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionUuid" uuid NOT NULL, "stratUuid" uuid NOT NULL, "active" boolean NOT NULL, CONSTRAINT "PK_760106e3ff6467d533adf7d745b" PRIMARY KEY ("uuid"))`,
      undefined,
    )
    await queryRunner.query(
      `CREATE TABLE "public"."report" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionUuid" uuid NOT NULL, "stratUuid" uuid NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_c623f166c83750b6766affc86f5" PRIMARY KEY ("uuid"))`,
      undefined,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."strat_authortype_enum" AS ENUM('NAME', 'YOUTUBE', 'TWITCH', 'REDDIT')`,
      undefined,
    )
    await queryRunner.query(
      `CREATE TABLE "public"."strat" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "shortId" integer NOT NULL, "title" character varying(40) NOT NULL, "description" character varying(450) NOT NULL, "atk" boolean NOT NULL, "def" boolean NOT NULL, "gamemodes" text NOT NULL, "score" integer NOT NULL, "submission" boolean NOT NULL, "acceptedAt" TIMESTAMP, "authorType" "public"."strat_authortype_enum" NOT NULL, "authorName" character varying NOT NULL, "authorUrl" character varying, CONSTRAINT "UQ_eded6845db72df38f9198f6cd0b" UNIQUE ("shortId"), CONSTRAINT "PK_e71c39be441855ce1eee0bb4615" PRIMARY KEY ("uuid"))`,
      undefined,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_eded6845db72df38f9198f6cd0" ON "public"."strat" ("shortId") `,
      undefined,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_73b77b2019b6ed7829667e9656" ON "public"."strat" ("title") `,
      undefined,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_4bd1c5d9ba09cb03336e64aed4" ON "public"."strat" ("authorName") `,
      undefined,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4bd1c5d9ba09cb03336e64aed4"`,
      undefined,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73b77b2019b6ed7829667e9656"`,
      undefined,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eded6845db72df38f9198f6cd0"`,
      undefined,
    )
    await queryRunner.query(`DROP TABLE "public"."strat"`, undefined)
    await queryRunner.query(`DROP TYPE "public"."strat_authortype_enum"`, undefined)
    await queryRunner.query(`DROP TABLE "public"."report"`, undefined)
    await queryRunner.query(`DROP TABLE "public"."like"`, undefined)
  }
}
