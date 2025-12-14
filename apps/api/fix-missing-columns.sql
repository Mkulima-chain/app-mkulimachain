-- Script SQL pour ajouter les colonnes manquantes
-- Exécuter ce script directement dans votre base de données PostgreSQL

-- 1. Ajouter dateOfBirth à farmers si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'farmers' 
        AND column_name = 'dateOfBirth'
    ) THEN
        ALTER TABLE farmers ADD COLUMN "dateOfBirth" DATE;
        RAISE NOTICE 'Colonne dateOfBirth ajoutée à la table farmers';
    ELSE
        RAISE NOTICE 'Colonne dateOfBirth existe déjà dans la table farmers';
    END IF;
END $$;

-- 2. Créer l'enum cooperative_status_enum si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cooperative_status_enum') THEN
        CREATE TYPE "cooperative_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
        RAISE NOTICE 'Type cooperative_status_enum créé';
    ELSE
        RAISE NOTICE 'Type cooperative_status_enum existe déjà';
    END IF;
END $$;

-- 3. Ajouter status à cooperatives si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cooperatives' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE cooperatives ADD COLUMN "status" cooperative_status_enum DEFAULT 'active';
        RAISE NOTICE 'Colonne status ajoutée à la table cooperatives';
    ELSE
        RAISE NOTICE 'Colonne status existe déjà dans la table cooperatives';
    END IF;
END $$;

