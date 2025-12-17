import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveNullableConstraints1765400000001
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

    // Mettre à jour phone: rendre NOT NULL et longueur 255
    if (await columnExists('users', 'phone')) {
      // Mettre à jour les valeurs NULL avec une valeur par défaut
      await queryRunner.query(
        `UPDATE "users" SET "phone" = '' WHERE "phone" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "phone" TYPE VARCHAR(255)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`,
      );
    }

    // Mettre à jour password: rendre NOT NULL et longueur 255
    if (await columnExists('users', 'password')) {
      // Mettre à jour les valeurs NULL avec une valeur par défaut
      await queryRunner.query(
        `UPDATE "users" SET "password" = '' WHERE "password" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "password" TYPE VARCHAR(255)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
      );
    }

    // Mettre à jour googleId: rendre NOT NULL et longueur 255
    if (await columnExists('users', 'googleId')) {
      // Mettre à jour les valeurs NULL avec une valeur par défaut
      await queryRunner.query(
        `UPDATE "users" SET "googleId" = '' WHERE "googleId" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "googleId" TYPE VARCHAR(255)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "googleId" SET NOT NULL`,
      );
    }

    // Mettre à jour walletAddress: rendre NOT NULL et longueur 255
    if (await columnExists('users', 'walletAddress')) {
      // Mettre à jour les valeurs NULL avec une valeur par défaut
      await queryRunner.query(
        `UPDATE "users" SET "walletAddress" = '' WHERE "walletAddress" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "walletAddress" TYPE VARCHAR(255)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "walletAddress" SET NOT NULL`,
      );
    }

    // Mettre à jour lastLogin: rendre NOT NULL
    if (await columnExists('users', 'lastLogin')) {
      // Mettre à jour les valeurs NULL avec la date actuelle
      await queryRunner.query(
        `UPDATE "users" SET "lastLogin" = CURRENT_TIMESTAMP WHERE "lastLogin" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "lastLogin" SET NOT NULL`,
      );
    }

    // Mettre à jour refreshToken: rendre NOT NULL et longueur 255 (changer de text à varchar)
    if (await columnExists('users', 'refreshToken')) {
      // Mettre à jour les valeurs NULL avec une valeur par défaut
      await queryRunner.query(
        `UPDATE "users" SET "refreshToken" = '' WHERE "refreshToken" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "refreshToken" TYPE VARCHAR(255)`,
      );
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "refreshToken" SET NOT NULL`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rendre les colonnes nullable à nouveau
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "googleId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "walletAddress" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "lastLogin" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "refreshToken" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "refreshToken" TYPE TEXT`,
    );
  }
}
