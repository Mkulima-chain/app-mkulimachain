import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveFarmersTable1765565821261 implements MigrationInterface {
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

    // 1. Ajouter colonne email (optionnel, pour communication)
    if (!(await columnExists('farmers', 'email'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'email',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 2. Ajouter colonne date de naissance
    if (!(await columnExists('farmers', 'dateOfBirth'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'dateOfBirth',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne statut (active, inactive, suspended)
    if (!(await columnExists('farmers', 'status'))) {
      // Créer l'enum si nécessaire
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "farmer_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'status',
          type: 'farmer_status_enum',
          default: "'active'",
        }),
      );
    }

    // 4. Ajouter colonne photo de profil
    if (!(await columnExists('farmers', 'photoUrl'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'photoUrl',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne genre
    if (!(await columnExists('farmers', 'gender'))) {
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "farmer_gender_enum" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'gender',
          type: 'farmer_gender_enum',
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne numéro d'identification (CNI, passeport, etc.)
    if (!(await columnExists('farmers', 'identificationNumber'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'identificationNumber',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne type d'identification
    if (!(await columnExists('farmers', 'identificationType'))) {
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "farmer_identification_type_enum" AS ENUM ('cni', 'passport', 'driving_license', 'other');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'identificationType',
          type: 'farmer_identification_type_enum',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne notes/commentaires
    if (!(await columnExists('farmers', 'notes'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 9. Ajouter colonne vérifié (vérification manuelle)
    if (!(await columnExists('farmers', 'verified'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
        }),
      );
    }

    // 10. Ajouter colonne date de vérification
    if (!(await columnExists('farmers', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne vérifié par (ID utilisateur admin)
    if (!(await columnExists('farmers', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'farmers',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // INDEXES

    // Index sur email (si fourni)
    if (!(await indexExists('farmers', 'IDX_farmers_email'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_email',
          columnNames: ['email'],
          isUnique: false,
        }),
      );
    }

    // Index sur status pour les filtres
    if (!(await indexExists('farmers', 'IDX_farmers_status'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_status',
          columnNames: ['status'],
        }),
      );
    }

    // Index sur verified
    if (!(await indexExists('farmers', 'IDX_farmers_verified'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_verified',
          columnNames: ['verified'],
        }),
      );
    }

    // Index composite sur status et verified
    if (!(await indexExists('farmers', 'IDX_farmers_status_verified'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_status_verified',
          columnNames: ['status', 'verified'],
        }),
      );
    }

    // Index géospatial pour recherches par localisation (PostGIS)
    // Vérifier si PostGIS est disponible AVANT de l'utiliser
    const postgisAvailable = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'postgis'
      ) as available;
    `).then((result: any[]) => result[0]?.available || false);

    if (postgisAvailable) {
      try {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

        // Créer une colonne géométrie pour les recherches spatiales
        if (!(await columnExists('farmers', 'location'))) {
          await queryRunner.query(`
            ALTER TABLE "farmers" 
            ADD COLUMN "location" geometry(Point, 4326);
          `);

          // Remplir la colonne location avec les coordonnées existantes
          await queryRunner.query(`
            UPDATE "farmers" 
            SET "location" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
          `);

          // Créer index spatial GIST pour recherches rapides
          if (!(await indexExists('farmers', 'IDX_farmers_location'))) {
            await queryRunner.query(`
              CREATE INDEX "IDX_farmers_location" 
              ON "farmers" USING GIST ("location");
            `);
          }
        }
      } catch (error) {
        // Si erreur, on continue sans PostGIS (non bloquant)
        console.warn(
          'PostGIS extension not available. Skipping spatial index creation.',
        );
      }
    } else {
      console.warn(
        'PostGIS extension not available. Skipping spatial index creation.',
      );
    }

    // Index sur identificationNumber (si fourni)
    if (!(await indexExists('farmers', 'IDX_farmers_identificationNumber'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_identificationNumber',
          columnNames: ['identificationNumber'],
          isUnique: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    try {
      await queryRunner.dropIndex('farmers', 'IDX_farmers_identificationNumber');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_farmers_location";`);
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('farmers', 'IDX_farmers_status_verified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('farmers', 'IDX_farmers_verified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('farmers', 'IDX_farmers_status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('farmers', 'IDX_farmers_email');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Supprimer les colonnes
    try {
      await queryRunner.dropColumn('farmers', 'verifiedBy');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'verifiedAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'verified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'notes');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'identificationType');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'identificationNumber');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'gender');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'photoUrl');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'dateOfBirth');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'email');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('farmers', 'location');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Supprimer les types enum (seulement si plus utilisés)
    // Note: On ne supprime pas les enums car ils pourraient être utilisés ailleurs
  }
}
