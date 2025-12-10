import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddAuthProviderFields1764699636745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if column exists
    const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name = $1 AND column_name = $2`,
        [tableName, columnName],
      );
      return result.length > 0;
    };

    // Helper function to check if enum type exists
    const enumExists = async (typeName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT typname FROM pg_type WHERE typname = $1`,
        [typeName],
      );
      return result.length > 0;
    };

    // Helper function to check if index exists
    const indexExists = async (tableName: string, indexName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT indexname FROM pg_indexes WHERE tablename = $1 AND indexname = $2`,
        [tableName, indexName],
      );
      return result.length > 0;
    };

    // Create enum type for auth provider if it doesn't exist
    const authProviderEnumExists = await enumExists('auth_provider_enum');
    if (!authProviderEnumExists) {
      await queryRunner.query(
        `CREATE TYPE "auth_provider_enum" AS ENUM ('email', 'google', 'wallet')`,
      );
    }

    // Add authProvider column if it doesn't exist
    if (!(await columnExists('users', 'authProvider'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'authProvider',
          type: 'auth_provider_enum',
          default: "'email'",
        }),
      );
    }

    // Add googleId column if it doesn't exist
    if (!(await columnExists('users', 'googleId'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'googleId',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // Add walletAddress column if it doesn't exist
    if (!(await columnExists('users', 'walletAddress'))) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'walletAddress',
          type: 'varchar',
          length: '150',
          isNullable: true,
        }),
      );
    }

    // Make password nullable (check if it's already nullable)
    const passwordColumn = await queryRunner.query(
      `SELECT is_nullable
       FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'password'`,
    );
    if (passwordColumn.length > 0 && passwordColumn[0].is_nullable === 'NO') {
      await queryRunner.query(
        `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
      );
    }

    // Create indexes if they don't exist
    if (!(await indexExists('users', 'IDX_users_authProvider'))) {
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_authProvider',
          columnNames: ['authProvider'],
        }),
      );
    }

    if (!(await indexExists('users', 'IDX_users_googleId'))) {
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_googleId',
          columnNames: ['googleId'],
          isUnique: true,
        }),
      );
    }

    if (!(await indexExists('users', 'IDX_users_walletAddress'))) {
      await queryRunner.createIndex(
        'users',
        new TableIndex({
          name: 'IDX_users_walletAddress',
          columnNames: ['walletAddress'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_walletAddress');
    await queryRunner.dropIndex('users', 'IDX_users_googleId');
    await queryRunner.dropIndex('users', 'IDX_users_authProvider');
    await queryRunner.dropColumn('users', 'walletAddress');
    await queryRunner.dropColumn('users', 'googleId');
    await queryRunner.dropColumn('users', 'authProvider');
    await queryRunner.query(`DROP TYPE "auth_provider_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
  }
}
