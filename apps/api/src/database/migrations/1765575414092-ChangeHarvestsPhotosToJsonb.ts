import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeHarvestsPhotosToJsonb1765575414092
  implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
    // Vérifier si la colonne existe
    const columnExists = await queryRunner.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'harvests' AND column_name = 'photos'`,
    );

    if (columnExists.length > 0) {
      // Vérifier le type actuel
      const currentType = await queryRunner.query(
        `SELECT data_type, udt_name
         FROM information_schema.columns
         WHERE table_name = 'harvests' AND column_name = 'photos'`,
      );

      // Si c'est un array de text, convertir en jsonb
      if (currentType[0]?.udt_name === '_text' || currentType[0]?.data_type === 'ARRAY') {
        // Convertir les données existantes de text[] à jsonb
        await queryRunner.query(`
          ALTER TABLE harvests 
          ALTER COLUMN photos TYPE jsonb 
          USING CASE 
            WHEN photos IS NULL THEN NULL
            ELSE to_jsonb(photos::text[])
          END
        `);
      } else if (currentType[0]?.udt_name !== 'jsonb') {
        // Si ce n'est pas déjà jsonb, changer le type
        await queryRunner.query(`
          ALTER TABLE harvests 
          ALTER COLUMN photos TYPE jsonb 
          USING CASE 
            WHEN photos IS NULL THEN NULL
            ELSE photos::jsonb
          END
        `);
      }
    }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    // Reconvertir en text array si nécessaire
    const columnExists = await queryRunner.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'harvests' AND column_name = 'photos'`,
    );

    if (columnExists.length > 0) {
      await queryRunner.query(`
        ALTER TABLE harvests 
        ALTER COLUMN photos TYPE text[] 
        USING CASE 
          WHEN photos IS NULL THEN NULL
          ELSE ARRAY(SELECT jsonb_array_elements_text(photos))
        END
      `);
    }
  }
}
