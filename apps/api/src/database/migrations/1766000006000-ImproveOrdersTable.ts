import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveOrdersTable1766000006000 implements MigrationInterface {
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

    // 1. Ajouter colonne orderNumber
    if (!(await columnExists('orders', 'orderNumber'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'orderNumber',
          type: 'varchar',
          length: '50',
          isNullable: true,
          isUnique: true,
        }),
      );
    }

    // 2. Ajouter colonne notes
    if (!(await columnExists('orders', 'notes'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne shippingCostADA
    if (!(await columnExists('orders', 'shippingCostADA'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'shippingCostADA',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
          default: 0,
        }),
      );
    }

    // 4. Ajouter colonne discountADA
    if (!(await columnExists('orders', 'discountADA'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'discountADA',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
          default: 0,
        }),
      );
    }

    // 5. Ajouter colonne taxADA
    if (!(await columnExists('orders', 'taxADA'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'taxADA',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
          default: 0,
        }),
      );
    }

    // 6. Ajouter colonne cancelledAt
    if (!(await columnExists('orders', 'cancelledAt'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'cancelledAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne cancelledBy
    if (!(await columnExists('orders', 'cancelledBy'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'cancelledBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne cancellationReason
    if (!(await columnExists('orders', 'cancellationReason'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'cancellationReason',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 9. Ajouter colonne refundedAt
    if (!(await columnExists('orders', 'refundedAt'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'refundedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne refundHash
    if (!(await columnExists('orders', 'refundHash'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'refundHash',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne estimatedDeliveryDate
    if (!(await columnExists('orders', 'estimatedDeliveryDate'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'estimatedDeliveryDate',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne deliveryMethod
    if (!(await columnExists('orders', 'deliveryMethod'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'deliveryMethod',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonne buyerNotes
    if (!(await columnExists('orders', 'buyerNotes'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'buyerNotes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 14. Ajouter colonne internalNotes
    if (!(await columnExists('orders', 'internalNotes'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'internalNotes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 15. Créer enum pour priority
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE order_priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 16. Ajouter colonne priority
    if (!(await columnExists('orders', 'priority'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'priority',
          type: 'order_priority_enum',
          isNullable: true,
          default: "'normal'",
        }),
      );
    }

    // 17. Ajouter colonne tags
    if (!(await columnExists('orders', 'tags'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'tags',
          type: 'text',
          isArray: true,
          isNullable: true,
        }),
      );
    }

    // 18. Ajouter colonne cooperativeId
    if (!(await columnExists('orders', 'cooperativeId'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'cooperativeId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 19. Ajouter colonne farmerId
    if (!(await columnExists('orders', 'farmerId'))) {
      await queryRunner.addColumn(
        'orders',
        new TableColumn({
          name: 'farmerId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Créer les index
    // Index sur orderNumber
    if (!(await indexExists('orders', 'IDX_orders_orderNumber'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_orderNumber',
          columnNames: ['orderNumber'],
        }),
      );
    }

    // Index sur cooperativeId
    if (!(await indexExists('orders', 'IDX_orders_cooperativeId'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_cooperativeId',
          columnNames: ['cooperativeId'],
        }),
      );
    }

    // Index sur farmerId
    if (!(await indexExists('orders', 'IDX_orders_farmerId'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_farmerId',
          columnNames: ['farmerId'],
        }),
      );
    }

    // Index sur createdAt
    if (!(await indexExists('orders', 'IDX_orders_createdAt'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }

    // Index composite sur status et createdAt
    if (!(await indexExists('orders', 'IDX_orders_status_createdAt'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_status_createdAt',
          columnNames: ['status', 'createdAt'],
        }),
      );
    }

    // Index sur priority
    if (!(await indexExists('orders', 'IDX_orders_priority'))) {
      await queryRunner.createIndex(
        'orders',
        new TableIndex({
          name: 'IDX_orders_priority',
          columnNames: ['priority'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('orders', 'IDX_orders_priority');
    await queryRunner.dropIndex('orders', 'IDX_orders_status_createdAt');
    await queryRunner.dropIndex('orders', 'IDX_orders_createdAt');
    await queryRunner.dropIndex('orders', 'IDX_orders_farmerId');
    await queryRunner.dropIndex('orders', 'IDX_orders_cooperativeId');
    await queryRunner.dropIndex('orders', 'IDX_orders_orderNumber');

    // Supprimer les colonnes
    await queryRunner.dropColumn('orders', 'farmerId');
    await queryRunner.dropColumn('orders', 'cooperativeId');
    await queryRunner.dropColumn('orders', 'tags');
    await queryRunner.dropColumn('orders', 'priority');
    await queryRunner.dropColumn('orders', 'internalNotes');
    await queryRunner.dropColumn('orders', 'buyerNotes');
    await queryRunner.dropColumn('orders', 'deliveryMethod');
    await queryRunner.dropColumn('orders', 'estimatedDeliveryDate');
    await queryRunner.dropColumn('orders', 'refundHash');
    await queryRunner.dropColumn('orders', 'refundedAt');
    await queryRunner.dropColumn('orders', 'cancellationReason');
    await queryRunner.dropColumn('orders', 'cancelledBy');
    await queryRunner.dropColumn('orders', 'cancelledAt');
    await queryRunner.dropColumn('orders', 'taxADA');
    await queryRunner.dropColumn('orders', 'discountADA');
    await queryRunner.dropColumn('orders', 'shippingCostADA');
    await queryRunner.dropColumn('orders', 'notes');
    await queryRunner.dropColumn('orders', 'orderNumber');

    // Supprimer l'enum
    await queryRunner.query(`DROP TYPE IF EXISTS order_priority_enum`);
  }
}

