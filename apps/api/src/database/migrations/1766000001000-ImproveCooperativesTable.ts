import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveCooperativesTable1766000001000
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

    // 1. Ajouter colonne email (optionnel, pour communication)
    if (!(await columnExists('cooperatives', 'email'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'email',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 2. Ajouter colonne téléphone
    if (!(await columnExists('cooperatives', 'phone'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'phone',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne statut (active, inactive, suspended, pending_verification)
    if (!(await columnExists('cooperatives', 'status'))) {
      // Créer l'enum si nécessaire
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "cooperative_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'status',
          type: 'cooperative_status_enum',
          default: "'active'",
        }),
      );
    }

    // 4. Ajouter colonne logo/photo
    if (!(await columnExists('cooperatives', 'logoUrl'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'logoUrl',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne description
    if (!(await columnExists('cooperatives', 'description'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 6. Ajouter colonne numéro d'enregistrement légal
    if (!(await columnExists('cooperatives', 'registrationNumber'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'registrationNumber',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 7. Ajouter colonne date de création de la coopérative
    if (!(await columnExists('cooperatives', 'foundedDate'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'foundedDate',
          type: 'date',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne nombre de membres
    if (!(await columnExists('cooperatives', 'memberCount'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'memberCount',
          type: 'integer',
          default: 0,
        }),
      );
    }

    // 9. Ajouter colonne notes/commentaires
    if (!(await columnExists('cooperatives', 'notes'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 10. Ajouter colonne vérifié (vérification manuelle)
    if (!(await columnExists('cooperatives', 'verified'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
        }),
      );
    }

    // 11. Ajouter colonne date de vérification
    if (!(await columnExists('cooperatives', 'verifiedAt'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 12. Ajouter colonne vérifié par (ID utilisateur admin)
    if (!(await columnExists('cooperatives', 'verifiedBy'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 13. Ajouter colonnes latitude et longitude pour localisation précise
    if (!(await columnExists('cooperatives', 'latitude'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'latitude',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
        }),
      );
    }

    if (!(await columnExists('cooperatives', 'longitude'))) {
      await queryRunner.addColumn(
        'cooperatives',
        new TableColumn({
          name: 'longitude',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
        }),
      );
    }

    // INDEXES

    // Index sur email (si fourni)
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_email'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_email',
          columnNames: ['email'],
          isUnique: false,
        }),
      );
    }

    // Index sur phone
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_phone'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_phone',
          columnNames: ['phone'],
          isUnique: false,
        }),
      );
    }

    // Index sur status pour les filtres
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_status'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_status',
          columnNames: ['status'],
        }),
      );
    }

    // Index sur verified
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_verified'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_verified',
          columnNames: ['verified'],
        }),
      );
    }

    // Index composite sur status et verified
    if (!(
      await indexExists('cooperatives', 'IDX_cooperatives_status_verified')
    )) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_status_verified',
          columnNames: ['status', 'verified'],
        }),
      );
    }

    // Index sur registrationNumber (si fourni)
    if (!(
      await indexExists('cooperatives', 'IDX_cooperatives_registrationNumber')
    )) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_registrationNumber',
          columnNames: ['registrationNumber'],
          isUnique: false,
        }),
      );
    }

    // Index sur name pour recherches textuelles
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_name'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_name',
          columnNames: ['name'],
        }),
      );
    }

    // Index sur location pour recherches géographiques
    if (!(await indexExists('cooperatives', 'IDX_cooperatives_location'))) {
      await queryRunner.createIndex(
        'cooperatives',
        new TableIndex({
          name: 'IDX_cooperatives_location',
          columnNames: ['location'],
        }),
      );
    }

    // Index géospatial pour recherches par localisation (PostGIS)
    // Vérifier si PostGIS est disponible AVANT de l'utiliser
    const postgisAvailable = await queryRunner
      .query(
        `
      SELECT EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'postgis'
      ) as available;
    `,
      )
      .then((result: any[]) => result[0]?.available || false);

    if (postgisAvailable) {
      try {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

        // Créer une colonne géométrie pour les recherches spatiales
        if (!(await columnExists('cooperatives', 'locationPoint'))) {
          await queryRunner.query(`
            ALTER TABLE "cooperatives" 
            ADD COLUMN "locationPoint" geometry(Point, 4326);
          `);

          // Remplir la colonne locationPoint avec les coordonnées existantes
          await queryRunner.query(`
            UPDATE "cooperatives" 
            SET "locationPoint" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
          `);

          // Créer index spatial GIST pour recherches rapides
          if (!(await indexExists('cooperatives', 'IDX_cooperatives_locationPoint'))) {
            await queryRunner.query(`
              CREATE INDEX "IDX_cooperatives_locationPoint" 
              ON "cooperatives" USING GIST ("locationPoint");
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    try {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_cooperatives_locationPoint";`,
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex(
        'cooperatives',
        'IDX_cooperatives_location',
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('cooperatives', 'IDX_cooperatives_name');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex(
        'cooperatives',
        'IDX_cooperatives_registrationNumber',
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex(
        'cooperatives',
        'IDX_cooperatives_status_verified',
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex(
        'cooperatives',
        'IDX_cooperatives_verified',
      );
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('cooperatives', 'IDX_cooperatives_status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('cooperatives', 'IDX_cooperatives_phone');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropIndex('cooperatives', 'IDX_cooperatives_email');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Supprimer les colonnes
    try {
      await queryRunner.dropColumn('cooperatives', 'locationPoint');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'longitude');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'latitude');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'verifiedBy');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'verifiedAt');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'verified');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'notes');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'memberCount');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'foundedDate');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'registrationNumber');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'description');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'logoUrl');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'status');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'phone');
    } catch (e) {
      // Ignore if doesn't exist
    }

    try {
      await queryRunner.dropColumn('cooperatives', 'email');
    } catch (e) {
      // Ignore if doesn't exist
    }

    // Supprimer les types enum (seulement si plus utilisés)
    // Note: On ne supprime pas les enums car ils pourraient être utilisés ailleurs
  }
}

