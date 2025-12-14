import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  // Configuration du logging SQL détaillé
  const isDevelopment = process.env.NODE_ENV === 'development';
  const enableSqlLogging = process.env.DB_LOG_SQL === 'true' || isDevelopment;

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'mkulimachain',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Désactivé pour utiliser uniquement les migrations
    // Logging SQL détaillé pour déboguer les requêtes
    logging: enableSqlLogging
      ? ['query', 'error', 'schema', 'warn', 'info', 'log']
      : ['error', 'warn'],
    logger: enableSqlLogging ? 'advanced-console' : 'simple-console',
    autoLoadEntities: true,
    migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
    migrationsRun: process.env.NODE_ENV !== 'production',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};
