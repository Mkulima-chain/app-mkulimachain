# Configuration de la base de données

Ce module configure la connexion à PostgreSQL via TypeORM.

## Structure

- `database.module.ts` - Module NestJS qui configure TypeORM
- `database.service.ts` - Service pour interagir avec la base de données
- `../config/database.config.ts` - Configuration de la connexion

## Utilisation

### 1. Configuration

Créez un fichier `.env.local` dans `apps/api/` :

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mkulimachain
DB_SSL=false
```

### 2. Créer une entité

Exemple dans `src/entities/example.entity.ts` :

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('examples')
export class ExampleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
```

### 3. Ajouter l'entité à la configuration

Dans `src/config/database.config.ts` :

```typescript
import { ExampleEntity } from '../entities/example.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    // ...
    entities: [ExampleEntity],
    // ...
  };
};
```

### 4. Utiliser dans un module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleEntity } from '../entities/example.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExampleEntity])],
  // ...
})
export class YourModule {}
```

### 5. Utiliser dans un service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleEntity } from '../entities/example.entity';

@Injectable()
export class YourService {
  constructor(
    @InjectRepository(ExampleEntity)
    private exampleRepository: Repository<ExampleEntity>,
  ) {}

  async findAll(): Promise<ExampleEntity[]> {
    return this.exampleRepository.find();
  }
}
```

## Endpoints de test

- `GET /db/status` - Vérifie la connexion à la base de données

## Migration (pour la production)

En production, utilisez les migrations TypeORM au lieu de `synchronize: true` :

```bash
# Générer une migration
pnpm typeorm migration:generate -n MigrationName

# Exécuter les migrations
pnpm typeorm migration:run
```

