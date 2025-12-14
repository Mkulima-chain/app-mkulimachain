import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class ImproveSupplyChainStepsTable1767000002000
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

    // Helper function to check if enum type exists
    const enumTypeExists = async (enumName: string): Promise<boolean> => {
      const result = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = $1
        )`,
        [enumName],
      );
      return result[0]?.exists || false;
    };

    // Helper function to check if enum value exists
    const enumValueExists = async (
      enumName: string,
      enumValue: string,
    ): Promise<boolean> => {
      // First check if enum type exists
      const typeExists = await enumTypeExists(enumName);
      if (!typeExists) return false;

      const result = await queryRunner.query(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = $1
          AND enumtypid = (
            SELECT oid
            FROM pg_type
            WHERE typname = $2
          )
        )`,
        [enumValue, enumName],
      );
      return result[0]?.exists || false;
    };

    // Check if step_type_enum exists, if not create it
    const stepTypeEnumExists = await enumTypeExists('step_type_enum');
    if (!stepTypeEnumExists) {
      await queryRunner.query(
        `CREATE TYPE "step_type_enum" AS ENUM ('harvest', 'drying', 'packaging', 'export')`,
      );
    }

    // Add new enum values to step_type_enum
    const newStepTypes = [
      'transport',
      'storage',
      'processing',
      'quality_check',
      'certification',
      'distribution',
      'retail',
    ];

    for (const stepType of newStepTypes) {
      if (!(await enumValueExists('step_type_enum', stepType))) {
        await queryRunner.query(
          `ALTER TYPE "step_type_enum" ADD VALUE IF NOT EXISTS '${stepType}'`,
        );
      }
    }

    // Create step_status_enum if it doesn't exist
    const stepStatusEnumExists = await enumTypeExists('step_status_enum');
    if (!stepStatusEnumExists) {
      await queryRunner.query(
        `CREATE TYPE "step_status_enum" AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled')`,
      );
    }

    // Create quality_enum if it doesn't exist
    const qualityEnumExists = await enumTypeExists('quality_enum');
    if (!qualityEnumExists) {
      await queryRunner.query(
        `CREATE TYPE "quality_enum" AS ENUM ('excellent', 'good', 'fair', 'poor')`,
      );
    }

    const tableName = 'supply_chain_steps';

    // 1. Add name column
    if (!(await columnExists(tableName, 'name'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'name',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 2. Add description column
    if (!(await columnExists(tableName, 'description'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 3. Add location column
    if (!(await columnExists(tableName, 'location'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'location',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 4. Add latitude column
    if (!(await columnExists(tableName, 'latitude'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'latitude',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
        }),
      );
    }

    // 5. Add longitude column
    if (!(await columnExists(tableName, 'longitude'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'longitude',
          type: 'decimal',
          precision: 10,
          scale: 7,
          isNullable: true,
        }),
      );
    }

    // 6. Add temperature column
    if (!(await columnExists(tableName, 'temperature'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'temperature',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 7. Add humidity column
    if (!(await columnExists(tableName, 'humidity'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'humidity',
          type: 'decimal',
          precision: 5,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 8. Add quantity column
    if (!(await columnExists(tableName, 'quantity'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'quantity',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 9. Add weight column
    if (!(await columnExists(tableName, 'weight'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'weight',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 10. Add unit column
    if (!(await columnExists(tableName, 'unit'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'unit',
          type: 'varchar',
          length: '20',
          isNullable: true,
          default: "'kg'",
        }),
      );
    }

    // 11. Add status column
    if (!(await columnExists(tableName, 'status'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'status',
          type: 'step_status_enum',
          isNullable: true,
          default: "'pending'",
        }),
      );
    }

    // 12. Add verified column
    if (!(await columnExists(tableName, 'verified'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'verified',
          type: 'boolean',
          default: false,
        }),
      );
    }

    // 13. Add verifiedAt column
    if (!(await columnExists(tableName, 'verifiedAt'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'verifiedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    // 14. Add verifiedBy column
    if (!(await columnExists(tableName, 'verifiedBy'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'verifiedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 15. Add responsiblePerson column
    if (!(await columnExists(tableName, 'responsiblePerson'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'responsiblePerson',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 16. Add responsiblePersonId column
    if (!(await columnExists(tableName, 'responsiblePersonId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'responsiblePersonId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 17. Add certificate column
    if (!(await columnExists(tableName, 'certificate'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'certificate',
          type: 'varchar',
          length: '500',
          isNullable: true,
        }),
      );
    }

    // 18. Add notes column
    if (!(await columnExists(tableName, 'notes'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'notes',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    // 19. Add photos column (JSONB)
    if (!(await columnExists(tableName, 'photos'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'photos',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 20. Add documents column (JSONB)
    if (!(await columnExists(tableName, 'documents'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'documents',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    // 21. Add duration column
    if (!(await columnExists(tableName, 'duration'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'duration',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    // 22. Add equipment column
    if (!(await columnExists(tableName, 'equipment'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'equipment',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 23. Add cost column
    if (!(await columnExists(tableName, 'cost'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'cost',
          type: 'decimal',
          precision: 12,
          scale: 2,
          isNullable: true,
        }),
      );
    }

    // 24. Add quality column
    if (!(await columnExists(tableName, 'quality'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'quality',
          type: 'quality_enum',
          isNullable: true,
        }),
      );
    }

    // 25. Add nextStepId column
    if (!(await columnExists(tableName, 'nextStepId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'nextStepId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 26. Add previousStepId column
    if (!(await columnExists(tableName, 'previousStepId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'previousStepId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 27. Add sequenceOrder column
    if (!(await columnExists(tableName, 'sequenceOrder'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'sequenceOrder',
          type: 'integer',
          isNullable: true,
        }),
      );
    }

    // 28. Add blockchainTxHash column
    if (!(await columnExists(tableName, 'blockchainTxHash'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'blockchainTxHash',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 29. Add qrCode column
    if (!(await columnExists(tableName, 'qrCode'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'qrCode',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // 30. Add cooperativeId column
    if (!(await columnExists(tableName, 'cooperativeId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'cooperativeId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // 31. Add facilityId column
    if (!(await columnExists(tableName, 'facilityId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'facilityId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    // Create indexes
    const indexes = [
      { name: 'IDX_supply_chain_steps_name', columns: ['name'] },
      { name: 'IDX_supply_chain_steps_location', columns: ['location'] },
      { name: 'IDX_supply_chain_steps_status', columns: ['status'] },
      { name: 'IDX_supply_chain_steps_verified', columns: ['verified'] },
      { name: 'IDX_supply_chain_steps_stepType', columns: ['stepType'] },
      { name: 'IDX_supply_chain_steps_timestamp', columns: ['timestamp'] },
      {
        name: 'IDX_supply_chain_steps_sequenceOrder',
        columns: ['sequenceOrder'],
      },
      { name: 'IDX_supply_chain_steps_quality', columns: ['quality'] },
      {
        name: 'IDX_supply_chain_steps_responsiblePersonId',
        columns: ['responsiblePersonId'],
      },
      {
        name: 'IDX_supply_chain_steps_cooperativeId',
        columns: ['cooperativeId'],
      },
      {
        name: 'IDX_supply_chain_steps_blockchainTxHash',
        columns: ['blockchainTxHash'],
      },
      { name: 'IDX_supply_chain_steps_qrCode', columns: ['qrCode'] },
      {
        name: 'IDX_supply_chain_steps_batchId_stepType',
        columns: ['batchId', 'stepType'],
      },
      {
        name: 'IDX_supply_chain_steps_batchId_timestamp',
        columns: ['batchId', 'timestamp'],
      },
    ];

    for (const idx of indexes) {
      if (!(await indexExists(tableName, idx.name))) {
        await queryRunner.createIndex(
          tableName,
          new TableIndex({
            name: idx.name,
            columnNames: idx.columns,
          }),
        );
      }
    }

    // Create foreign keys
    // FK for nextStepId (self-referencing)
    const fkNextStepExists = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_nextStepId'
      )`,
    );
    if (!fkNextStepExists[0].exists) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['nextStepId'],
          referencedColumnNames: ['id'],
          referencedTableName: tableName,
          onDelete: 'SET NULL',
          name: 'FK_supply_chain_steps_nextStepId',
        }),
      );
    }

    // FK for previousStepId (self-referencing)
    const fkPreviousStepExists = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_previousStepId'
      )`,
    );
    if (!fkPreviousStepExists[0].exists) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['previousStepId'],
          referencedColumnNames: ['id'],
          referencedTableName: tableName,
          onDelete: 'SET NULL',
          name: 'FK_supply_chain_steps_previousStepId',
        }),
      );
    }

    // FK for cooperativeId
    const fkCooperativeExists = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_cooperativeId'
      )`,
    );
    if (!fkCooperativeExists[0].exists) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['cooperativeId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'cooperatives',
          onDelete: 'SET NULL',
          name: 'FK_supply_chain_steps_cooperativeId',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'supply_chain_steps';

    // Drop foreign keys
    const fkNextStep = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_nextStepId'
      )`,
    );
    if (fkNextStep[0].exists) {
      await queryRunner.dropForeignKey(
        tableName,
        'FK_supply_chain_steps_nextStepId',
      );
    }

    const fkPreviousStep = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_previousStepId'
      )`,
    );
    if (fkPreviousStep[0].exists) {
      await queryRunner.dropForeignKey(
        tableName,
        'FK_supply_chain_steps_previousStepId',
      );
    }

    const fkCooperative = await queryRunner.query(
      `SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'FK_supply_chain_steps_cooperativeId'
      )`,
    );
    if (fkCooperative[0].exists) {
      await queryRunner.dropForeignKey(
        tableName,
        'FK_supply_chain_steps_cooperativeId',
      );
    }

    // Drop indexes
    const indexes = [
      'IDX_supply_chain_steps_name',
      'IDX_supply_chain_steps_location',
      'IDX_supply_chain_steps_status',
      'IDX_supply_chain_steps_verified',
      'IDX_supply_chain_steps_stepType',
      'IDX_supply_chain_steps_timestamp',
      'IDX_supply_chain_steps_sequenceOrder',
      'IDX_supply_chain_steps_quality',
      'IDX_supply_chain_steps_responsiblePersonId',
      'IDX_supply_chain_steps_cooperativeId',
      'IDX_supply_chain_steps_blockchainTxHash',
      'IDX_supply_chain_steps_qrCode',
      'IDX_supply_chain_steps_batchId_stepType',
      'IDX_supply_chain_steps_batchId_timestamp',
    ];

    for (const indexName of indexes) {
      try {
        await queryRunner.dropIndex(tableName, indexName);
      } catch (e) {
        // Index might not exist
      }
    }

    // Drop columns
    const columns = [
      'name',
      'description',
      'location',
      'latitude',
      'longitude',
      'temperature',
      'humidity',
      'quantity',
      'weight',
      'unit',
      'status',
      'verified',
      'verifiedAt',
      'verifiedBy',
      'responsiblePerson',
      'responsiblePersonId',
      'certificate',
      'notes',
      'photos',
      'documents',
      'duration',
      'equipment',
      'cost',
      'quality',
      'nextStepId',
      'previousStepId',
      'sequenceOrder',
      'blockchainTxHash',
      'qrCode',
      'cooperativeId',
      'facilityId',
    ];

    for (const columnName of columns) {
      try {
        await queryRunner.dropColumn(tableName, columnName);
      } catch (e) {
        // Column might not exist
      }
    }

    // Note: We don't drop the enum types as they might be used elsewhere
    // If needed, they can be dropped manually
  }
}
