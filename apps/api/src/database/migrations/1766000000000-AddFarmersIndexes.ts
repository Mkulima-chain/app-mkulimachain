import {
  MigrationInterface,
  QueryRunner,
  TableIndex,
} from 'typeorm';

export class AddFarmersIndexes1766000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Helper function to check if index exists
    const indexExists = async (tableName: string, indexName: string) => {
      const result = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE tablename = '${tableName}' AND indexname = '${indexName}'
        )`,
      );
      return result[0].exists;
    };

    // Index sur phone pour les recherches rapides
    if (!(await indexExists('farmers', 'IDX_farmers_phone'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_phone',
          columnNames: ['phone'],
        }),
      );
    }

    // Index sur name pour les recherches textuelles
    if (!(await indexExists('farmers', 'IDX_farmers_name'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_name',
          columnNames: ['name'],
        }),
      );
    }

    // Index sur city pour les filtres géographiques
    if (!(await indexExists('farmers', 'IDX_farmers_city'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_city',
          columnNames: ['city'],
        }),
      );
    }

    // Index sur state pour les filtres géographiques
    if (!(await indexExists('farmers', 'IDX_farmers_state'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_state',
          columnNames: ['state'],
        }),
      );
    }

    // Index sur cooperativeId pour les jointures
    if (!(await indexExists('farmers', 'IDX_farmers_cooperativeId'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_cooperativeId',
          columnNames: ['cooperativeId'],
        }),
      );
    }

    // Index composite sur city et state pour les recherches géographiques
    if (!(await indexExists('farmers', 'IDX_farmers_city_state'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_city_state',
          columnNames: ['city', 'state'],
        }),
      );
    }

    // Index sur createdAt pour le tri
    if (!(await indexExists('farmers', 'IDX_farmers_createdAt'))) {
      await queryRunner.createIndex(
        'farmers',
        new TableIndex({
          name: 'IDX_farmers_createdAt',
          columnNames: ['createdAt'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('farmers', 'IDX_farmers_createdAt');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_city_state');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_cooperativeId');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_state');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_city');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_name');
    await queryRunner.dropIndex('farmers', 'IDX_farmers_phone');
  }
}

