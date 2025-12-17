import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixWalletAddressNullable1765400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne existe et si elle est nullable
    const columnInfo = await queryRunner.query(
      `SELECT is_nullable, character_maximum_length
       FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'walletAddress'`,
    );

    if (columnInfo.length > 0) {
      const isNullable = columnInfo[0].is_nullable === 'YES';
      const maxLength = columnInfo[0].character_maximum_length;

      // Si la colonne n'est pas nullable, la rendre nullable
      if (!isNullable) {
        await queryRunner.query(
          `ALTER TABLE "users" ALTER COLUMN "walletAddress" DROP NOT NULL`,
        );
      }

      // S'assurer que la longueur est correcte (150)
      if (maxLength !== '150') {
        await queryRunner.query(
          `ALTER TABLE "users" ALTER COLUMN "walletAddress" TYPE VARCHAR(150)`,
        );
      }
    } else {
      // Si la colonne n'existe pas, la créer
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

    // Vérifier si l'index unique existe
    const indexExists = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexname = 'IDX_users_walletAddress'`,
    );

    // Si l'index n'existe pas, le créer
    // PostgreSQL permet naturellement plusieurs NULL dans un index UNIQUE
    if (indexExists.length === 0) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_users_walletAddress" ON "users" ("walletAddress")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cette migration ne fait que s'assurer que la colonne est nullable
    // Pas besoin de rollback spécifique
  }
}
