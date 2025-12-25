import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuantityToBatchHarvests1766000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne existe déjà avant de l'ajouter
    const table = await queryRunner.getTable('batch_harvests');
    const hasQuantityColumn = table?.columns.find(col => col.name === 'quantity');
    
    if (!hasQuantityColumn) {
      await queryRunner.addColumn(
        'batch_harvests',
        new TableColumn({
          name: 'quantity',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('batch_harvests', 'quantity');
  }
}

