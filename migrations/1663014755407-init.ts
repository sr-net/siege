import { MigrationInterface, QueryRunner } from "typeorm"

export class init1663014755407 implements MigrationInterface {
  name = "init1663014755407"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "like"
                             (
                               "uuid"        uuid      NOT NULL,
                               "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
                               "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
                               "sessionUuid" uuid      NOT NULL,
                               "stratUuid"   uuid      NOT NULL,
                               "active"      boolean   NOT NULL,
                               CONSTRAINT "PK_c1a1e520ac18623d315617beac7" PRIMARY KEY ("uuid")
                             )`)
    await queryRunner.query(`CREATE TABLE "report"
                             (
                               "uuid"        uuid              NOT NULL,
                               "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                               "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
                               "sessionUuid" uuid              NOT NULL,
                               "stratUuid"   uuid              NOT NULL,
                               "message"     character varying NOT NULL,
                               CONSTRAINT "PK_6d75f0b67c2116a6f2009308498" PRIMARY KEY ("uuid")
                             )`)
    await queryRunner.query(
      `CREATE TYPE "public"."strat_authortype_enum" AS ENUM('NAME', 'YOUTUBE', 'TWITCH', 'REDDIT')`,
    )
    await queryRunner.query(`CREATE TABLE "strat"
                             (
                               "uuid"        uuid                             NOT NULL,
                               "createdAt"   TIMESTAMP                        NOT NULL DEFAULT now(),
                               "updatedAt"   TIMESTAMP                        NOT NULL DEFAULT now(),
                               "shortId"     integer                          NOT NULL,
                               "title"       character varying(40)            NOT NULL,
                               "description" character varying(450)           NOT NULL,
                               "atk"         boolean                          NOT NULL,
                               "def"         boolean                          NOT NULL,
                               "gamemodes"   text                             NOT NULL,
                               "score"       integer                          NOT NULL,
                               "submission"  boolean                          NOT NULL,
                               "acceptedAt"  TIMESTAMP,
                               "authorType"  "public"."strat_authortype_enum" NOT NULL,
                               "authorName"  character varying                NOT NULL,
                               "authorUrl"   character varying,
                               CONSTRAINT "UQ_b790a7989c2d012d4ddd0139fe9" UNIQUE ("shortId"),
                               CONSTRAINT "PK_81f064a9b3b94478c8e2cb077f6" PRIMARY KEY ("uuid")
                             )`)
    await queryRunner.query(
      `CREATE INDEX "IDX_b790a7989c2d012d4ddd0139fe" ON "strat" ("shortId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_127e20f75c623ff8b2145fa28e" ON "strat" ("title") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e7ccc842b41f7d5078f10c0970" ON "strat" ("authorName") `,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_e7ccc842b41f7d5078f10c0970"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_127e20f75c623ff8b2145fa28e"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_b790a7989c2d012d4ddd0139fe"`)
    await queryRunner.query(`DROP TABLE "strat"`)
    await queryRunner.query(`DROP TYPE "public"."strat_authortype_enum"`)
    await queryRunner.query(`DROP TABLE "report"`)
    await queryRunner.query(`DROP TABLE "like"`)
  }
}
