import { MigrationInterface, QueryRunner } from "typeorm";

export class NewModifications1765560449625 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajoutez ici vos modifications de schéma
        // Exemple:
        // await queryRunner.query(`ALTER TABLE "table_name" ADD COLUMN "new_column" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Ajoutez ici le rollback des modifications
        // Exemple:
        // await queryRunner.query(`ALTER TABLE "table_name" DROP COLUMN "new_column"`);
    }
}
