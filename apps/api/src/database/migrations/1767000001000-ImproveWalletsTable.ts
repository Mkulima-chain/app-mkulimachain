import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveWalletsTable1767000001000
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

    // 1. Ajouter colonne status (active, inactive, frozen, suspended)
    if (!(await columnExists('wallets', 'status'))) {
      // Créer l'enum si nécessaire
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "wallet_status_enum" AS ENUM ('active', 'inactive', 'frozen', 'suspended');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'status',
          type: 'wallet_status_enum',
          default: "'active'",
        }),
      );
    }

    // 2. Ajouter colonne label
    if (!(await columnExists('wallets', 'label'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'label',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne description
    if (!(await columnExists('wallets', 'description'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 4. Ajouter colonne isVerified
    if (!(await columnExists('wallets', 'isVerified'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'isVerified',
          type: 'boolean',
          default: false,
        }),
      );
    }

    // 5. Ajouter colonne verifiedAt
    if (!(await columnExists('wallets', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne verifiedBy
    if (!(await columnExists('wallets', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne lastTransactionAt
    if (!(await columnExists('wallets', 'lastTransactionAt'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'lastTransactionAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne transactionCount
    if (!(await columnExists('wallets', 'transactionCount'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'transactionCount',
          type: 'integer',
          default: 0,
        }),
      );
    }

    // 9. Ajouter colonne totalReceived
    if (!(await columnExists('wallets', 'totalReceived'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'totalReceived',
          type: 'decimal',
          precision: 18,
          scale: 6,
          default: 0,
        }),
      );
    }

    // 10. Ajouter colonne totalSent
    if (!(await columnExists('wallets', 'totalSent'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'totalSent',
          type: 'decimal',
          precision: 18,
          scale: 6,
          default: 0,
        }),
      );
    }

    // 11. Ajouter colonne minBalance
    if (!(await columnExists('wallets', 'minBalance'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'minBalance',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne maxBalance
    if (!(await columnExists('wallets', 'maxBalance'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'maxBalance',
          type: 'decimal',
          precision: 18,
          scale: 6,
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonne notes
    if (!(await columnExists('wallets', 'notes'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 14. Ajouter colonne metadata (JSONB)
    if (!(await columnExists('wallets', 'metadata'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'metadata',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 15. Ajouter colonne lastSyncedAt
    if (!(await columnExists('wallets', 'lastSyncedAt'))) {
      await queryRunner.addColumn(
        'wallets',
        new TableColumn({
          name: 'lastSyncedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // INDEXES

    // Index sur status
    if (!(await indexExists('wallets', 'IDX_wallets_status'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_status',
          columnNames: ['status'],
        }),
      );
    }

    // Index sur isVerified
    if (!(await indexExists('wallets', 'IDX_wallets_isVerified'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_isVerified',
          columnNames: ['isVerified'],
        }),
      );
    }

    // Index composite sur status et isVerified
    if (!(await indexExists('wallets', 'IDX_wallets_status_verified'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_status_verified',
          columnNames: ['status', 'isVerified'],
        }),
      );
    }

    // Index sur label
    if (!(await indexExists('wallets', 'IDX_wallets_label'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_label',
          columnNames: ['label'],
        }),
      );
    }

    // Index sur lastTransactionAt
    if (!(await indexExists('wallets', 'IDX_wallets_lastTransactionAt'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_lastTransactionAt',
          columnNames: ['lastTransactionAt'],
        }),
      );
    }

    // Index sur transactionCount
    if (!(await indexExists('wallets', 'IDX_wallets_transactionCount'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_transactionCount',
          columnNames: ['transactionCount'],
        }),
      );
    }

    // Index composite sur ownerType et ownerId
    if (!(await indexExists('wallets', 'IDX_wallets_ownerType_ownerId'))) {
      await queryRunner.createIndex(
        'wallets',
        new TableIndex({
          name: 'IDX_wallets_ownerType_ownerId',
          columnNames: ['ownerType', 'ownerId'],
        }),
      );
    }

    // Index GIN sur metadata pour recherches JSON
    if (!(await indexExists('wallets', 'IDX_wallets_metadata'))) {
      await queryRunner.query(`
        CREATE INDEX "IDX_wallets_metadata" 
        ON "wallets" USING GIN ("metadata");
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    try {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_wallets_metadata";`,
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex(
        'wallets',
        'IDX_wallets_ownerType_ownerId',
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_transactionCount');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_lastTransactionAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_label');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_status_verified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_isVerified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('wallets', 'IDX_wallets_status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Supprimer les colonnes
    try {
      await queryRunner.dropColumn('wallets', 'lastSyncedAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'metadata');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'notes');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'maxBalance');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'minBalance');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'totalSent');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'totalReceived');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'transactionCount');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'lastTransactionAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'verifiedBy');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'verifiedAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'isVerified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'description');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'label');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('wallets', 'status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Note: On ne supprime pas les enums car ils pourraient être utilisés ailleurs
  }
}
