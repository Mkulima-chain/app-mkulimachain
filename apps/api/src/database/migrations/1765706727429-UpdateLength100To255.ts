import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLength100To2551765706727429 implements MigrationInterface {
  name = 'UpdateLength100To2551765706727429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "micro_loans" DROP CONSTRAINT "FK_micro_loans_farmer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" DROP CONSTRAINT "FK_credit_scores_farmer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" DROP CONSTRAINT "FK_farmers_cooperative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_harvests_farmer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_harvests_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" DROP CONSTRAINT "FK_supply_chain_steps_batch"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" DROP CONSTRAINT "FK_nft_purchases_nft"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" DROP CONSTRAINT "FK_marketplace_items_batch"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" DROP CONSTRAINT "FK_marketplace_items_farmer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_item"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" DROP CONSTRAINT "FK_batch_harvests_batch"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" DROP CONSTRAINT "FK_batch_harvests_harvest"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_wallets_ownerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_wallets_owner"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cooperatives_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_micro_loans_farmerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_micro_loans_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_credit_scores_score"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_farmers_cooperativeId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_sku"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_products_originCountry"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_harvests_farmerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_harvests_productId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_supply_chain_steps_batchId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_units_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_units_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_currencies_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_currencies_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_categories_isActive"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_school_funds_province"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_school_funds_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_nft_purchases_buyerId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_nft_purchases_transactionHash"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_nfts_creatorId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_nfts_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_nfts_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_marketplace_items_farmerId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_marketplace_items_status"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_buyerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_mobile_money_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_authProvider"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_phone"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_googleId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_walletAddress"`);
    await queryRunner.query(`DROP INDEX "public"."PK_batch_harvests"`);
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" ADD CONSTRAINT "PK_315b89993d065d6cffdff26ba5a" PRIMARY KEY ("batchId", "harvestId")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."owner_type_enum" RENAME TO "owner_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallets_ownertype_enum" AS ENUM('farmer', 'buyer', 'cooperative')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "ownerType" TYPE "public"."wallets_ownertype_enum" USING "ownerType"::"text"::"public"."wallets_ownertype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."owner_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "UQ_76d91dfd154f64ba94da6cc7402"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `UPDATE "cooperatives" SET "name" = '' WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "name" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "cooperatives" SET "leader" = '' WHERE "leader" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "leader" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "leader" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."loan_status_enum" RENAME TO "loan_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."micro_loans_status_enum" AS ENUM('pending', 'active', 'repaid', 'defaulted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" TYPE "public"."micro_loans_status_enum" USING "status"::"text"::"public"."micro_loans_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."loan_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "farmerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "lastUpdate" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "farmerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "farmers" SET "name" = '' WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "name" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "walletAddress" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "farmers" SET "city" = '' WHERE "city" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "city" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "city" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "farmers" SET "state" = '' WHERE "state" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "state" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "state" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku")`,
    );
    await queryRunner.query(
      `UPDATE "products" SET "name" = '' WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "name" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "products" SET "unit" = '' WHERE "unit" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "unit" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "unit" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "products" SET "category" = '' WHERE "category" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "category" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "harvestAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "farmerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "productId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."batch_status_enum" RENAME TO "batch_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."batches_status_enum" AS ENUM('created', 'processed', 'exported')`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" TYPE "public"."batches_status_enum" USING "status"::"text"::"public"."batches_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" SET DEFAULT 'created'`,
    );
    await queryRunner.query(`DROP TYPE "public"."batch_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."step_type_enum" RENAME TO "step_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."supply_chain_steps_steptype_enum" AS ENUM('harvest', 'drying', 'packaging', 'export')`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "stepType" TYPE "public"."supply_chain_steps_steptype_enum" USING "stepType"::"text"::"public"."supply_chain_steps_steptype_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."step_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "timestamp" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "batchId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "units" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "units" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    // Update NULL values before changing column
    await queryRunner.query(
      `UPDATE "currencies" SET "name" = '' WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "name" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );
    await queryRunner.query(
      `UPDATE "categories" SET "name" = '' WHERE "name" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "name" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `UPDATE "school_funds" SET "province" = '' WHERE "province" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "province" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "province" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "city" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "contactPerson" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."school_status_enum" RENAME TO "school_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."school_funds_status_enum" AS ENUM('active', 'inactive', 'pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" TYPE "public"."school_funds_status_enum" USING "status"::"text"::"public"."school_funds_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."school_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "lastUpdate" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "timestamp" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "nftId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."nft_type_enum" RENAME TO "nft_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nfts_type_enum" AS ENUM('recipe', 'tale', 'song', 'art', 'tradition')`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "type" TYPE "public"."nfts_type_enum" USING "type"::"text"::"public"."nfts_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."nft_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "nfts" DROP CONSTRAINT "UQ_d524829ff3eed89bb60c28bd0af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "policyId" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "assetName" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."nft_status_enum" RENAME TO "nft_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nfts_status_enum" AS ENUM('draft', 'minting', 'minted', 'listed', 'sold')`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" TYPE "public"."nfts_status_enum" USING "status"::"text"::"public"."nfts_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(`DROP TYPE "public"."nft_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."marketplace_item_status_enum" RENAME TO "marketplace_item_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."marketplace_items_status_enum" AS ENUM('draft', 'active', 'sold_out', 'archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" TYPE "public"."marketplace_items_status_enum" USING "status"::"text"::"public"."marketplace_items_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."marketplace_item_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "batchId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "farmerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum" RENAME TO "order_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."order_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "trackingNumber" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "itemId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mobile_money_provider_enum" RENAME TO "mobile_money_provider_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mobile_money_transactions_provider_enum" AS ENUM('airtel', 'orange', 'mpesa', 'vodacom')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "provider" TYPE "public"."mobile_money_transactions_provider_enum" USING "provider"::"text"::"public"."mobile_money_transactions_provider_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mobile_money_provider_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum" RENAME TO "transaction_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mobile_money_transactions_status_enum" AS ENUM('pending', 'success', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" TYPE "public"."mobile_money_transactions_status_enum" USING "status"::"text"::"public"."mobile_money_transactions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_type_enum" RENAME TO "transaction_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mobile_money_transactions_type_enum" AS ENUM('deposit', 'withdrawal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "type" TYPE "public"."mobile_money_transactions_type_enum" USING "type"::"text"::"public"."mobile_money_transactions_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "transactionRef" TYPE character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'farmer', 'buyer', 'cooperative', 'school')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'farmer'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_status_enum" RENAME TO "user_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending_verification')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."users_status_enum" USING "status"::"text"::"public"."users_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'pending_verification'`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."auth_provider_enum" RENAME TO "auth_provider_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_authprovider_enum" AS ENUM('email', 'google', 'wallet')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" TYPE "public"."users_authprovider_enum" USING "authProvider"::"text"::"public"."users_authprovider_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'email'`,
    );
    await queryRunner.query(`DROP TYPE "public"."auth_provider_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_342cecf691b0d12172e69b2b8f" ON "wallets" ("ownerId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_76d91dfd154f64ba94da6cc740" ON "wallets" ("adaAddress") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f5b1084beab3a9bebc9e4a4937" ON "micro_loans" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_919ede336b1b6b912051dff90e" ON "credit_scores" ("farmerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5decac690dbe93eb16ac73270" ON "school_funds" ("schoolName") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f732fa8d31f427ee3c2781070" ON "school_funds" ("province") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f91b965d1a8162bd760d7b4b91" ON "school_funds" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a8d3cc04c2c464016aea3bd91" ON "nft_purchases" ("buyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fa97ca703560452c722867eca" ON "nft_purchases" ("transactionHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9898b6eb9a714f7ab9c1b7fa0" ON "nfts" ("creatorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0b04c4ff4a4d1b9a483f2d310" ON "nfts" ("type") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d524829ff3eed89bb60c28bd0a" ON "nfts" ("onChainHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_678c317314f5e37b9538eb67a5" ON "nfts" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_312324e874a641d639b5cdb143" ON "marketplace_items" ("farmerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ed14157a3d0a0e70b371f03284" ON "marketplace_items" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9877ffd9a491c3e82f5b32d4f4" ON "orders" ("buyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_775c9f06fc27ae3ff8fb26f2c4" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36e1d7c6b8ac1c0e153a70572b" ON "mobile_money_transactions" ("fromMobileNumber") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5774042af12e33cf41909e9ed" ON "mobile_money_transactions" ("toAdaAddress") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_938f0d6a7cf6b561f17413cbb5" ON "mobile_money_transactions" ("status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a000cca60bcf04454e72769949" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8500c8e9383d3a3a54ff9e5e1e" ON "users" ("authProvider") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f382af58ab36057334fb262efd" ON "users" ("googleId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fc71cd6fb73f95244b23e2ef11" ON "users" ("walletAddress") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16be96d6282290ef81f46173fe" ON "batch_harvests" ("batchId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8945ac8748ad5c11a2b6d2aec" ON "batch_harvests" ("harvestId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ADD CONSTRAINT "FK_a7a78366fceda41873760e375cf" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ADD CONSTRAINT "FK_919ede336b1b6b912051dff90e1" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD CONSTRAINT "FK_cb9d16fab84c62b3742d417cd57" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_037fd2deba12dd9e61ffbe14ee7" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_1ec7e0b5fb8f32731c6ea3946fb" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ADD CONSTRAINT "FK_75a043b35479f5942476cf56a09" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ADD CONSTRAINT "FK_1665caab6b4c384a87b33eedb59" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ADD CONSTRAINT "FK_cd6b727d67327ef15e68af4dd8b" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ADD CONSTRAINT "FK_312324e874a641d639b5cdb1438" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_4fba2ea9e06c0fd14579ab97ed2" FOREIGN KEY ("itemId") REFERENCES "marketplace_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" ADD CONSTRAINT "FK_16be96d6282290ef81f46173fe8" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" ADD CONSTRAINT "FK_c8945ac8748ad5c11a2b6d2aec4" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" DROP CONSTRAINT "FK_c8945ac8748ad5c11a2b6d2aec4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" DROP CONSTRAINT "FK_16be96d6282290ef81f46173fe8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_4fba2ea9e06c0fd14579ab97ed2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" DROP CONSTRAINT "FK_312324e874a641d639b5cdb1438"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" DROP CONSTRAINT "FK_cd6b727d67327ef15e68af4dd8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" DROP CONSTRAINT "FK_1665caab6b4c384a87b33eedb59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" DROP CONSTRAINT "FK_75a043b35479f5942476cf56a09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_1ec7e0b5fb8f32731c6ea3946fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" DROP CONSTRAINT "FK_037fd2deba12dd9e61ffbe14ee7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" DROP CONSTRAINT "FK_cb9d16fab84c62b3742d417cd57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" DROP CONSTRAINT "FK_919ede336b1b6b912051dff90e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" DROP CONSTRAINT "FK_a7a78366fceda41873760e375cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c8945ac8748ad5c11a2b6d2aec"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_16be96d6282290ef81f46173fe"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc71cd6fb73f95244b23e2ef11"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f382af58ab36057334fb262efd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8500c8e9383d3a3a54ff9e5e1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a000cca60bcf04454e72769949"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_938f0d6a7cf6b561f17413cbb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5774042af12e33cf41909e9ed"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36e1d7c6b8ac1c0e153a70572b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_775c9f06fc27ae3ff8fb26f2c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9877ffd9a491c3e82f5b32d4f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ed14157a3d0a0e70b371f03284"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_312324e874a641d639b5cdb143"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_678c317314f5e37b9538eb67a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d524829ff3eed89bb60c28bd0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c0b04c4ff4a4d1b9a483f2d310"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9898b6eb9a714f7ab9c1b7fa0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fa97ca703560452c722867eca"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a8d3cc04c2c464016aea3bd91"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f91b965d1a8162bd760d7b4b91"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f732fa8d31f427ee3c2781070"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e5decac690dbe93eb16ac73270"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_919ede336b1b6b912051dff90e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f5b1084beab3a9bebc9e4a4937"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76d91dfd154f64ba94da6cc740"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_342cecf691b0d12172e69b2b8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."auth_provider_enum_old" AS ENUM('email', 'google', 'wallet')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" TYPE "public"."auth_provider_enum_old" USING "authProvider"::"text"::"public"."auth_provider_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'email'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."auth_provider_enum_old" RENAME TO "auth_provider_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_status_enum_old" AS ENUM('active', 'inactive', 'suspended', 'pending_verification')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" TYPE "public"."user_status_enum_old" USING "status"::"text"::"public"."user_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'pending_verification'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_status_enum_old" RENAME TO "user_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'farmer', 'buyer', 'cooperative', 'school')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'farmer'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" DROP COLUMN "transactionRef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ADD "transactionRef" character varying(100)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_type_enum_old" AS ENUM('deposit', 'withdrawal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "type" TYPE "public"."transaction_type_enum_old" USING "type"::"text"::"public"."transaction_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mobile_money_transactions_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_type_enum_old" RENAME TO "transaction_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum_old" AS ENUM('pending', 'success', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" TYPE "public"."transaction_status_enum_old" USING "status"::"text"::"public"."transaction_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mobile_money_transactions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."transaction_status_enum_old" RENAME TO "transaction_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mobile_money_provider_enum_old" AS ENUM('airtel', 'orange', 'mpesa', 'vodacom')`,
    );
    await queryRunner.query(
      `ALTER TABLE "mobile_money_transactions" ALTER COLUMN "provider" TYPE "public"."mobile_money_provider_enum_old" USING "provider"::"text"::"public"."mobile_money_provider_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."mobile_money_transactions_provider_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."mobile_money_provider_enum_old" RENAME TO "mobile_money_provider_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "itemId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "trackingNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "trackingNumber" character varying(100)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum_old" AS ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."order_status_enum_old" USING "status"::"text"::"public"."order_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."order_status_enum_old" RENAME TO "order_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "farmerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "batchId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."marketplace_item_status_enum_old" AS ENUM('draft', 'active', 'sold_out', 'archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" TYPE "public"."marketplace_item_status_enum_old" USING "status"::"text"::"public"."marketplace_item_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."marketplace_items_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."marketplace_item_status_enum_old" RENAME TO "marketplace_item_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nft_status_enum_old" AS ENUM('draft', 'minting', 'minted', 'listed', 'sold')`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" TYPE "public"."nft_status_enum_old" USING "status"::"text"::"public"."nft_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(`DROP TYPE "public"."nfts_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."nft_status_enum_old" RENAME TO "nft_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "nfts" DROP COLUMN "assetName"`);
    await queryRunner.query(
      `ALTER TABLE "nfts" ADD "assetName" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "nfts" DROP COLUMN "policyId"`);
    await queryRunner.query(
      `ALTER TABLE "nfts" ADD "policyId" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ADD CONSTRAINT "UQ_d524829ff3eed89bb60c28bd0af" UNIQUE ("onChainHash")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nft_type_enum_old" AS ENUM('recipe', 'tale', 'song', 'art', 'tradition')`,
    );
    await queryRunner.query(
      `ALTER TABLE "nfts" ALTER COLUMN "type" TYPE "public"."nft_type_enum_old" USING "type"::"text"::"public"."nft_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."nfts_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."nft_type_enum_old" RENAME TO "nft_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "nftId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "lastUpdate" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."school_status_enum_old" AS ENUM('active', 'inactive', 'pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" TYPE "public"."school_status_enum_old" USING "status"::"text"::"public"."school_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."school_funds_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."school_status_enum_old" RENAME TO "school_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" DROP COLUMN "contactPerson"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ADD "contactPerson" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "school_funds" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "school_funds" ADD "city" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" DROP COLUMN "province"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_funds" ADD "province" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "name" TYPE character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "currencies" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "units" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "units" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "batchId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."step_type_enum_old" AS ENUM('harvest', 'drying', 'packaging', 'export')`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ALTER COLUMN "stepType" TYPE "public"."step_type_enum_old" USING "stepType"::"text"::"public"."step_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."supply_chain_steps_steptype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."step_type_enum_old" RENAME TO "step_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."batch_status_enum_old" AS ENUM('created', 'processed', 'exported')`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" TYPE "public"."batch_status_enum_old" USING "status"::"text"::"public"."batch_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ALTER COLUMN "status" SET DEFAULT 'created'`,
    );
    await queryRunner.query(`DROP TYPE "public"."batches_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."batch_status_enum_old" RENAME TO "batch_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "productId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "farmerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ALTER COLUMN "harvestAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" SET DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "category"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "category" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "unit"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "unit" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "farmers" DROP COLUMN "state"`);
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD "state" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "farmers" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD "city" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" DROP COLUMN "walletAddress"`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD "walletAddress" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "farmers" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "farmerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ALTER COLUMN "lastUpdate" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "farmerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."loan_status_enum_old" AS ENUM('pending', 'active', 'repaid', 'defaulted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" TYPE "public"."loan_status_enum_old" USING "status"::"text"::"public"."loan_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."micro_loans_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."loan_status_enum_old" RENAME TO "loan_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "cooperatives" DROP COLUMN "leader"`);
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ADD "leader" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "cooperatives" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "cooperatives" ADD "name" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "UQ_76d91dfd154f64ba94da6cc7402" UNIQUE ("adaAddress")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."owner_type_enum_old" AS ENUM('farmer', 'buyer', 'cooperative')`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "ownerType" TYPE "public"."owner_type_enum_old" USING "ownerType"::"text"::"public"."owner_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."wallets_ownertype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."owner_type_enum_old" RENAME TO "owner_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" DROP CONSTRAINT "PK_315b89993d065d6cffdff26ba5a"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_batch_harvests" ON "batch_harvests" ("batchId", "harvestId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_walletAddress" ON "users" ("walletAddress") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_googleId" ON "users" ("googleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_phone" ON "users" ("phone") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_authProvider" ON "users" ("authProvider") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_status" ON "users" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_role" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mobile_money_status" ON "mobile_money_transactions" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_status" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_buyerId" ON "orders" ("buyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_marketplace_items_status" ON "marketplace_items" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_marketplace_items_farmerId" ON "marketplace_items" ("farmerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_nfts_status" ON "nfts" ("status") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_nfts_type" ON "nfts" ("type") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_nfts_creatorId" ON "nfts" ("creatorId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_nft_purchases_transactionHash" ON "nft_purchases" ("transactionHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_nft_purchases_buyerId" ON "nft_purchases" ("buyerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_school_funds_status" ON "school_funds" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_school_funds_province" ON "school_funds" ("province") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_isActive" ON "categories" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_categories_name" ON "categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_currencies_isActive" ON "currencies" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_currencies_code" ON "currencies" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_units_isActive" ON "units" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_units_name" ON "units" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_supply_chain_steps_batchId" ON "supply_chain_steps" ("batchId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_harvests_productId" ON "harvests" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_harvests_farmerId" ON "harvests" ("farmerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_originCountry" ON "products" ("originCountry") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_isActive" ON "products" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_category" ON "products" ("category") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_products_sku" ON "products" ("sku") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_name" ON "products" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_farmers_cooperativeId" ON "farmers" ("cooperativeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_credit_scores_score" ON "credit_scores" ("score") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_micro_loans_status" ON "micro_loans" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_micro_loans_farmerId" ON "micro_loans" ("farmerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cooperatives_name" ON "cooperatives" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wallets_owner" ON "wallets" ("ownerType", "ownerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_wallets_ownerId" ON "wallets" ("ownerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" ADD CONSTRAINT "FK_batch_harvests_harvest" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_harvests" ADD CONSTRAINT "FK_batch_harvests_batch" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_item" FOREIGN KEY ("itemId") REFERENCES "marketplace_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ADD CONSTRAINT "FK_marketplace_items_farmer" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "marketplace_items" ADD CONSTRAINT "FK_marketplace_items_batch" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "nft_purchases" ADD CONSTRAINT "FK_nft_purchases_nft" FOREIGN KEY ("nftId") REFERENCES "nfts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "supply_chain_steps" ADD CONSTRAINT "FK_supply_chain_steps_batch" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_harvests_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "harvests" ADD CONSTRAINT "FK_harvests_farmer" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "farmers" ADD CONSTRAINT "FK_farmers_cooperative" FOREIGN KEY ("cooperativeId") REFERENCES "cooperatives"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "credit_scores" ADD CONSTRAINT "FK_credit_scores_farmer" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "micro_loans" ADD CONSTRAINT "FK_micro_loans_farmer" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
