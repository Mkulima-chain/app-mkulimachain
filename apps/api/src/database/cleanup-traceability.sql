-- Script de nettoyage pour supprimer les éléments de traceability de la base de données
-- À exécuter manuellement dans votre base de données PostgreSQL

-- Supprimer l'enregistrement de la migration de la table migrations
DELETE FROM "migrations" WHERE "name" = 'CreateTraceabilityTables1765800000000';

-- Supprimer les contraintes de clés étrangères
ALTER TABLE IF EXISTS "order_traceability_logs" DROP CONSTRAINT IF EXISTS "FK_order_traceability_logs_step";
ALTER TABLE IF EXISTS "order_traceability_logs" DROP CONSTRAINT IF EXISTS "FK_order_traceability_logs_order";

-- Supprimer les index
DROP INDEX IF EXISTS "public"."IDX_order_traceability_logs_stepId";
DROP INDEX IF EXISTS "public"."IDX_order_traceability_logs_orderId";

-- Supprimer les tables
DROP TABLE IF EXISTS "order_traceability_logs";
DROP TABLE IF EXISTS "traceability_steps";

-- Supprimer le type enum
DROP TYPE IF EXISTS "public"."traceability_steps_type_enum";
