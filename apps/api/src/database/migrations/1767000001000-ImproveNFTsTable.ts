import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ImproveNFTsTable1767000001000 implements MigrationInterface {
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

    // 1. Ajouter colonne images (JSONB pour stocker un tableau d'URLs)
    if (!(await columnExists('nfts', 'images'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'images',
          type: 'jsonb',
          isNullable: true,
          default: "'[]'",
        }),
      );
    }

    // 2. Ajouter colonne thumbnailUrl
    if (!(await columnExists('nfts', 'thumbnailUrl'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'thumbnailUrl',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    // 3. Ajouter colonne tags (JSONB pour stocker un tableau de tags)
    if (!(await columnExists('nfts', 'tags'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'tags',
          type: 'jsonb',
          isNullable: true,
          default: "'[]'",
        }),
      );
    }

    // 4. Ajouter colonne collection
    if (!(await columnExists('nfts', 'collection'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'collection',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    // 5. Ajouter colonne views (compteur de vues)
    if (!(await columnExists('nfts', 'views'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'views',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 6. Ajouter colonne likes (compteur de likes)
    if (!(await columnExists('nfts', 'likes'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'likes',
          type: 'integer',
          default: 0,
          isNullable: false,
        }),
      );
    }

    // 7. Ajouter colonne audioUrl (pour les chants)
    if (!(await columnExists('nfts', 'audioUrl'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'audioUrl',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    // 8. Ajouter colonne verified
    if (!(await columnExists('nfts', 'verified'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 9. Ajouter colonne featured (mis en avant)
    if (!(await columnExists('nfts', 'featured'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'featured',
          type: 'boolean',
          default: false,
          isNullable: false,
        }),
      );
    }

    // 10. Ajouter colonne featuredAt
    if (!(await columnExists('nfts', 'featuredAt'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'featuredAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 11. Ajouter colonne rarity (rareté)
    if (!(await columnExists('nfts', 'rarity'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'rarity',
          type: 'varchar',
          length: '50',
          isNullable: true,
          default: "'common'",
        }),
      );
    }

    // 12. Ajouter colonne attributes (JSONB pour attributs personnalisés)
    if (!(await columnExists('nfts', 'attributes'))) {
      await queryRunner.addColumn(
        'nfts',
        new TableColumn({
          name: 'attributes',
          type: 'jsonb',
          isNullable: true,
          default: "'[]'",
        }),
      );
    }

    // Créer les index pour améliorer les performances
    // Index sur collection
    if (!(await indexExists('nfts', 'IDX_nfts_collection'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_collection',
          columnNames: ['collection'],
        }),
      );
    }

    // Index sur status et featured
    if (!(await indexExists('nfts', 'IDX_nfts_status_featured'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_status_featured',
          columnNames: ['status', 'featured'],
        }),
      );
    }

    // Index sur views (pour trending)
    if (!(await indexExists('nfts', 'IDX_nfts_views'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_views',
          columnNames: ['views'],
        }),
      );
    }

    // Index sur likes (pour popular)
    if (!(await indexExists('nfts', 'IDX_nfts_likes'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_likes',
          columnNames: ['likes'],
        }),
      );
    }

    // Index sur verified
    if (!(await indexExists('nfts', 'IDX_nfts_verified'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_verified',
          columnNames: ['verified'],
        }),
      );
    }

    // Index sur rarity
    if (!(await indexExists('nfts', 'IDX_nfts_rarity'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_rarity',
          columnNames: ['rarity'],
        }),
      );
    }

    // Index composite sur createdAt pour le tri
    if (!(await indexExists('nfts', 'IDX_nfts_createdAt'))) {
      await queryRunner.createIndex(
        'nfts',
        new TableIndex({
          name: 'IDX_nfts_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.dropIndex('nfts', 'IDX_nfts_createdAt');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_rarity');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_verified');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_likes');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_views');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_status_featured');
    await queryRunner.dropIndex('nfts', 'IDX_nfts_collection');

    // Supprimer les colonnes
    await queryRunner.dropColumn('nfts', 'attributes');
    await queryRunner.dropColumn('nfts', 'rarity');
    await queryRunner.dropColumn('nfts', 'featuredAt');
    await queryRunner.dropColumn('nfts', 'featured');
    await queryRunner.dropColumn('nfts', 'verified');
    await queryRunner.dropColumn('nfts', 'audioUrl');
    await queryRunner.dropColumn('nfts', 'likes');
    await queryRunner.dropColumn('nfts', 'views');
    await queryRunner.dropColumn('nfts', 'collection');
    await queryRunner.dropColumn('nfts', 'tags');
    await queryRunner.dropColumn('nfts', 'thumbnailUrl');
    await queryRunner.dropColumn('nfts', 'images');
  }
}
