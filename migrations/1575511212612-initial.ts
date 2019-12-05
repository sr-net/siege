import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1575511212612 implements MigrationInterface {
    name = 'initial1575511212612'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "srnet"."like" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionUuid" uuid NOT NULL, "stratUuid" uuid NOT NULL, "active" boolean NOT NULL, CONSTRAINT "PK_53320cc0348bffc465e072ce3ef" PRIMARY KEY ("uuid"))`, undefined);
        await queryRunner.query(`CREATE TABLE "srnet"."report" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionUuid" uuid NOT NULL, "stratUuid" uuid NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_066509d7e36c8d03cb31a1dd894" PRIMARY KEY ("uuid"))`, undefined);
        await queryRunner.query(`CREATE TYPE "srnet"."strat_authortype_enum" AS ENUM('NAME', 'YOUTUBE', 'TWITCH', 'REDDIT')`, undefined);
        await queryRunner.query(`CREATE TABLE "srnet"."strat" ("uuid" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "shortId" integer NOT NULL, "title" character varying(40) NOT NULL, "description" character varying(450) NOT NULL, "atk" boolean NOT NULL, "def" boolean NOT NULL, "gamemodes" text NOT NULL, "score" integer NOT NULL, "submission" boolean NOT NULL, "acceptedAt" TIMESTAMP, "authorType" "srnet"."strat_authortype_enum" NOT NULL, "authorName" character varying NOT NULL, "authorUrl" character varying, CONSTRAINT "UQ_228b258487cd2ff859e7d985c84" UNIQUE ("shortId"), CONSTRAINT "PK_0a3539052ae93092eadcfdb9f3e" PRIMARY KEY ("uuid"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_228b258487cd2ff859e7d985c8" ON "srnet"."strat" ("shortId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_0211f792e57d6bda24d2490bb8" ON "srnet"."strat" ("title") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_a6fe70ae97095abce5cd4fb2b1" ON "srnet"."strat" ("authorName") `, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP INDEX "srnet"."IDX_a6fe70ae97095abce5cd4fb2b1"`, undefined);
        await queryRunner.query(`DROP INDEX "srnet"."IDX_0211f792e57d6bda24d2490bb8"`, undefined);
        await queryRunner.query(`DROP INDEX "srnet"."IDX_228b258487cd2ff859e7d985c8"`, undefined);
        await queryRunner.query(`DROP TABLE "srnet"."strat"`, undefined);
        await queryRunner.query(`DROP TYPE "srnet"."strat_authortype_enum"`, undefined);
        await queryRunner.query(`DROP TABLE "srnet"."report"`, undefined);
        await queryRunner.query(`DROP TABLE "srnet"."like"`, undefined);
    }

}
