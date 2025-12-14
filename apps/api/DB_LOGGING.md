# Configuration du Logging SQL TypeORM

## Activation du Logging SQL

Le logging SQL a été activé dans la configuration TypeORM pour aider au débogage des requêtes SQL.

### Options de Logging

Le logging est configuré dans `src/config/database.config.ts` avec les options suivantes :

- **En développement** : Logging complet activé par défaut
  - `query` : Affiche toutes les requêtes SQL exécutées
  - `error` : Affiche les erreurs SQL
  - `schema` : Affiche les opérations de schéma
  - `warn` : Affiche les avertissements
  - `info` : Affiche les informations
  - `log` : Affiche les logs généraux

- **En production** : Seulement `error` et `warn` par défaut

### Contrôle via Variable d'Environnement

Vous pouvez forcer l'activation du logging SQL même en production en ajoutant dans votre `.env.local` :

```env
DB_LOG_SQL=true
```

Pour désactiver complètement le logging SQL (même en développement) :

```env
DB_LOG_SQL=false
```

### Exemple de Sortie

Quand le logging SQL est activé, vous verrez dans les logs :

```
query: SELECT "farmer"."id" AS "farmer_id", "farmer"."name" AS "farmer_name", "farmer"."dateOfBirth" AS "farmer_dateOfBirth", ... FROM "farmers" "farmer" LEFT JOIN "cooperatives" "cooperative" ON "cooperative"."id"="farmer"."cooperativeId" ORDER BY "farmer"."createdAt" DESC LIMIT 10 OFFSET 0
```

Cela vous permettra de voir exactement quelle requête SQL est générée par TypeORM et identifier pourquoi certaines colonnes ne sont pas trouvées.

### Dépannage

Si vous voyez des erreurs comme `column farmer.dateOfBirth does not exist`, vérifiez :

1. Que le nom de la colonne dans la requête SQL correspond au nom réel dans la base de données
2. Que la casse est correcte (PostgreSQL est sensible à la casse pour les identifiants entre guillemets)
3. Que la colonne existe vraiment dans la table

### Logger Avancé

Le logger `advanced-console` fournit des informations plus détaillées incluant :
- Les paramètres de requête
- Le temps d'exécution
- Les requêtes préparées

Pour revenir au logger simple, modifiez `logger: 'simple-console'` dans la configuration.

