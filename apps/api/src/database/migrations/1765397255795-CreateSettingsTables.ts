import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSettingsTables1765397255795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if table exists
    const tableExists = async (tableName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT table_name
         FROM information_schema.tables
         WHERE table_name = $1`,
        [tableName],
      );
      return result.length > 0;
    };

    // Create categories table
    if (!(await tableExists('categories'))) {
      await queryRunner.createTable(
        new Table({
          name: 'categories',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '100',
              isUnique: true,
            },
            {
              name: 'description',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deletedAt',
              type: 'timestamp',
              isNullable: true,
            },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'categories',
        new TableIndex({
          name: 'IDX_categories_name',
          columnNames: ['name'],
          isUnique: true,
        }),
      );

      await queryRunner.createIndex(
        'categories',
        new TableIndex({
          name: 'IDX_categories_isActive',
          columnNames: ['isActive'],
        }),
      );

      // Insert default categories
      await queryRunner.query(`
        INSERT INTO "categories" ("name", "description", "isActive") VALUES
        ('Cacao', 'Produits de cacao', true),
        ('Café', 'Produits de café', true),
        ('Riz', 'Produits de riz', true),
        ('Maïs', 'Produits de maïs', true),
        ('Manioc', 'Produits de manioc', true)
      `);
    }

    // Create units table
    if (!(await tableExists('units'))) {
      await queryRunner.createTable(
        new Table({
          name: 'units',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '50',
              isUnique: true,
            },
            {
              name: 'symbol',
              type: 'varchar',
              length: '10',
            },
            {
              name: 'description',
              type: 'varchar',
              length: '500',
              isNullable: true,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deletedAt',
              type: 'timestamp',
              isNullable: true,
            },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'units',
        new TableIndex({
          name: 'IDX_units_name',
          columnNames: ['name'],
          isUnique: true,
        }),
      );

      await queryRunner.createIndex(
        'units',
        new TableIndex({
          name: 'IDX_units_isActive',
          columnNames: ['isActive'],
        }),
      );

      // Insert default units
      await queryRunner.query(`
        INSERT INTO "units" ("name", "symbol", "description", "isActive") VALUES
        ('Kilogramme', 'kg', 'Unité de masse', true),
        ('Gramme', 'g', 'Unité de masse', true),
        ('Litre', 'L', 'Unité de volume', true),
        ('Millilitre', 'mL', 'Unité de volume', true),
        ('Tonne', 't', 'Unité de masse', true),
        ('Sacre', 'sac', 'Unité de mesure locale', true)
      `);
    }

    // Create currencies table
    if (!(await tableExists('currencies'))) {
      await queryRunner.createTable(
        new Table({
          name: 'currencies',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'code',
              type: 'varchar',
              length: '3',
              isUnique: true,
            },
            {
              name: 'name',
              type: 'varchar',
              length: '100',
            },
            {
              name: 'symbol',
              type: 'varchar',
              length: '10',
              isNullable: true,
            },
            {
              name: 'isActive',
              type: 'boolean',
              default: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deletedAt',
              type: 'timestamp',
              isNullable: true,
            },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'currencies',
        new TableIndex({
          name: 'IDX_currencies_code',
          columnNames: ['code'],
          isUnique: true,
        }),
      );

      await queryRunner.createIndex(
        'currencies',
        new TableIndex({
          name: 'IDX_currencies_isActive',
          columnNames: ['isActive'],
        }),
      );

      // Insert default currencies
      await queryRunner.query(`
        INSERT INTO "currencies" ("code", "name", "symbol", "isActive") VALUES
        ('USD', 'Dollar américain', '$', true),
        ('EUR', 'Euro', '€', true),
        ('CDF', 'Franc congolais', 'FC', true),
        ('XAF', 'Franc CFA', 'FCFA', true),
        ('GBP', 'Livre sterling', '£', true)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('currencies', 'IDX_currencies_isActive');
    await queryRunner.dropIndex('currencies', 'IDX_currencies_code');
    await queryRunner.dropTable('currencies');

    await queryRunner.dropIndex('units', 'IDX_units_isActive');
    await queryRunner.dropIndex('units', 'IDX_units_name');
    await queryRunner.dropTable('units');

    await queryRunner.dropIndex('categories', 'IDX_categories_isActive');
    await queryRunner.dropIndex('categories', 'IDX_categories_name');
    await queryRunner.dropTable('categories');
  }
}
