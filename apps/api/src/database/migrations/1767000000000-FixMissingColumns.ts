import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class FixMissingColumns1767000000000 implements MigrationInterface {
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

    // Ajouter dateOfBirth à farmers si elle n'existe pas
    if (!(await columnExists('farmers', 'dateOfBirth'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'dateOfBirth',
          type: 'date',
          isNullable: true,
        }),
      );
      console.log('Colonne dateOfBirth ajoutée à la table farmers');
    }

    // Créer l'enum cooperative_status_enum si nécessaire
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "cooperative_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Ajouter status à cooperatives si elle n'existe pas
    if (!(await columnExists('cooperatives', 'status'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'status',
          type: 'cooperative_status_enum',
          default: "'active'",
        }),
      );
      console.log('Colonne status ajoutée à la table cooperatives');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes si elles existent
    try {
      await queryRunner.dropColumn('cooperatives', 'status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'dateOfBirth');
    } catch (e) {
      // Ignore if doesn't exist
    }
  }
}

