import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveProductsTable1766000002000
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

    // 1. Créer l'enum ProductStatus si nécessaire
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "product_status_enum" AS ENUM('active', 'inactive', 'out_of_stock', 'discontinued');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Ajouter colonne status
    if (!(await columnExists('products', 'status'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'status',
          type: 'enum',
          enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
          default: "'active'",
          isNullable: false,
        }),
      );
    }

    // 3. Ajouter colonne verified
    if (!(await columnExists('products', 'verified'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 4. Ajouter colonne verifiedAt
    if (!(await columnExists('products', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne verifiedBy
    if (!(await columnExists('products', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne barcode
    if (!(await columnExists('products', 'barcode'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'barcode',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne weight
    if (!(await columnExists('products', 'weight'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'weight',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne dimensions
    if (!(await columnExists('products', 'dimensions'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'dimensions',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 9. Ajouter colonne expiryDate
    if (!(await columnExists('products', 'expiryDate'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'expiryDate',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne minStockLevel
    if (!(await columnExists('products', 'minStockLevel'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'minStockLevel',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 11. Ajouter colonne maxStockLevel
    if (!(await columnExists('products', 'maxStockLevel'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'maxStockLevel',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne supplier
    if (!(await columnExists('products', 'supplier'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'supplier',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonne notes
    if (!(await columnExists('products', 'notes'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 14. Ajouter colonne rating
    if (!(await columnExists('products', 'rating'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'rating',
          type: 'decimal',
          precision: 3,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 15. Ajouter colonne reviewCount
    if (!(await columnExists('products', 'reviewCount'))) {
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'reviewCount',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // Créer les index pour améliorer les performances
    // Index sur name
    if (!(await indexExists('products', 'IDX_products_name'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_name',
          columnNames: ['name'],
        }),
      );
    }

    // Index sur category
    if (!(await indexExists('products', 'IDX_products_category'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_category',
          columnNames: ['category'],
        }),
      );
    }

    // Index sur isActive
    if (!(await indexExists('products', 'IDX_products_isActive'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_isActive',
          columnNames: ['isActive'],
        }),
      );
    }

    // Index sur status
    if (!(await indexExists('products', 'IDX_products_status'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_status',
          columnNames: ['status'],
        }),
      );
    }

    // Index sur verified
    if (!(await indexExists('products', 'IDX_products_verified'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_verified',
          columnNames: ['verified'],
        }),
      );
    }

    // Index sur price
    if (!(await indexExists('products', 'IDX_products_price'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_price',
          columnNames: ['price'],
        }),
      );
    }

    // Index sur stock
    if (!(await indexExists('products', 'IDX_products_stock'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_stock',
          columnNames: ['stock'],
        }),
      );
    }

    // Index sur originCountry
    if (!(await indexExists('products', 'IDX_products_originCountry'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_originCountry',
          columnNames: ['originCountry'],
        }),
      );
    }

    // Index composite category + isActive
    if (!(await indexExists('products', 'IDX_products_category_isActive'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_category_isActive',
          columnNames: ['category', 'isActive'],
        }),
      );
    }

    // Index sur createdAt
    if (!(await indexExists('products', 'IDX_products_createdAt'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }

    // Index sur barcode (si fourni)
    if (!(await indexExists('products', 'IDX_products_barcode'))) {
      await queryRunner.createIndex(
        'products',
        new TableIndex({
          name: 'IDX_products_barcode',
          columnNames: ['barcode'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('products', 'IDX_products_barcode');
    await queryRunner.dropIndex('products', 'IDX_products_createdAt');
    await queryRunner.dropIndex('products', 'IDX_products_category_isActive');
    await queryRunner.dropIndex('products', 'IDX_products_originCountry');
    await queryRunner.dropIndex('products', 'IDX_products_stock');
    await queryRunner.dropIndex('products', 'IDX_products_price');
    await queryRunner.dropIndex('products', 'IDX_products_verified');
    await queryRunner.dropIndex('products', 'IDX_products_status');
    await queryRunner.dropIndex('products', 'IDX_products_isActive');
    await queryRunner.dropIndex('products', 'IDX_products_category');
    await queryRunner.dropIndex('products', 'IDX_products_name');

    // Supprimer les colonnes
    await queryRunner.dropColumn('products', 'reviewCount');
    await queryRunner.dropColumn('products', 'rating');
    await queryRunner.dropColumn('products', 'notes');
    await queryRunner.dropColumn('products', 'supplier');
    await queryRunner.dropColumn('products', 'maxStockLevel');
    await queryRunner.dropColumn('products', 'minStockLevel');
    await queryRunner.dropColumn('products', 'expiryDate');
    await queryRunner.dropColumn('products', 'dimensions');
    await queryRunner.dropColumn('products', 'weight');
    await queryRunner.dropColumn('products', 'barcode');
    await queryRunner.dropColumn('products', 'verifiedBy');
    await queryRunner.dropColumn('products', 'verifiedAt');
    await queryRunner.dropColumn('products', 'verified');
    await queryRunner.dropColumn('products', 'status');

    // Supprimer l'enum
    await queryRunner.query(`DROP TYPE IF EXISTS "product_status_enum"`);
  }
}

