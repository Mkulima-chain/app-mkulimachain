import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class ImproveHarvestsTable1766000003000
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

    // Helper function to check if index exists
    const indexExists = async (
      tableName: string,
      indexName: string,
    ): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE tablename = $1 AND indexname = $2
        )`,
        [tableName, indexName],
      );
      return result[0].exists;
    };

    // 1. Créer l'enum HarvestStatus si nécessaire
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "harvest_status_enum" AS ENUM('pending', 'verified', 'rejected', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Ajouter colonne status
    if (!(await columnExists('harvests', 'status'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['pending', 'verified', 'rejected', 'completed'],
          default: "'pending'",
          isNullable: false,
        }),
      );
    }

    // 3. Ajouter colonne verified
    if (!(await columnExists('harvests', 'verified'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 4. Ajouter colonne verifiedAt
    if (!(await columnExists('harvests', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne verifiedBy
    if (!(await columnExists('harvests', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne unit
    if (!(await columnExists('harvests', 'unit'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'unit',
          type: 'varchar',
          length: '20',
          default: "'kg'",
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne quality
    if (!(await columnExists('harvests', 'quality'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'quality',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne notes
    if (!(await columnExists('harvests', 'notes'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 9. Ajouter colonne photos (jsonb pour array de text)
    if (!(await columnExists('harvests', 'photos'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'photos',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne weatherConditions
    if (!(await columnExists('harvests', 'weatherConditions'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'weatherConditions',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne harvestMethod
    if (!(await columnExists('harvests', 'harvestMethod'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'harvestMethod',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne storageLocation
    if (!(await columnExists('harvests', 'storageLocation'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'storageLocation',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonne batchNumber
    if (!(await columnExists('harvests', 'batchNumber'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'batchNumber',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 14. Ajouter colonne certification
    if (!(await columnExists('harvests', 'certification'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'certification',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 15. Ajouter colonne estimatedValue
    if (!(await columnExists('harvests', 'estimatedValue'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'estimatedValue',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 16. Ajouter colonne cooperativeId
    if (!(await columnExists('harvests', 'cooperativeId'))) {
      await queryRunner.addColumn(
        'harvests',
        new TableColumn({
          name: 'cooperativeId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Créer les index pour améliorer les performances
    // Index sur farmerId
    if (!(await indexExists('harvests', 'IDX_harvests_farmerId'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_farmerId',
          columnNames: ['farmerId'],
        }),
      );
    }

    // Index sur productId
    if (!(await indexExists('harvests', 'IDX_harvests_productId'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_productId',
          columnNames: ['productId'],
        }),
      );
    }

    // Index sur status
    if (!(await indexExists('harvests', 'IDX_harvests_status'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_status',
          columnNames: ['status'],
        }),
      );
    }

    // Index sur verified
    if (!(await indexExists('harvests', 'IDX_harvests_verified'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_verified',
          columnNames: ['verified'],
        }),
      );
    }

    // Index sur harvestAt
    if (!(await indexExists('harvests', 'IDX_harvests_harvestAt'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_harvestAt',
          columnNames: ['harvestAt'],
        }),
      );
    }

    // Index sur quality
    if (!(await indexExists('harvests', 'IDX_harvests_quality'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_quality',
          columnNames: ['quality'],
        }),
      );
    }

    // Index sur batchNumber
    if (!(await indexExists('harvests', 'IDX_harvests_batchNumber'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_batchNumber',
          columnNames: ['batchNumber'],
        }),
      );
    }

    // Index sur cooperativeId
    if (!(await indexExists('harvests', 'IDX_harvests_cooperativeId'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_cooperativeId',
          columnNames: ['cooperativeId'],
        }),
      );
    }

    // Index sur createdAt
    if (!(await indexExists('harvests', 'IDX_harvests_createdAt'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }

    // Index composite farmerId + productId
    if (!(await indexExists('harvests', 'IDX_harvests_farmerId_productId'))) {
      await queryRunner.createIndex(
        'harvests',
        new TableIndex({
          name: 'IDX_harvests_farmerId_productId',
          columnNames: ['farmerId', 'productId'],
        }),
      );
    }

    // Ajouter la clé étrangère pour cooperativeId si la table cooperatives existe
    const cooperativesTableExists = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'cooperatives'
      )`,
    );

    if (cooperativesTableExists[0].exists) {
      const fkExists = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_harvests_cooperativeId'
        )`,
      );

      if (!fkExists[0].exists) {
        await queryRunner.createForeignKey(
          'harvests',
          new TableForeignKey({
            name: 'FK_harvests_cooperativeId',
            columnNames: ['cooperativeId'],
            referencedTableName: 'cooperatives',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('harvests', 'IDX_harvests_farmerId_productId');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_createdAt');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_cooperativeId');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_batchNumber');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_quality');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_harvestAt');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_verified');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_status');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_productId');
    await queryRunner.dropIndex('harvests', 'IDX_harvests_farmerId');

    // Supprimer la clé étrangère
    try {
      await queryRunner.dropForeignKey('harvests', 'FK_harvests_cooperativeId');
    } catch (error) {
      // Ignorer si la FK n'existe pas
    }

    // Supprimer les colonnes
    await queryRunner.dropColumn('harvests', 'cooperativeId');
    await queryRunner.dropColumn('harvests', 'estimatedValue');
    await queryRunner.dropColumn('harvests', 'certification');
    await queryRunner.dropColumn('harvests', 'batchNumber');
    await queryRunner.dropColumn('harvests', 'storageLocation');
    await queryRunner.dropColumn('harvests', 'harvestMethod');
    await queryRunner.dropColumn('harvests', 'weatherConditions');
    await queryRunner.dropColumn('harvests', 'photos');
    await queryRunner.dropColumn('harvests', 'notes');
    await queryRunner.dropColumn('harvests', 'quality');
    await queryRunner.dropColumn('harvests', 'unit');
    await queryRunner.dropColumn('harvests', 'verifiedBy');
    await queryRunner.dropColumn('harvests', 'verifiedAt');
    await queryRunner.dropColumn('harvests', 'verified');
    await queryRunner.dropColumn('harvests', 'status');

    // Supprimer l'enum
    await queryRunner.query(`DROP TYPE IF EXISTS "harvest_status_enum"`);
  }
}

