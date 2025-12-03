import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddAuthProviderFields1764699636745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for auth provider
    await queryRunner.query(
      `CREATE TYPE "auth_provider_enum" AS ENUM ('email', 'google', 'wallet')`,
    );

    // Add new columns
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'authProvider',
        type: 'auth_provider_enum',
        default: "'email'",
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'googleId',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'walletAddress',
        type: 'varchar',
        length: '150',
        isNullable: true,
      }),
    );

    // Make password nullable
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
    );

    // Create indexes
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_authProvider',
        columnNames: ['authProvider'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_googleId',
        columnNames: ['googleId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_walletAddress',
        columnNames: ['walletAddress'],
        isUnique: true,
      }),
    );
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
