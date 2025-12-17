import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class UpdateProductsTable1765288960925 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Modifier la colonne description pour la rendre nullable et plus longue
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "description" TYPE varchar(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL`,
    );

    // Ajouter la colonne SKU (nullable d'abord)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'sku',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Ajouter la colonne category (nullable d'abord)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'category',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Ajouter la colonne price avec valeur par défaut
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'price',
        type: 'decimal',
        precision: 12,
        scale: 2,
        isNullable: false,
        default: 0,
      }),
    );

    // Ajouter la colonne currency avec valeur par défaut
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'currency',
        type: 'varchar',
        length: '3',
        isNullable: false,
        default: "'USD'",
      }),
    );

    // Ajouter la colonne stock avec valeur par défaut
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'stock',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    );

    // Ajouter la colonne originCountry (nullable)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'originCountry',
        type: 'varchar',
        length: '80',
        isNullable: true,
      }),
    );

    // Ajouter la colonne isActive avec valeur par défaut
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        isNullable: false,
        default: true,
      }),
    );

    // Ajouter la colonne tags (jsonb, nullable)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'tags',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Mettre à jour les produits existants avec des valeurs par défaut
    // Générer un SKU unique pour chaque produit existant en utilisant une CTE
    await queryRunner.query(`
      WITH numbered_products AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
        FROM "products"
        WHERE "sku" IS NULL
      )
      UPDATE "products" p
      SET 
        "sku" = 'PROD-' || LPAD(np.row_num::text, 6, '0'),
        "category" = COALESCE(p."category", 'agriculture')
      FROM numbered_products np
      WHERE p.id = np.id
    `);

    // Rendre SKU et category NOT NULL après avoir rempli les valeurs
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category" SET NOT NULL`,
    );

    // Créer un index unique sur SKU
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_sku',
        columnNames: ['sku'],
        isUnique: true,
      }),
    );

    // Créer un index sur category
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_category',
        columnNames: ['category'],
      }),
    );

    // Créer un index sur isActive
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_isActive',
        columnNames: ['isActive'],
      }),
    );

    // Créer un index sur originCountry
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_products_originCountry',
        columnNames: ['originCountry'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('products', 'IDX_products_originCountry');
    await queryRunner.dropIndex('products', 'IDX_products_isActive');
    await queryRunner.dropIndex('products', 'IDX_products_category');
    await queryRunner.dropIndex('products', 'IDX_products_sku');

    // Supprimer les colonnes ajoutées
    await queryRunner.dropColumn('products', 'tags');
    await queryRunner.dropColumn('products', 'isActive');
    await queryRunner.dropColumn('products', 'originCountry');
    await queryRunner.dropColumn('products', 'stock');
    await queryRunner.dropColumn('products', 'currency');
    await queryRunner.dropColumn('products', 'price');
    await queryRunner.dropColumn('products', 'category');
    await queryRunner.dropColumn('products', 'sku');

    // Restaurer la colonne description
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "description" TYPE varchar(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "description" SET NOT NULL`,
    );
  }
}
