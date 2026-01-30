import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAllUserFieldsOptional1765400000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if column exists
    const columnExists = async (
      tableName: string,
      columnName: string,
    ): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name = $1 AND column_name = $2`,
        [tableName, columnName],
      );
      return result.length > 0;
    };

    // Rendre phone nullable
    if (await columnExists('users', 'phone')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`,
      );
    }

    // Rendre password nullable
    if (await columnExists('users', 'password')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
      );
    }

    // Rendre googleId nullable
    if (await columnExists('users', 'googleId')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "googleId" DROP NOT NULL`,
      );
    }

    // Rendre walletAddress nullable
    if (await columnExists('users', 'walletAddress')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "walletAddress" DROP NOT NULL`,
      );
    }

    // Rendre lastLogin nullable
    if (await columnExists('users', 'lastLogin')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "lastLogin" DROP NOT NULL`,
      );
    }

    // Rendre refreshToken nullable
    if (await columnExists('users', 'refreshToken')) {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "refreshToken" DROP NOT NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Mettre à jour les valeurs NULL avec des valeurs par défaut avant de rendre NOT NULL
    await queryRunner.query(
      `UPDATE "users" SET "phone" = '' WHERE "phone" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "password" = '' WHERE "password" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "googleId" = '' WHERE "googleId" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "walletAddress" = '' WHERE "walletAddress" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "lastLogin" = CURRENT_TIMESTAMP WHERE "lastLogin" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "refreshToken" = '' WHERE "refreshToken" IS NULL`,
    );

    // Rendre les colonnes NOT NULL
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "googleId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "walletAddress" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastLogin" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "refreshToken" SET NOT NULL`,
    );
  }
}
