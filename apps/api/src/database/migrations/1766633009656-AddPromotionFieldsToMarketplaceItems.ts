import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPromotionFieldsToMarketplaceItems1766633009656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la colonne onPromotion
        await queryRunner.addColumn(
            'marketplace_items',
            new TableColumn({
                name: 'onPromotion',
                type: 'boolean',
                default: false,
                isNullable: false,
            })
        );

        // Ajouter la colonne originalPriceADA
        await queryRunner.addColumn(
            'marketplace_items',
            new TableColumn({
                name: 'originalPriceADA',
                type: 'decimal',
                precision: 18,
                scale: 6,
                isNullable: true,
            })
        );

        // Ajouter la colonne discountPercent
        await queryRunner.addColumn(
            'marketplace_items',
            new TableColumn({
                name: 'discountPercent',
                type: 'decimal',
                precision: 5,
                scale: 2,
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les colonnes dans l'ordre inverse
        await queryRunner.dropColumn('marketplace_items', 'discountPercent');
        await queryRunner.dropColumn('marketplace_items', 'originalPriceADA');
        await queryRunner.dropColumn('marketplace_items', 'onPromotion');
    }

}
