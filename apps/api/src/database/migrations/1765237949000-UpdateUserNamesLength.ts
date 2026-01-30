import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserNamesLength1765237949000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mettre à jour les valeurs NULL pour firstName
    await queryRunner.query(
      `UPDATE "users" SET "firstName" = 'User' WHERE "firstName" IS NULL`,
    );

    // Mettre à jour les valeurs NULL pour lastName
    await queryRunner.query(
      `UPDATE "users" SET "lastName" = 'Name' WHERE "lastName" IS NULL`,
    );

    // Modifier firstName de varchar(100) à varchar(255)
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "firstName" TYPE varchar(255) USING "firstName"::varchar(255)`,
    );

    // Modifier lastName de varchar(100) à varchar(255)
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastName" TYPE varchar(255) USING "lastName"::varchar(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revenir à varchar(100) pour firstName
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "firstName" TYPE varchar(100) USING "firstName"::varchar(100)`,
    );

    // Revenir à varchar(100) pour lastName
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastName" TYPE varchar(100) USING "lastName"::varchar(100)`,
    );
  }
}
