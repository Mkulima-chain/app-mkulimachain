import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class ImproveBatchesTable1766000004000
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

    // 1. Ajouter colonne name
    if (!(await columnExists('batches', 'name'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'name',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 2. Ajouter colonne description
    if (!(await columnExists('batches', 'description'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne totalQuantity
    if (!(await columnExists('batches', 'totalQuantity'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'totalQuantity',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 4. Ajouter colonne totalWeight
    if (!(await columnExists('batches', 'totalWeight'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'totalWeight',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne unit
    if (!(await columnExists('batches', 'unit'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'unit',
          type: 'varchar',
          length: '20',
          default: "'kg'",
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne productionDate
    if (!(await columnExists('batches', 'productionDate'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'productionDate',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne expirationDate
    if (!(await columnExists('batches', 'expirationDate'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'expirationDate',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne verified
    if (!(await columnExists('batches', 'verified'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 9. Ajouter colonne verifiedAt
    if (!(await columnExists('batches', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne verifiedBy
    if (!(await columnExists('batches', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne quality
    if (!(await columnExists('batches', 'quality'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'quality',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne notes
    if (!(await columnExists('batches', 'notes'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonne photos (jsonb)
    if (!(await columnExists('batches', 'photos'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'photos',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 14. Ajouter colonne originLocation
    if (!(await columnExists('batches', 'originLocation'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'originLocation',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 15. Ajouter colonne destinationLocation
    if (!(await columnExists('batches', 'destinationLocation'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'destinationLocation',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 16. Ajouter colonne certification
    if (!(await columnExists('batches', 'certification'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'certification',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 17. Ajouter colonne estimatedValue
    if (!(await columnExists('batches', 'estimatedValue'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'estimatedValue',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 18. Ajouter colonne cooperativeId
    if (!(await columnExists('batches', 'cooperativeId'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'cooperativeId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 19. Ajouter colonne farmerId
    if (!(await columnExists('batches', 'farmerId'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'farmerId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 20. Ajouter colonne productId
    if (!(await columnExists('batches', 'productId'))) {
      await queryRunner.addColumn(
        'batches',
        new TableColumn({
          name: 'productId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Créer les index
    if (!(await indexExists('batches', 'IDX_batches_name'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_name',
          columnNames: ['name'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_status'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_status',
          columnNames: ['status'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_verified'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_verified',
          columnNames: ['verified'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_productionDate'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_productionDate',
          columnNames: ['productionDate'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_expirationDate'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_expirationDate',
          columnNames: ['expirationDate'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_quality'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_quality',
          columnNames: ['quality'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_cooperativeId'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_cooperativeId',
          columnNames: ['cooperativeId'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_farmerId'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_farmerId',
          columnNames: ['farmerId'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_productId'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_productId',
          columnNames: ['productId'],
        }),
      );
    }

    if (!(await indexExists('batches', 'IDX_batches_createdAt'))) {
      await queryRunner.createIndex(
        'batches',
        new TableIndex({
          name: 'IDX_batches_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }

    // Créer les clés étrangères
    if (!(await columnExists('batches', 'cooperativeId'))) {
      // Déjà ajouté plus haut, mais vérifier la FK
      const fkExists = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_batches_cooperativeId'
        )`,
      );
      if (!fkExists[0].exists) {
        await queryRunner.createForeignKey(
          'batches',
          new TableForeignKey({
            columnNames: ['cooperativeId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'cooperatives',
            onDelete: 'SET NULL',
            name: 'FK_batches_cooperativeId',
          }),
        );
      }
    }

    if (!(await columnExists('batches', 'farmerId'))) {
      const fkExists = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_batches_farmerId'
        )`,
      );
      if (!fkExists[0].exists) {
        await queryRunner.createForeignKey(
          'batches',
          new TableForeignKey({
            columnNames: ['farmerId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'farmers',
            onDelete: 'SET NULL',
            name: 'FK_batches_farmerId',
          }),
        );
      }
    }

    if (!(await columnExists('batches', 'productId'))) {
      const fkExists = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_batches_productId'
        )`,
      );
      if (!fkExists[0].exists) {
        await queryRunner.createForeignKey(
          'batches',
          new TableForeignKey({
            columnNames: ['productId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'products',
            onDelete: 'SET NULL',
            name: 'FK_batches_productId',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les clés étrangères
    const fkCooperative = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_batches_cooperativeId'
      )`,
    );
    if (fkCooperative[0].exists) {
      await queryRunner.dropForeignKey('batches', 'FK_batches_cooperativeId');
    }

    const fkFarmer = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_batches_farmerId'
      )`,
    );
    if (fkFarmer[0].exists) {
      await queryRunner.dropForeignKey('batches', 'FK_batches_farmerId');
    }

    const fkProduct = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_batches_productId'
      )`,
    );
    if (fkProduct[0].exists) {
      await queryRunner.dropForeignKey('batches', 'FK_batches_productId');
    }

    // Supprimer les index
    await queryRunner.dropIndex('batches', 'IDX_batches_name');
    await queryRunner.dropIndex('batches', 'IDX_batches_status');
    await queryRunner.dropIndex('batches', 'IDX_batches_verified');
    await queryRunner.dropIndex('batches', 'IDX_batches_productionDate');
    await queryRunner.dropIndex('batches', 'IDX_batches_expirationDate');
    await queryRunner.dropIndex('batches', 'IDX_batches_quality');
    await queryRunner.dropIndex('batches', 'IDX_batches_cooperativeId');
    await queryRunner.dropIndex('batches', 'IDX_batches_farmerId');
    await queryRunner.dropIndex('batches', 'IDX_batches_productId');
    await queryRunner.dropIndex('batches', 'IDX_batches_createdAt');

    // Supprimer les colonnes
    await queryRunner.dropColumn('batches', 'name');
    await queryRunner.dropColumn('batches', 'description');
    await queryRunner.dropColumn('batches', 'totalQuantity');
    await queryRunner.dropColumn('batches', 'totalWeight');
    await queryRunner.dropColumn('batches', 'unit');
    await queryRunner.dropColumn('batches', 'productionDate');
    await queryRunner.dropColumn('batches', 'expirationDate');
    await queryRunner.dropColumn('batches', 'verified');
    await queryRunner.dropColumn('batches', 'verifiedAt');
    await queryRunner.dropColumn('batches', 'verifiedBy');
    await queryRunner.dropColumn('batches', 'quality');
    await queryRunner.dropColumn('batches', 'notes');
    await queryRunner.dropColumn('batches', 'photos');
    await queryRunner.dropColumn('batches', 'originLocation');
    await queryRunner.dropColumn('batches', 'destinationLocation');
    await queryRunner.dropColumn('batches', 'certification');
    await queryRunner.dropColumn('batches', 'estimatedValue');
    await queryRunner.dropColumn('batches', 'cooperativeId');
    await queryRunner.dropColumn('batches', 'farmerId');
    await queryRunner.dropColumn('batches', 'productId');
  }
}

