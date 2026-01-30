import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class InitialSchema1764697294768 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ==========================================
    // 1. CREATE ENUM TYPES
    // ==========================================
    await queryRunner.query(
      `CREATE TYPE "batch_status_enum" AS ENUM ('created', 'processed', 'exported')`,
    );
    await queryRunner.query(
      `CREATE TYPE "step_type_enum" AS ENUM ('harvest', 'drying', 'packaging', 'export')`,
    );
    await queryRunner.query(
      `CREATE TYPE "owner_type_enum" AS ENUM ('farmer', 'buyer', 'cooperative')`,
    );
    await queryRunner.query(
      `CREATE TYPE "loan_status_enum" AS ENUM ('pending', 'active', 'repaid', 'defaulted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "mobile_money_provider_enum" AS ENUM ('airtel', 'orange', 'mpesa', 'vodacom')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'success', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "transaction_type_enum" AS ENUM ('deposit', 'withdrawal')`,
    );
    await queryRunner.query(
      `CREATE TYPE "marketplace_item_status_enum" AS ENUM ('draft', 'active', 'sold_out', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TYPE "order_status_enum" AS ENUM ('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TYPE "nft_type_enum" AS ENUM ('recipe', 'tale', 'song', 'art', 'tradition')`,
    );
    await queryRunner.query(
      `CREATE TYPE "nft_status_enum" AS ENUM ('draft', 'minting', 'minted', 'listed', 'sold')`,
    );
    await queryRunner.query(
      `CREATE TYPE "school_status_enum" AS ENUM ('active', 'inactive', 'pending')`,
    );

    // ==========================================
    // 2. CREATE BASE TABLES (NO FK DEPENDENCIES)
    // ==========================================

    // Cooperatives
    await queryRunner.createTable(
      new Table({
        name: 'cooperatives',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'location', type: 'varchar', length: '255' },
          { name: 'leader', type: 'varchar', length: '100' },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Products
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'unit', type: 'varchar', length: '100' },
          { name: 'description', type: 'varchar', length: '100' },
          { name: 'image', type: 'jsonb', isNullable: true },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Farmers
    await queryRunner.createTable(
      new Table({
        name: 'farmers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'phone', type: 'varchar', length: '20' },
          {
            name: 'walletAddress',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'address', type: 'varchar', length: '255' },
          { name: 'city', type: 'varchar', length: '100' },
          { name: 'state', type: 'varchar', length: '100' },
          { name: 'latitude', type: 'decimal', precision: 10, scale: 7 },
          { name: 'longitude', type: 'decimal', precision: 10, scale: 7 },
          { name: 'cooperativeId', type: 'uuid', isNullable: true },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Wallets (polymorphic)
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'ownerType', type: 'owner_type_enum' },
          { name: 'ownerId', type: 'uuid' },
          {
            name: 'adaAddress',
            type: 'varchar',
            length: '150',
            isUnique: true,
          },
          {
            name: 'mobileMoneyNumber',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'balanceADA',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // School Funds
    await queryRunner.createTable(
      new Table({
        name: 'school_funds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'schoolName', type: 'varchar', length: '200' },
          { name: 'province', type: 'varchar', length: '100' },
          { name: 'city', type: 'varchar', length: '100', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          {
            name: 'contactPerson',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'contactPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'walletAddress',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'totalFundedADA',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'totalDisbursedADA',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          { name: 'studentCount', type: 'int', isNullable: true },
          { name: 'status', type: 'school_status_enum', default: "'pending'" },
          {
            name: 'lastUpdate',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // NFTs
    await queryRunner.createTable(
      new Table({
        name: 'nfts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'creatorId', type: 'uuid' },
          { name: 'type', type: 'nft_type_enum' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'metadataURI', type: 'varchar', length: '500' },
          { name: 'priceADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'revenueDistribution', type: 'jsonb' },
          {
            name: 'onChainHash',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'policyId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'assetName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'status', type: 'nft_status_enum', default: "'draft'" },
          { name: 'mintedAt', type: 'timestamp', isNullable: true },
          { name: 'soldAt', type: 'timestamp', isNullable: true },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Mobile Money Transactions
    await queryRunner.createTable(
      new Table({
        name: 'mobile_money_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'fromMobileNumber', type: 'varchar', length: '20' },
          { name: 'toAdaAddress', type: 'varchar', length: '150' },
          { name: 'amount', type: 'decimal', precision: 18, scale: 2 },
          { name: 'amountADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'provider', type: 'mobile_money_provider_enum' },
          {
            name: 'status',
            type: 'transaction_status_enum',
            default: "'pending'",
          },
          { name: 'type', type: 'transaction_type_enum' },
          {
            name: 'transactionRef',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'failureReason', type: 'text', isNullable: true },
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
        ],
      }),
      true,
    );

    // ==========================================
    // 3. TABLES WITH FARMER FK
    // ==========================================

    // Harvests
    await queryRunner.createTable(
      new Table({
        name: 'harvests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'farmerId', type: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'quantity', type: 'decimal', precision: 10, scale: 2 },
          {
            name: 'harvestAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          { name: 'proofHash', type: 'varchar', length: '255' },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Micro Loans
    await queryRunner.createTable(
      new Table({
        name: 'micro_loans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'farmerId', type: 'uuid' },
          { name: 'amountADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'interestRate', type: 'decimal', precision: 5, scale: 2 },
          { name: 'durationDays', type: 'int' },
          { name: 'status', type: 'loan_status_enum', default: "'pending'" },
          { name: 'loanContractHash', type: 'varchar', length: '255' },
          { name: 'startDate', type: 'timestamp', isNullable: true },
          { name: 'dueDate', type: 'timestamp', isNullable: true },
          { name: 'repaidAt', type: 'timestamp', isNullable: true },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Credit Scores
    await queryRunner.createTable(
      new Table({
        name: 'credit_scores',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'farmerId', type: 'uuid', isUnique: true },
          { name: 'score', type: 'int', default: 0 },
          { name: 'harvestCount', type: 'int', default: 0 },
          {
            name: 'totalHarvestValue',
            type: 'decimal',
            precision: 18,
            scale: 6,
            default: 0,
          },
          {
            name: 'loanRepaymentRate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'lastUpdate',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
        ],
      }),
      true,
    );

    // ==========================================
    // 4. BATCH RELATED TABLES
    // ==========================================

    // Batches
    await queryRunner.createTable(
      new Table({
        name: 'batches',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'qrCode', type: 'varchar', length: '255', isUnique: true },
          { name: 'batchHash', type: 'varchar', length: '255' },
          { name: 'status', type: 'batch_status_enum', default: "'created'" },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Batch-Harvests Junction Table
    await queryRunner.createTable(
      new Table({
        name: 'batch_harvests',
        columns: [
          { name: 'batchId', type: 'uuid' },
          { name: 'harvestId', type: 'uuid' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'batch_harvests',
      new TableIndex({
        name: 'PK_batch_harvests',
        columnNames: ['batchId', 'harvestId'],
        isUnique: true,
      }),
    );

    // Supply Chain Steps
    await queryRunner.createTable(
      new Table({
        name: 'supply_chain_steps',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'batchId', type: 'uuid' },
          { name: 'stepType', type: 'step_type_enum' },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          { name: 'metadataHash', type: 'varchar', length: '255' },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // ==========================================
    // 5. MARKETPLACE TABLES
    // ==========================================

    // Marketplace Items
    await queryRunner.createTable(
      new Table({
        name: 'marketplace_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'batchId', type: 'uuid' },
          { name: 'farmerId', type: 'uuid' },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'priceADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'stockKg', type: 'decimal', precision: 10, scale: 2 },
          {
            name: 'status',
            type: 'marketplace_item_status_enum',
            default: "'draft'",
          },
          {
            name: 'imageUrl',
            type: 'varchar',
            length: '500',
            isNullable: true,
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // Orders
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'buyerId', type: 'uuid' },
          { name: 'itemId', type: 'uuid' },
          { name: 'quantityKg', type: 'decimal', precision: 10, scale: 2 },
          { name: 'unitPriceADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'totalADA', type: 'decimal', precision: 18, scale: 6 },
          { name: 'status', type: 'order_status_enum', default: "'pending'" },
          {
            name: 'paymentHash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'shippingAddress', type: 'text', isNullable: true },
          {
            name: 'trackingNumber',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'paidAt', type: 'timestamp', isNullable: true },
          { name: 'shippedAt', type: 'timestamp', isNullable: true },
          { name: 'completedAt', type: 'timestamp', isNullable: true },
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
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // NFT Purchases
    await queryRunner.createTable(
      new Table({
        name: 'nft_purchases',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'nftId', type: 'uuid' },
          { name: 'buyerId', type: 'uuid' },
          { name: 'amountPaid', type: 'decimal', precision: 18, scale: 6 },
          { name: 'creatorShare', type: 'decimal', precision: 18, scale: 6 },
          {
            name: 'schoolFundContribution',
            type: 'decimal',
            precision: 18,
            scale: 6,
          },
          { name: 'platformShare', type: 'decimal', precision: 18, scale: 6 },
          {
            name: 'transactionHash',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
        ],
      }),
      true,
    );

    // ==========================================
    // 6. CREATE ALL INDEXES
    // ==========================================
    await queryRunner.createIndex(
      'cooperatives',
      new TableIndex({ name: 'IDX_cooperatives_name', columnNames: ['name'] }),
    );
    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_name', columnNames: ['name'] }),
    );
    await queryRunner.createIndex(
      'farmers',
      new TableIndex({
        name: 'IDX_farmers_cooperativeId',
        columnNames: ['cooperativeId'],
      }),
    );
    await queryRunner.createIndex(
      'wallets',
      new TableIndex({ name: 'IDX_wallets_ownerId', columnNames: ['ownerId'] }),
    );
    await queryRunner.createIndex(
      'wallets',
      new TableIndex({
        name: 'IDX_wallets_owner',
        columnNames: ['ownerType', 'ownerId'],
      }),
    );
    await queryRunner.createIndex(
      'harvests',
      new TableIndex({
        name: 'IDX_harvests_farmerId',
        columnNames: ['farmerId'],
      }),
    );
    await queryRunner.createIndex(
      'harvests',
      new TableIndex({
        name: 'IDX_harvests_productId',
        columnNames: ['productId'],
      }),
    );
    await queryRunner.createIndex(
      'micro_loans',
      new TableIndex({
        name: 'IDX_micro_loans_farmerId',
        columnNames: ['farmerId'],
      }),
    );
    await queryRunner.createIndex(
      'micro_loans',
      new TableIndex({
        name: 'IDX_micro_loans_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'credit_scores',
      new TableIndex({
        name: 'IDX_credit_scores_score',
        columnNames: ['score'],
      }),
    );
    await queryRunner.createIndex(
      'supply_chain_steps',
      new TableIndex({
        name: 'IDX_supply_chain_steps_batchId',
        columnNames: ['batchId'],
      }),
    );
    await queryRunner.createIndex(
      'marketplace_items',
      new TableIndex({
        name: 'IDX_marketplace_items_farmerId',
        columnNames: ['farmerId'],
      }),
    );
    await queryRunner.createIndex(
      'marketplace_items',
      new TableIndex({
        name: 'IDX_marketplace_items_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_buyerId', columnNames: ['buyerId'] }),
    );
    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'nfts',
      new TableIndex({
        name: 'IDX_nfts_creatorId',
        columnNames: ['creatorId'],
      }),
    );
    await queryRunner.createIndex(
      'nfts',
      new TableIndex({ name: 'IDX_nfts_type', columnNames: ['type'] }),
    );
    await queryRunner.createIndex(
      'nfts',
      new TableIndex({ name: 'IDX_nfts_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'nft_purchases',
      new TableIndex({
        name: 'IDX_nft_purchases_buyerId',
        columnNames: ['buyerId'],
      }),
    );
    await queryRunner.createIndex(
      'nft_purchases',
      new TableIndex({
        name: 'IDX_nft_purchases_transactionHash',
        columnNames: ['transactionHash'],
      }),
    );
    await queryRunner.createIndex(
      'school_funds',
      new TableIndex({
        name: 'IDX_school_funds_province',
        columnNames: ['province'],
      }),
    );
    await queryRunner.createIndex(
      'school_funds',
      new TableIndex({
        name: 'IDX_school_funds_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'mobile_money_transactions',
      new TableIndex({
        name: 'IDX_mobile_money_status',
        columnNames: ['status'],
      }),
    );

    // ==========================================
    // 7. CREATE ALL FOREIGN KEYS
    // ==========================================
    await queryRunner.createForeignKey(
      'farmers',
      new TableForeignKey({
        name: 'FK_farmers_cooperative',
        columnNames: ['cooperativeId'],
        referencedTableName: 'cooperatives',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'harvests',
      new TableForeignKey({
        name: 'FK_harvests_farmer',
        columnNames: ['farmerId'],
        referencedTableName: 'farmers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'harvests',
      new TableForeignKey({
        name: 'FK_harvests_product',
        columnNames: ['productId'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'micro_loans',
      new TableForeignKey({
        name: 'FK_micro_loans_farmer',
        columnNames: ['farmerId'],
        referencedTableName: 'farmers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'credit_scores',
      new TableForeignKey({
        name: 'FK_credit_scores_farmer',
        columnNames: ['farmerId'],
        referencedTableName: 'farmers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'batch_harvests',
      new TableForeignKey({
        name: 'FK_batch_harvests_batch',
        columnNames: ['batchId'],
        referencedTableName: 'batches',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'batch_harvests',
      new TableForeignKey({
        name: 'FK_batch_harvests_harvest',
        columnNames: ['harvestId'],
        referencedTableName: 'harvests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'supply_chain_steps',
      new TableForeignKey({
        name: 'FK_supply_chain_steps_batch',
        columnNames: ['batchId'],
        referencedTableName: 'batches',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'marketplace_items',
      new TableForeignKey({
        name: 'FK_marketplace_items_batch',
        columnNames: ['batchId'],
        referencedTableName: 'batches',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'marketplace_items',
      new TableForeignKey({
        name: 'FK_marketplace_items_farmer',
        columnNames: ['farmerId'],
        referencedTableName: 'farmers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        name: 'FK_orders_item',
        columnNames: ['itemId'],
        referencedTableName: 'marketplace_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'nft_purchases',
      new TableForeignKey({
        name: 'FK_nft_purchases_nft',
        columnNames: ['nftId'],
        referencedTableName: 'nfts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('nft_purchases', 'FK_nft_purchases_nft');
    await queryRunner.dropForeignKey('orders', 'FK_orders_item');
    await queryRunner.dropForeignKey(
      'marketplace_items',
      'FK_marketplace_items_farmer',
    );
    await queryRunner.dropForeignKey(
      'marketplace_items',
      'FK_marketplace_items_batch',
    );
    await queryRunner.dropForeignKey(
      'supply_chain_steps',
      'FK_supply_chain_steps_batch',
    );
    await queryRunner.dropForeignKey(
      'batch_harvests',
      'FK_batch_harvests_harvest',
    );
    await queryRunner.dropForeignKey(
      'batch_harvests',
      'FK_batch_harvests_batch',
    );
    await queryRunner.dropForeignKey(
      'credit_scores',
      'FK_credit_scores_farmer',
    );
    await queryRunner.dropForeignKey('micro_loans', 'FK_micro_loans_farmer');
    await queryRunner.dropForeignKey('harvests', 'FK_harvests_product');
    await queryRunner.dropForeignKey('harvests', 'FK_harvests_farmer');
    await queryRunner.dropForeignKey('farmers', 'FK_farmers_cooperative');

    // Drop tables in reverse order
    await queryRunner.dropTable('nft_purchases');
    await queryRunner.dropTable('orders');
    await queryRunner.dropTable('marketplace_items');
    await queryRunner.dropTable('supply_chain_steps');
    await queryRunner.dropTable('batch_harvests');
    await queryRunner.dropTable('batches');
    await queryRunner.dropTable('credit_scores');
    await queryRunner.dropTable('micro_loans');
    await queryRunner.dropTable('harvests');
    await queryRunner.dropTable('mobile_money_transactions');
    await queryRunner.dropTable('nfts');
    await queryRunner.dropTable('school_funds');
    await queryRunner.dropTable('wallets');
    await queryRunner.dropTable('farmers');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('cooperatives');

    // Drop enum types
    await queryRunner.query(`DROP TYPE "school_status_enum"`);
    await queryRunner.query(`DROP TYPE "nft_status_enum"`);
    await queryRunner.query(`DROP TYPE "nft_type_enum"`);
    await queryRunner.query(`DROP TYPE "order_status_enum"`);
    await queryRunner.query(`DROP TYPE "marketplace_item_status_enum"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "mobile_money_provider_enum"`);
    await queryRunner.query(`DROP TYPE "loan_status_enum"`);
    await queryRunner.query(`DROP TYPE "owner_type_enum"`);
    await queryRunner.query(`DROP TYPE "step_type_enum"`);
    await queryRunner.query(`DROP TYPE "batch_status_enum"`);
  }
}
