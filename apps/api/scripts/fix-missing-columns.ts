import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'mkulimachain',
  entities: [],
  synchronize: false,
  logging: false,
});

async function columnExists(
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const result = await AppDataSource.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [tableName, columnName],
  );
  return result.length > 0;
}

async function fixMissingColumns() {
  try {
    console.log('Connexion à la base de données...');
    await AppDataSource.initialize();

    console.log('\n🔍 Vérification et ajout des colonnes manquantes...\n');

    // ==========================================
    // TABLE: farmers
    // ==========================================
    console.log('📋 Vérification de la table farmers...');

    // Créer l'enum farmer_status_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "farmer_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type farmer_status_enum vérifié/créé');

    // Créer l'enum farmer_gender_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "farmer_gender_enum" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type farmer_gender_enum vérifié/créé');

    // Créer l'enum farmer_identification_type_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "farmer_identification_type_enum" AS ENUM ('cni', 'passport', 'driving_license', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type farmer_identification_type_enum vérifié/créé');

    // dateOfBirth
    if (!(await columnExists('farmers', 'dateOfBirth'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "dateOfBirth" DATE`,
      );
      console.log('✅ Colonne dateOfBirth ajoutée');
    } else {
      console.log('ℹ️  Colonne dateOfBirth existe déjà');
    }

    // status
    if (!(await columnExists('farmers', 'status'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "status" farmer_status_enum DEFAULT 'active'`,
      );
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('ℹ️  Colonne status existe déjà');
    }

    // photoUrl
    if (!(await columnExists('farmers', 'photoUrl'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "photoUrl" VARCHAR(500)`,
      );
      console.log('✅ Colonne photoUrl ajoutée');
    } else {
      console.log('ℹ️  Colonne photoUrl existe déjà');
    }

    // gender
    if (!(await columnExists('farmers', 'gender'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "gender" farmer_gender_enum`,
      );
      console.log('✅ Colonne gender ajoutée');
    } else {
      console.log('ℹ️  Colonne gender existe déjà');
    }

    // identificationNumber
    if (!(await columnExists('farmers', 'identificationNumber'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "identificationNumber" VARCHAR(50)`,
      );
      console.log('✅ Colonne identificationNumber ajoutée');
    } else {
      console.log('ℹ️  Colonne identificationNumber existe déjà');
    }

    // identificationType
    if (!(await columnExists('farmers', 'identificationType'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "identificationType" farmer_identification_type_enum`,
      );
      console.log('✅ Colonne identificationType ajoutée');
    } else {
      console.log('ℹ️  Colonne identificationType existe déjà');
    }

    // notes
    if (!(await columnExists('farmers', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // verified
    if (!(await columnExists('farmers', 'verified'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "verified" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne verified ajoutée');
    } else {
      console.log('ℹ️  Colonne verified existe déjà');
    }

    // verifiedAt
    if (!(await columnExists('farmers', 'verifiedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "verifiedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne verifiedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedAt existe déjà');
    }

    // verifiedBy
    if (!(await columnExists('farmers', 'verifiedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE farmers ADD COLUMN "verifiedBy" UUID`,
      );
      console.log('✅ Colonne verifiedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedBy existe déjà');
    }

    // ==========================================
    // TABLE: cooperatives
    // ==========================================
    console.log('\n📋 Vérification de la table cooperatives...');

    // Créer l'enum cooperative_status_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "cooperative_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type cooperative_status_enum vérifié/créé');

    // status
    if (!(await columnExists('cooperatives', 'status'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "status" cooperative_status_enum DEFAULT 'active'`,
      );
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('ℹ️  Colonne status existe déjà');
    }

    // logoUrl
    if (!(await columnExists('cooperatives', 'logoUrl'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "logoUrl" VARCHAR(500)`,
      );
      console.log('✅ Colonne logoUrl ajoutée');
    } else {
      console.log('ℹ️  Colonne logoUrl existe déjà');
    }

    // description
    if (!(await columnExists('cooperatives', 'description'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "description" TEXT`,
      );
      console.log('✅ Colonne description ajoutée');
    } else {
      console.log('ℹ️  Colonne description existe déjà');
    }

    // registrationNumber
    if (!(await columnExists('cooperatives', 'registrationNumber'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "registrationNumber" VARCHAR(100)`,
      );
      console.log('✅ Colonne registrationNumber ajoutée');
    } else {
      console.log('ℹ️  Colonne registrationNumber existe déjà');
    }

    // foundedDate
    if (!(await columnExists('cooperatives', 'foundedDate'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "foundedDate" DATE`,
      );
      console.log('✅ Colonne foundedDate ajoutée');
    } else {
      console.log('ℹ️  Colonne foundedDate existe déjà');
    }

    // memberCount
    if (!(await columnExists('cooperatives', 'memberCount'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "memberCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne memberCount ajoutée');
    } else {
      console.log('ℹ️  Colonne memberCount existe déjà');
    }

    // notes
    if (!(await columnExists('cooperatives', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // verified
    if (!(await columnExists('cooperatives', 'verified'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "verified" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne verified ajoutée');
    } else {
      console.log('ℹ️  Colonne verified existe déjà');
    }

    // verifiedAt
    if (!(await columnExists('cooperatives', 'verifiedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "verifiedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne verifiedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedAt existe déjà');
    }

    // verifiedBy
    if (!(await columnExists('cooperatives', 'verifiedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "verifiedBy" UUID`,
      );
      console.log('✅ Colonne verifiedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedBy existe déjà');
    }

    // latitude
    if (!(await columnExists('cooperatives', 'latitude'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "latitude" DECIMAL(10,7)`,
      );
      console.log('✅ Colonne latitude ajoutée');
    } else {
      console.log('ℹ️  Colonne latitude existe déjà');
    }

    // longitude
    if (!(await columnExists('cooperatives', 'longitude'))) {
      await AppDataSource.query(
        `ALTER TABLE cooperatives ADD COLUMN "longitude" DECIMAL(10,7)`,
      );
      console.log('✅ Colonne longitude ajoutée');
    } else {
      console.log('ℹ️  Colonne longitude existe déjà');
    }

    // ==========================================
    // TABLE: harvests
    // ==========================================
    console.log('\n📋 Vérification de la table harvests...');

    // Créer l'enum harvest_status_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "harvest_status_enum" AS ENUM ('pending', 'verified', 'rejected', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type harvest_status_enum vérifié/créé');

    // status
    if (!(await columnExists('harvests', 'status'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "status" harvest_status_enum DEFAULT 'pending'`,
      );
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('ℹ️  Colonne status existe déjà');
    }

    // verified
    if (!(await columnExists('harvests', 'verified'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "verified" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne verified ajoutée');
    } else {
      console.log('ℹ️  Colonne verified existe déjà');
    }

    // verifiedAt
    if (!(await columnExists('harvests', 'verifiedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "verifiedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne verifiedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedAt existe déjà');
    }

    // verifiedBy
    if (!(await columnExists('harvests', 'verifiedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "verifiedBy" UUID`,
      );
      console.log('✅ Colonne verifiedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedBy existe déjà');
    }

    // unit
    if (!(await columnExists('harvests', 'unit'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "unit" VARCHAR(20) DEFAULT 'kg'`,
      );
      console.log('✅ Colonne unit ajoutée');
    } else {
      console.log('ℹ️  Colonne unit existe déjà');
    }

    // quality
    if (!(await columnExists('harvests', 'quality'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "quality" VARCHAR(50)`,
      );
      console.log('✅ Colonne quality ajoutée');
    } else {
      console.log('ℹ️  Colonne quality existe déjà');
    }

    // notes
    if (!(await columnExists('harvests', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // photos
    if (!(await columnExists('harvests', 'photos'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "photos" JSONB`,
      );
      console.log('✅ Colonne photos ajoutée');
    } else {
      console.log('ℹ️  Colonne photos existe déjà');
    }

    // weatherConditions
    if (!(await columnExists('harvests', 'weatherConditions'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "weatherConditions" VARCHAR(255)`,
      );
      console.log('✅ Colonne weatherConditions ajoutée');
    } else {
      console.log('ℹ️  Colonne weatherConditions existe déjà');
    }

    // harvestMethod
    if (!(await columnExists('harvests', 'harvestMethod'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "harvestMethod" VARCHAR(100)`,
      );
      console.log('✅ Colonne harvestMethod ajoutée');
    } else {
      console.log('ℹ️  Colonne harvestMethod existe déjà');
    }

    // storageLocation
    if (!(await columnExists('harvests', 'storageLocation'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "storageLocation" VARCHAR(255)`,
      );
      console.log('✅ Colonne storageLocation ajoutée');
    } else {
      console.log('ℹ️  Colonne storageLocation existe déjà');
    }

    // batchNumber
    if (!(await columnExists('harvests', 'batchNumber'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "batchNumber" VARCHAR(100)`,
      );
      console.log('✅ Colonne batchNumber ajoutée');
    } else {
      console.log('ℹ️  Colonne batchNumber existe déjà');
    }

    // certification
    if (!(await columnExists('harvests', 'certification'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "certification" VARCHAR(255)`,
      );
      console.log('✅ Colonne certification ajoutée');
    } else {
      console.log('ℹ️  Colonne certification existe déjà');
    }

    // estimatedValue
    if (!(await columnExists('harvests', 'estimatedValue'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "estimatedValue" DECIMAL(12,2)`,
      );
      console.log('✅ Colonne estimatedValue ajoutée');
    } else {
      console.log('ℹ️  Colonne estimatedValue existe déjà');
    }

    // cooperativeId
    if (!(await columnExists('harvests', 'cooperativeId'))) {
      await AppDataSource.query(
        `ALTER TABLE harvests ADD COLUMN "cooperativeId" UUID`,
      );
      console.log('✅ Colonne cooperativeId ajoutée');
    } else {
      console.log('ℹ️  Colonne cooperativeId existe déjà');
    }

    // ==========================================
    // TABLE: products
    // ==========================================
    console.log('\n📋 Vérification de la table products...');

    // Créer l'enum product_status_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "product_status_enum" AS ENUM('active', 'inactive', 'out_of_stock', 'discontinued');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type product_status_enum vérifié/créé');

    // status
    if (!(await columnExists('products', 'status'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "status" product_status_enum DEFAULT 'active'`,
      );
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('ℹ️  Colonne status existe déjà');
    }

    // verified
    if (!(await columnExists('products', 'verified'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "verified" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne verified ajoutée');
    } else {
      console.log('ℹ️  Colonne verified existe déjà');
    }

    // verifiedAt
    if (!(await columnExists('products', 'verifiedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "verifiedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne verifiedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedAt existe déjà');
    }

    // verifiedBy
    if (!(await columnExists('products', 'verifiedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "verifiedBy" UUID`,
      );
      console.log('✅ Colonne verifiedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedBy existe déjà');
    }

    // barcode
    if (!(await columnExists('products', 'barcode'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "barcode" VARCHAR(50)`,
      );
      console.log('✅ Colonne barcode ajoutée');
    } else {
      console.log('ℹ️  Colonne barcode existe déjà');
    }

    // weight
    if (!(await columnExists('products', 'weight'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "weight" DECIMAL(10,2)`,
      );
      console.log('✅ Colonne weight ajoutée');
    } else {
      console.log('ℹ️  Colonne weight existe déjà');
    }

    // dimensions
    if (!(await columnExists('products', 'dimensions'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "dimensions" VARCHAR(100)`,
      );
      console.log('✅ Colonne dimensions ajoutée');
    } else {
      console.log('ℹ️  Colonne dimensions existe déjà');
    }

    // expiryDate
    if (!(await columnExists('products', 'expiryDate'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "expiryDate" DATE`,
      );
      console.log('✅ Colonne expiryDate ajoutée');
    } else {
      console.log('ℹ️  Colonne expiryDate existe déjà');
    }

    // minStockLevel
    if (!(await columnExists('products', 'minStockLevel'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "minStockLevel" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne minStockLevel ajoutée');
    } else {
      console.log('ℹ️  Colonne minStockLevel existe déjà');
    }

    // maxStockLevel
    if (!(await columnExists('products', 'maxStockLevel'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "maxStockLevel" INTEGER`,
      );
      console.log('✅ Colonne maxStockLevel ajoutée');
    } else {
      console.log('ℹ️  Colonne maxStockLevel existe déjà');
    }

    // supplier
    if (!(await columnExists('products', 'supplier'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "supplier" VARCHAR(255)`,
      );
      console.log('✅ Colonne supplier ajoutée');
    } else {
      console.log('ℹ️  Colonne supplier existe déjà');
    }

    // notes
    if (!(await columnExists('products', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // rating
    if (!(await columnExists('products', 'rating'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "rating" DECIMAL(3,2)`,
      );
      console.log('✅ Colonne rating ajoutée');
    } else {
      console.log('ℹ️  Colonne rating existe déjà');
    }

    // reviewCount
    if (!(await columnExists('products', 'reviewCount'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "reviewCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne reviewCount ajoutée');
    } else {
      console.log('ℹ️  Colonne reviewCount existe déjà');
    }

    // tags
    if (!(await columnExists('products', 'tags'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "tags" JSONB`,
      );
      console.log('✅ Colonne tags ajoutée');
    } else {
      console.log('ℹ️  Colonne tags existe déjà');
    }

    // image
    if (!(await columnExists('products', 'image'))) {
      await AppDataSource.query(
        `ALTER TABLE products ADD COLUMN "image" JSONB`,
      );
      console.log('✅ Colonne image ajoutée');
    } else {
      console.log('ℹ️  Colonne image existe déjà');
    }

    // ==========================================
    // TABLE: batches
    // ==========================================
    console.log('\n📋 Vérification de la table batches...');

    // name
    if (!(await columnExists('batches', 'name'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "name" VARCHAR(255)`,
      );
      console.log('✅ Colonne name ajoutée');
    } else {
      console.log('ℹ️  Colonne name existe déjà');
    }

    // description
    if (!(await columnExists('batches', 'description'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "description" TEXT`,
      );
      console.log('✅ Colonne description ajoutée');
    } else {
      console.log('ℹ️  Colonne description existe déjà');
    }

    // totalQuantity
    if (!(await columnExists('batches', 'totalQuantity'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "totalQuantity" DECIMAL(12,2)`,
      );
      console.log('✅ Colonne totalQuantity ajoutée');
    } else {
      console.log('ℹ️  Colonne totalQuantity existe déjà');
    }

    // totalWeight
    if (!(await columnExists('batches', 'totalWeight'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "totalWeight" DECIMAL(12,2)`,
      );
      console.log('✅ Colonne totalWeight ajoutée');
    } else {
      console.log('ℹ️  Colonne totalWeight existe déjà');
    }

    // unit
    if (!(await columnExists('batches', 'unit'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "unit" VARCHAR(20) DEFAULT 'kg'`,
      );
      console.log('✅ Colonne unit ajoutée');
    } else {
      console.log('ℹ️  Colonne unit existe déjà');
    }

    // productionDate
    if (!(await columnExists('batches', 'productionDate'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "productionDate" TIMESTAMP`,
      );
      console.log('✅ Colonne productionDate ajoutée');
    } else {
      console.log('ℹ️  Colonne productionDate existe déjà');
    }

    // expirationDate
    if (!(await columnExists('batches', 'expirationDate'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "expirationDate" TIMESTAMP`,
      );
      console.log('✅ Colonne expirationDate ajoutée');
    } else {
      console.log('ℹ️  Colonne expirationDate existe déjà');
    }

    // verified
    if (!(await columnExists('batches', 'verified'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "verified" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne verified ajoutée');
    } else {
      console.log('ℹ️  Colonne verified existe déjà');
    }

    // verifiedAt
    if (!(await columnExists('batches', 'verifiedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "verifiedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne verifiedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedAt existe déjà');
    }

    // verifiedBy
    if (!(await columnExists('batches', 'verifiedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "verifiedBy" UUID`,
      );
      console.log('✅ Colonne verifiedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne verifiedBy existe déjà');
    }

    // quality
    if (!(await columnExists('batches', 'quality'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "quality" VARCHAR(50)`,
      );
      console.log('✅ Colonne quality ajoutée');
    } else {
      console.log('ℹ️  Colonne quality existe déjà');
    }

    // notes
    if (!(await columnExists('batches', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // photos
    if (!(await columnExists('batches', 'photos'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "photos" JSONB`,
      );
      console.log('✅ Colonne photos ajoutée');
    } else {
      console.log('ℹ️  Colonne photos existe déjà');
    }

    // originLocation
    if (!(await columnExists('batches', 'originLocation'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "originLocation" VARCHAR(255)`,
      );
      console.log('✅ Colonne originLocation ajoutée');
    } else {
      console.log('ℹ️  Colonne originLocation existe déjà');
    }

    // destinationLocation
    if (!(await columnExists('batches', 'destinationLocation'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "destinationLocation" VARCHAR(255)`,
      );
      console.log('✅ Colonne destinationLocation ajoutée');
    } else {
      console.log('ℹ️  Colonne destinationLocation existe déjà');
    }

    // certification
    if (!(await columnExists('batches', 'certification'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "certification" VARCHAR(255)`,
      );
      console.log('✅ Colonne certification ajoutée');
    } else {
      console.log('ℹ️  Colonne certification existe déjà');
    }

    // estimatedValue
    if (!(await columnExists('batches', 'estimatedValue'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "estimatedValue" DECIMAL(12,2)`,
      );
      console.log('✅ Colonne estimatedValue ajoutée');
    } else {
      console.log('ℹ️  Colonne estimatedValue existe déjà');
    }

    // cooperativeId
    if (!(await columnExists('batches', 'cooperativeId'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "cooperativeId" UUID`,
      );
      console.log('✅ Colonne cooperativeId ajoutée');
    } else {
      console.log('ℹ️  Colonne cooperativeId existe déjà');
    }

    // farmerId
    if (!(await columnExists('batches', 'farmerId'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "farmerId" UUID`,
      );
      console.log('✅ Colonne farmerId ajoutée');
    } else {
      console.log('ℹ️  Colonne farmerId existe déjà');
    }

    // productId
    if (!(await columnExists('batches', 'productId'))) {
      await AppDataSource.query(
        `ALTER TABLE batches ADD COLUMN "productId" UUID`,
      );
      console.log('✅ Colonne productId ajoutée');
    } else {
      console.log('ℹ️  Colonne productId existe déjà');
    }

    // ==========================================
    // TABLE: marketplace_items
    // ==========================================
    console.log('\n📋 Vérification de la table marketplace_items...');

    // Créer l'enum marketplace_item_status_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "marketplace_item_status_enum" AS ENUM('draft', 'active', 'sold_out', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type marketplace_item_status_enum vérifié/créé');

    // status
    if (!(await columnExists('marketplace_items', 'status'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "status" marketplace_item_status_enum DEFAULT 'draft'`,
      );
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('ℹ️  Colonne status existe déjà');
    }

    // sku
    if (!(await columnExists('marketplace_items', 'sku'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "sku" VARCHAR(100)`,
      );
      console.log('✅ Colonne sku ajoutée');
    } else {
      console.log('ℹ️  Colonne sku existe déjà');
    }

    // category
    if (!(await columnExists('marketplace_items', 'category'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "category" VARCHAR(100)`,
      );
      console.log('✅ Colonne category ajoutée');
    } else {
      console.log('ℹ️  Colonne category existe déjà');
    }

    // tags
    if (!(await columnExists('marketplace_items', 'tags'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "tags" TEXT[]`,
      );
      console.log('✅ Colonne tags ajoutée');
    } else {
      console.log('ℹ️  Colonne tags existe déjà');
    }

    // photos
    if (!(await columnExists('marketplace_items', 'photos'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "photos" JSONB`,
      );
      console.log('✅ Colonne photos ajoutée');
    } else {
      console.log('ℹ️  Colonne photos existe déjà');
    }

    // minOrderKg
    if (!(await columnExists('marketplace_items', 'minOrderKg'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "minOrderKg" DECIMAL(10,2)`,
      );
      console.log('✅ Colonne minOrderKg ajoutée');
    } else {
      console.log('ℹ️  Colonne minOrderKg existe déjà');
    }

    // maxOrderKg
    if (!(await columnExists('marketplace_items', 'maxOrderKg'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "maxOrderKg" DECIMAL(10,2)`,
      );
      console.log('✅ Colonne maxOrderKg ajoutée');
    } else {
      console.log('ℹ️  Colonne maxOrderKg existe déjà');
    }

    // shippingCostADA
    if (!(await columnExists('marketplace_items', 'shippingCostADA'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "shippingCostADA" DECIMAL(18,6)`,
      );
      console.log('✅ Colonne shippingCostADA ajoutée');
    } else {
      console.log('ℹ️  Colonne shippingCostADA existe déjà');
    }

    // location
    if (!(await columnExists('marketplace_items', 'location'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "location" VARCHAR(255)`,
      );
      console.log('✅ Colonne location ajoutée');
    } else {
      console.log('ℹ️  Colonne location existe déjà');
    }

    // certifications
    if (!(await columnExists('marketplace_items', 'certifications'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "certifications" TEXT[]`,
      );
      console.log('✅ Colonne certifications ajoutée');
    } else {
      console.log('ℹ️  Colonne certifications existe déjà');
    }

    // rating
    if (!(await columnExists('marketplace_items', 'rating'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "rating" DECIMAL(3,2)`,
      );
      console.log('✅ Colonne rating ajoutée');
    } else {
      console.log('ℹ️  Colonne rating existe déjà');
    }

    // reviewCount
    if (!(await columnExists('marketplace_items', 'reviewCount'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "reviewCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne reviewCount ajoutée');
    } else {
      console.log('ℹ️  Colonne reviewCount existe déjà');
    }

    // views
    if (!(await columnExists('marketplace_items', 'views'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "views" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne views ajoutée');
    } else {
      console.log('ℹ️  Colonne views existe déjà');
    }

    // salesCount
    if (!(await columnExists('marketplace_items', 'salesCount'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "salesCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne salesCount ajoutée');
    } else {
      console.log('ℹ️  Colonne salesCount existe déjà');
    }

    // notes
    if (!(await columnExists('marketplace_items', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // featured
    if (!(await columnExists('marketplace_items', 'featured'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "featured" BOOLEAN DEFAULT false`,
      );
      console.log('✅ Colonne featured ajoutée');
    } else {
      console.log('ℹ️  Colonne featured existe déjà');
    }

    // expiresAt
    if (!(await columnExists('marketplace_items', 'expiresAt'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "expiresAt" TIMESTAMP`,
      );
      console.log('✅ Colonne expiresAt ajoutée');
    } else {
      console.log('ℹ️  Colonne expiresAt existe déjà');
    }

    // cooperativeId
    if (!(await columnExists('marketplace_items', 'cooperativeId'))) {
      await AppDataSource.query(
        `ALTER TABLE marketplace_items ADD COLUMN "cooperativeId" UUID`,
      );
      console.log('✅ Colonne cooperativeId ajoutée');
    } else {
      console.log('ℹ️  Colonne cooperativeId existe déjà');
    }

    // ==========================================
    // TABLE: orders
    // ==========================================
    console.log('\n📋 Vérification de la table orders...');

    // Créer l'enum order_priority_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "order_priority_enum" AS ENUM('low', 'normal', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type order_priority_enum vérifié/créé');

    // orderNumber
    if (!(await columnExists('orders', 'orderNumber'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "orderNumber" VARCHAR(50) UNIQUE`,
      );
      console.log('✅ Colonne orderNumber ajoutée');
    } else {
      console.log('ℹ️  Colonne orderNumber existe déjà');
    }

    // notes
    if (!(await columnExists('orders', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // shippingCostADA
    if (!(await columnExists('orders', 'shippingCostADA'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "shippingCostADA" DECIMAL(18,6) DEFAULT 0`,
      );
      console.log('✅ Colonne shippingCostADA ajoutée');
    } else {
      console.log('ℹ️  Colonne shippingCostADA existe déjà');
    }

    // discountADA
    if (!(await columnExists('orders', 'discountADA'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "discountADA" DECIMAL(18,6) DEFAULT 0`,
      );
      console.log('✅ Colonne discountADA ajoutée');
    } else {
      console.log('ℹ️  Colonne discountADA existe déjà');
    }

    // taxADA
    if (!(await columnExists('orders', 'taxADA'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "taxADA" DECIMAL(18,6) DEFAULT 0`,
      );
      console.log('✅ Colonne taxADA ajoutée');
    } else {
      console.log('ℹ️  Colonne taxADA existe déjà');
    }

    // cancelledAt
    if (!(await columnExists('orders', 'cancelledAt'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "cancelledAt" TIMESTAMP`,
      );
      console.log('✅ Colonne cancelledAt ajoutée');
    } else {
      console.log('ℹ️  Colonne cancelledAt existe déjà');
    }

    // cancelledBy
    if (!(await columnExists('orders', 'cancelledBy'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "cancelledBy" UUID`,
      );
      console.log('✅ Colonne cancelledBy ajoutée');
    } else {
      console.log('ℹ️  Colonne cancelledBy existe déjà');
    }

    // cancellationReason
    if (!(await columnExists('orders', 'cancellationReason'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "cancellationReason" TEXT`,
      );
      console.log('✅ Colonne cancellationReason ajoutée');
    } else {
      console.log('ℹ️  Colonne cancellationReason existe déjà');
    }

    // refundedAt
    if (!(await columnExists('orders', 'refundedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "refundedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne refundedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne refundedAt existe déjà');
    }

    // refundHash
    if (!(await columnExists('orders', 'refundHash'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "refundHash" VARCHAR(255)`,
      );
      console.log('✅ Colonne refundHash ajoutée');
    } else {
      console.log('ℹ️  Colonne refundHash existe déjà');
    }

    // estimatedDeliveryDate
    if (!(await columnExists('orders', 'estimatedDeliveryDate'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "estimatedDeliveryDate" TIMESTAMP`,
      );
      console.log('✅ Colonne estimatedDeliveryDate ajoutée');
    } else {
      console.log('ℹ️  Colonne estimatedDeliveryDate existe déjà');
    }

    // deliveryMethod
    if (!(await columnExists('orders', 'deliveryMethod'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "deliveryMethod" VARCHAR(50)`,
      );
      console.log('✅ Colonne deliveryMethod ajoutée');
    } else {
      console.log('ℹ️  Colonne deliveryMethod existe déjà');
    }

    // buyerNotes
    if (!(await columnExists('orders', 'buyerNotes'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "buyerNotes" TEXT`,
      );
      console.log('✅ Colonne buyerNotes ajoutée');
    } else {
      console.log('ℹ️  Colonne buyerNotes existe déjà');
    }

    // internalNotes
    if (!(await columnExists('orders', 'internalNotes'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "internalNotes" TEXT`,
      );
      console.log('✅ Colonne internalNotes ajoutée');
    } else {
      console.log('ℹ️  Colonne internalNotes existe déjà');
    }

    // priority
    if (!(await columnExists('orders', 'priority'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "priority" order_priority_enum DEFAULT 'normal'`,
      );
      console.log('✅ Colonne priority ajoutée');
    } else {
      console.log('ℹ️  Colonne priority existe déjà');
    }

    // tags
    if (!(await columnExists('orders', 'tags'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "tags" TEXT[]`,
      );
      console.log('✅ Colonne tags ajoutée');
    } else {
      console.log('ℹ️  Colonne tags existe déjà');
    }

    // cooperativeId
    if (!(await columnExists('orders', 'cooperativeId'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "cooperativeId" UUID`,
      );
      console.log('✅ Colonne cooperativeId ajoutée');
    } else {
      console.log('ℹ️  Colonne cooperativeId existe déjà');
    }

    // farmerId
    if (!(await columnExists('orders', 'farmerId'))) {
      await AppDataSource.query(
        `ALTER TABLE orders ADD COLUMN "farmerId" UUID`,
      );
      console.log('✅ Colonne farmerId ajoutée');
    } else {
      console.log('ℹ️  Colonne farmerId existe déjà');
    }

    // ==========================================
    // TABLE: micro_loans
    // ==========================================
    console.log('\n📋 Vérification de la table micro_loans...');

    // notes
    if (!(await columnExists('micro_loans', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // approvedBy
    if (!(await columnExists('micro_loans', 'approvedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "approvedBy" UUID`,
      );
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_micro_loans_approvedBy" ON micro_loans("approvedBy")`,
      );
      console.log('✅ Colonne approvedBy ajoutée avec index');
    } else {
      console.log('ℹ️  Colonne approvedBy existe déjà');
    }

    // approvedAt
    if (!(await columnExists('micro_loans', 'approvedAt'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "approvedAt" TIMESTAMP`,
      );
      console.log('✅ Colonne approvedAt ajoutée');
    } else {
      console.log('ℹ️  Colonne approvedAt existe déjà');
    }

    // rejectionReason
    if (!(await columnExists('micro_loans', 'rejectionReason'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "rejectionReason" TEXT`,
      );
      console.log('✅ Colonne rejectionReason ajoutée');
    } else {
      console.log('ℹ️  Colonne rejectionReason existe déjà');
    }

    // penaltyRate
    if (!(await columnExists('micro_loans', 'penaltyRate'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "penaltyRate" DECIMAL(5,2) DEFAULT 0`,
      );
      console.log('✅ Colonne penaltyRate ajoutée');
    } else {
      console.log('ℹ️  Colonne penaltyRate existe déjà');
    }

    // totalRepaymentAmount
    if (!(await columnExists('micro_loans', 'totalRepaymentAmount'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "totalRepaymentAmount" DECIMAL(18,6)`,
      );
      console.log('✅ Colonne totalRepaymentAmount ajoutée');
    } else {
      console.log('ℹ️  Colonne totalRepaymentAmount existe déjà');
    }

    // remainingAmount
    if (!(await columnExists('micro_loans', 'remainingAmount'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "remainingAmount" DECIMAL(18,6)`,
      );
      console.log('✅ Colonne remainingAmount ajoutée');
    } else {
      console.log('ℹ️  Colonne remainingAmount existe déjà');
    }

    // lastPaymentDate
    if (!(await columnExists('micro_loans', 'lastPaymentDate'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "lastPaymentDate" TIMESTAMP`,
      );
      console.log('✅ Colonne lastPaymentDate ajoutée');
    } else {
      console.log('ℹ️  Colonne lastPaymentDate existe déjà');
    }

    // paymentCount
    if (!(await columnExists('micro_loans', 'paymentCount'))) {
      await AppDataSource.query(
        `ALTER TABLE micro_loans ADD COLUMN "paymentCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne paymentCount ajoutée');
    } else {
      console.log('ℹ️  Colonne paymentCount existe déjà');
    }

    // Index composite status + farmerId
    try {
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_micro_loans_status_farmerId" ON micro_loans("status", "farmerId")`,
      );
      console.log('✅ Index composite status_farmerId créé/vérifié');
    } catch (error) {
      console.log('ℹ️  Index composite status_farmerId existe déjà ou erreur');
    }

    // ==========================================
    // TABLE: credit_scores
    // ==========================================
    console.log('\n📋 Vérification de la table credit_scores...');

    // Créer l'enum risk_level_enum si nécessaire
    await AppDataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "risk_level_enum" AS ENUM ('low', 'medium', 'high', 'very_high');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ Type risk_level_enum vérifié/créé');

    // riskLevel
    if (!(await columnExists('credit_scores', 'riskLevel'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "riskLevel" risk_level_enum DEFAULT 'medium'`,
      );
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_credit_scores_riskLevel" ON credit_scores("riskLevel")`,
      );
      console.log('✅ Colonne riskLevel ajoutée avec index');
    } else {
      console.log('ℹ️  Colonne riskLevel existe déjà');
    }

    // lastLoanDate
    if (!(await columnExists('credit_scores', 'lastLoanDate'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "lastLoanDate" TIMESTAMP`,
      );
      console.log('✅ Colonne lastLoanDate ajoutée');
    } else {
      console.log('ℹ️  Colonne lastLoanDate existe déjà');
    }

    // totalLoansCount
    if (!(await columnExists('credit_scores', 'totalLoansCount'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "totalLoansCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne totalLoansCount ajoutée');
    } else {
      console.log('ℹ️  Colonne totalLoansCount existe déjà');
    }

    // repaidLoansCount
    if (!(await columnExists('credit_scores', 'repaidLoansCount'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "repaidLoansCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne repaidLoansCount ajoutée');
    } else {
      console.log('ℹ️  Colonne repaidLoansCount existe déjà');
    }

    // defaultedLoansCount
    if (!(await columnExists('credit_scores', 'defaultedLoansCount'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "defaultedLoansCount" INTEGER DEFAULT 0`,
      );
      console.log('✅ Colonne defaultedLoansCount ajoutée');
    } else {
      console.log('ℹ️  Colonne defaultedLoansCount existe déjà');
    }

    // averageLoanAmount
    if (!(await columnExists('credit_scores', 'averageLoanAmount'))) {
      await AppDataSource.query(
        `ALTER TABLE credit_scores ADD COLUMN "averageLoanAmount" DECIMAL(18,6) DEFAULT 0`,
      );
      console.log('✅ Colonne averageLoanAmount ajoutée');
    } else {
      console.log('ℹ️  Colonne averageLoanAmount existe déjà');
    }

    // Index composite score + riskLevel
    try {
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_credit_scores_score_riskLevel" ON credit_scores("score", "riskLevel")`,
      );
      console.log('✅ Index composite score_riskLevel créé/vérifié');
    } catch (error) {
      console.log('ℹ️  Index composite score_riskLevel existe déjà ou erreur');
    }

    // ==========================================
    // TABLE: mobile_money_transactions
    // ==========================================
    console.log('\n📋 Vérification de la table mobile_money_transactions...');

    // farmerId
    if (!(await columnExists('mobile_money_transactions', 'farmerId'))) {
      await AppDataSource.query(
        `ALTER TABLE mobile_money_transactions ADD COLUMN "farmerId" UUID`,
      );
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_mobile_money_farmerId" ON mobile_money_transactions("farmerId")`,
      );
      // Foreign key (optionnel, peut échouer si la table farmers n'existe pas encore)
      try {
        await AppDataSource.query(
          `ALTER TABLE mobile_money_transactions ADD CONSTRAINT "FK_mobile_money_farmer" FOREIGN KEY ("farmerId") REFERENCES farmers("id") ON DELETE SET NULL`,
        );
        console.log('✅ Colonne farmerId ajoutée avec index et foreign key');
      } catch (error) {
        console.log('✅ Colonne farmerId ajoutée avec index (foreign key ignorée)');
      }
    } else {
      console.log('ℹ️  Colonne farmerId existe déjà');
    }

    // loanId
    if (!(await columnExists('mobile_money_transactions', 'loanId'))) {
      await AppDataSource.query(
        `ALTER TABLE mobile_money_transactions ADD COLUMN "loanId" UUID`,
      );
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_mobile_money_loanId" ON mobile_money_transactions("loanId")`,
      );
      // Foreign key (optionnel)
      try {
        await AppDataSource.query(
          `ALTER TABLE mobile_money_transactions ADD CONSTRAINT "FK_mobile_money_loan" FOREIGN KEY ("loanId") REFERENCES micro_loans("id") ON DELETE SET NULL`,
        );
        console.log('✅ Colonne loanId ajoutée avec index et foreign key');
      } catch (error) {
        console.log('✅ Colonne loanId ajoutée avec index (foreign key ignorée)');
      }
    } else {
      console.log('ℹ️  Colonne loanId existe déjà');
    }

    // notes
    if (!(await columnExists('mobile_money_transactions', 'notes'))) {
      await AppDataSource.query(
        `ALTER TABLE mobile_money_transactions ADD COLUMN "notes" TEXT`,
      );
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('ℹ️  Colonne notes existe déjà');
    }

    // processedBy
    if (!(await columnExists('mobile_money_transactions', 'processedBy'))) {
      await AppDataSource.query(
        `ALTER TABLE mobile_money_transactions ADD COLUMN "processedBy" UUID`,
      );
      console.log('✅ Colonne processedBy ajoutée');
    } else {
      console.log('ℹ️  Colonne processedBy existe déjà');
    }

    // processingTime
    if (!(await columnExists('mobile_money_transactions', 'processingTime'))) {
      await AppDataSource.query(
        `ALTER TABLE mobile_money_transactions ADD COLUMN "processingTime" INTEGER`,
      );
      console.log('✅ Colonne processingTime ajoutée');
    } else {
      console.log('ℹ️  Colonne processingTime existe déjà');
    }

    // Index composite status + createdAt
    try {
      await AppDataSource.query(
        `CREATE INDEX IF NOT EXISTS "IDX_mobile_money_status_createdAt" ON mobile_money_transactions("status", "createdAt")`,
      );
      console.log('✅ Index composite status_createdAt créé/vérifié');
    } catch (error) {
      console.log('ℹ️  Index composite status_createdAt existe déjà ou erreur');
    }

    console.log('\n✅ Toutes les colonnes ont été vérifiées et ajoutées si nécessaire!');
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

fixMissingColumns();

