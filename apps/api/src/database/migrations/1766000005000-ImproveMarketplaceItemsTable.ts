import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveMarketplaceItemsTable1766000005000
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

    // 1. Ajouter colonne sku
    if (!(await columnExists('marketplace_items', 'sku'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'sku',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 2. Ajouter colonne category
    if (!(await columnExists('marketplace_items', 'category'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'category',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne tags (array)
    if (!(await columnExists('marketplace_items', 'tags'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'tags',
          type: 'text',
          isArray: true,
          isNullable: true,
        }),
      );
    }

    // 4. Remplacer imageUrl par photos (jsonb)
    if (await columnExists('marketplace_items', 'imageUrl')) {
      // Créer la colonne photos si elle n'existe pas
      if (!(await columnExists('marketplace_items', 'photos'))) {
        await queryRunner.addColumn(
          'marketplace_items',
          new TableColumn({
            name: 'photos',
            type: 'jsonb',
            isNullable: true,
          }),
        );
      }
      // Migrer les données de imageUrl vers photos
      await queryRunner.query(`
        UPDATE marketplace_items
        SET photos = CASE
          WHEN "imageUrl" IS NOT NULL AND "imageUrl" != '' THEN
            jsonb_build_array("imageUrl")
          ELSE NULL
        END
        WHERE photos IS NULL
      `);
    } else if (!(await columnExists('marketplace_items', 'photos'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'photos',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne minOrderKg
    if (!(await columnExists('marketplace_items', 'minOrderKg'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'minOrderKg',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne maxOrderKg
    if (!(await columnExists('marketplace_items', 'maxOrderKg'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'maxOrderKg',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne shippingCostADA
    if (!(await columnExists('marketplace_items', 'shippingCostADA'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'shippingCostADA',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne location
    if (!(await columnExists('marketplace_items', 'location'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'location',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 9. Ajouter colonne certifications (array)
    if (!(await columnExists('marketplace_items', 'certifications'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'certifications',
          type: 'text',
          isArray: true,
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne rating
    if (!(await columnExists('marketplace_items', 'rating'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'rating',
          type: 'decimal',
          precision: 3,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne reviewCount
    if (!(await columnExists('marketplace_items', 'reviewCount'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'reviewCount',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 12. Ajouter colonne views
    if (!(await columnExists('marketplace_items', 'views'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'views',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 13. Ajouter colonne salesCount
    if (!(await columnExists('marketplace_items', 'salesCount'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'salesCount',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 14. Ajouter colonne notes
    if (!(await columnExists('marketplace_items', 'notes'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 15. Ajouter colonne featured
    if (!(await columnExists('marketplace_items', 'featured'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'featured',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 16. Ajouter colonne expiresAt
    if (!(await columnExists('marketplace_items', 'expiresAt'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'expiresAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 17. Ajouter colonne cooperativeId
    if (!(await columnExists('marketplace_items', 'cooperativeId'))) {
      await queryRunner.addColumn(
        'marketplace_items',
        new TableColumn({
          name: 'cooperativeId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Ajouter les index
    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_sku'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_sku',
          columnNames: ['sku'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_category'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_category',
          columnNames: ['category'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_status'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_status',
          columnNames: ['status'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_featured'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_featured',
          columnNames: ['featured'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_cooperativeId'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_cooperativeId',
          columnNames: ['cooperativeId'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_priceADA'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_priceADA',
          columnNames: ['priceADA'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_rating'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_rating',
          columnNames: ['rating'],
        }),
      );
    }

    if (!(await indexExists('marketplace_items', 'IDX_marketplace_items_createdAt'))) {
      await queryRunner.createIndex(
        'marketplace_items',
        new TableIndex({
          name: 'IDX_marketplace_items_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_createdAt');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_rating');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_priceADA');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_cooperativeId');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_featured');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_status');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_category');
    await queryRunner.dropIndex('marketplace_items', 'IDX_marketplace_items_sku');

    // Supprimer les colonnes
    await queryRunner.dropColumn('marketplace_items', 'cooperativeId');
    await queryRunner.dropColumn('marketplace_items', 'expiresAt');
    await queryRunner.dropColumn('marketplace_items', 'featured');
    await queryRunner.dropColumn('marketplace_items', 'notes');
    await queryRunner.dropColumn('marketplace_items', 'salesCount');
    await queryRunner.dropColumn('marketplace_items', 'views');
    await queryRunner.dropColumn('marketplace_items', 'reviewCount');
    await queryRunner.dropColumn('marketplace_items', 'rating');
    await queryRunner.dropColumn('marketplace_items', 'certifications');
    await queryRunner.dropColumn('marketplace_items', 'location');
    await queryRunner.dropColumn('marketplace_items', 'shippingCostADA');
    await queryRunner.dropColumn('marketplace_items', 'maxOrderKg');
    await queryRunner.dropColumn('marketplace_items', 'minOrderKg');
    await queryRunner.dropColumn('marketplace_items', 'photos');
    await queryRunner.dropColumn('marketplace_items', 'tags');
    await queryRunner.dropColumn('marketplace_items', 'category');
    await queryRunner.dropColumn('marketplace_items', 'sku');
  }
}

