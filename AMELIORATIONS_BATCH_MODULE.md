# Améliorations du Module Batch - Plan d'Action

## 📋 Vue d'ensemble

Ce document décrit les améliorations à apporter au module **BatchModule** (Gestion des lots de production), organisées par couche : Base de données → Backend → Frontend.

---

## 🗄️ 1. AMÉLIORATIONS BASE DE DONNÉES

### Migration à créer : `ImproveBatchesTable.ts`

#### Nouvelles colonnes à ajouter :

1. **`name`** (varchar 255, nullable)
   - Nom du lot (ex: "Lot Maïs 2024-001")
   - Index créé

2. **`description`** (text, nullable)
   - Description détaillée du lot

3. **`totalQuantity`** (decimal 12,2, nullable)
   - Quantité totale du lot (somme des récoltes)
   - Calculé automatiquement

4. **`totalWeight`** (decimal 12,2, nullable)
   - Poids total du lot en kg

5. **`unit`** (varchar 20, nullable, default: 'kg')
   - Unité de mesure

6. **`productionDate`** (timestamp, nullable)
   - Date de production du lot
   - Index créé

7. **`expirationDate`** (timestamp, nullable)
   - Date d'expiration du lot
   - Index créé

8. **`verified`** (boolean, default: false)
   - Indique si le lot a été vérifié
   - Index créé

9. **`verifiedAt`** (timestamp, nullable)
   - Date de vérification

10. **`verifiedBy`** (uuid, nullable)
    - ID de l'utilisateur admin qui a vérifié

11. **`quality`** (varchar 50, nullable)
    - Qualité du lot (excellent, good, fair, poor)
    - Index créé

12. **`notes`** (text, nullable)
    - Notes internes sur le lot

13. **`photos`** (jsonb, nullable)
    - URLs des photos du lot (tableau JSON)

14. **`originLocation`** (varchar 255, nullable)
    - Lieu d'origine du lot

15. **`destinationLocation`** (varchar 255, nullable)
    - Lieu de destination du lot

16. **`certification`** (varchar 255, nullable)
    - Certifications (bio, équitable, etc.)

17. **`estimatedValue`** (decimal 12,2, nullable)
    - Valeur estimée du lot

18. **`cooperativeId`** (uuid, nullable)
    - Référence à la coopérative
    - Index créé
    - Relation ManyToOne avec CooperativeEntity

19. **`farmerId`** (uuid, nullable)
    - Référence au principal agriculteur
    - Index créé
    - Relation ManyToOne avec FarmerEntity

20. **`productId`** (uuid, nullable)
    - Référence au produit principal
    - Index créé
    - Relation ManyToOne avec ProductEntity

#### Index à créer :

- `IDX_batches_name` - Recherche par nom
- `IDX_batches_status` - Filtrage par statut
- `IDX_batches_verified` - Filtrage par vérifié
- `IDX_batches_productionDate` - Tri par date de production
- `IDX_batches_expirationDate` - Tri par date d'expiration
- `IDX_batches_quality` - Filtrage par qualité
- `IDX_batches_cooperativeId` - Filtrage par coopérative
- `IDX_batches_farmerId` - Filtrage par agriculteur
- `IDX_batches_productId` - Filtrage par produit
- `IDX_batches_createdAt` - Tri par date de création

---

## 🔧 2. AMÉLIORATIONS BACKEND

### 2.1 Entité (`batch.entity.ts`)

- ✅ Ajouter toutes les nouvelles colonnes avec leurs décorateurs TypeORM
- ✅ Ajouter les index sur les nouvelles colonnes
- ✅ Ajouter les relations ManyToOne avec CooperativeEntity, FarmerEntity, ProductEntity

### 2.2 Interface (`ibatch.ts`)

- ✅ Mettre à jour l'interface `IBatch` avec tous les nouveaux champs

### 2.3 DTOs (`batch.dto.ts`)

- ✅ Ajouter les nouveaux champs dans `CreateBatchDto` avec validation
- ✅ Améliorer `GetBatchDto` avec pagination et filtres avancés
- ✅ Créer `UpdateBatchDto` avec `PartialType(CreateBatchDto)`

### 2.4 Service (`batch.service.ts`)

- ✅ Améliorer `create` pour calculer automatiquement `totalQuantity`
- ✅ Améliorer `findAll` pour supporter pagination et filtres
- ✅ Ajouter nouvelles méthodes : `verifyBatch`, `updateBatchStatus`, `getBatchStats`, `getGlobalStats`

### 2.5 Repository (`batch.repository.ts`)

- ✅ Améliorer `findAll` pour supporter pagination, filtres, tri et recherche
- ✅ Ajouter méthodes de statistiques

### 2.6 Controller (`batch.controller.ts`)

- ✅ Améliorer la documentation Swagger
- ✅ Ajouter nouveaux endpoints : verify, status, stats

---

## 🎨 3. AMÉLIORATIONS FRONTEND

### 3.1 Page principale (`apps/admin/app/batch/page.tsx`)

- ✅ Améliorer le formulaire avec tous les nouveaux champs
- ✅ Remplacer sélection récoltes par Select multi-sélection
- ✅ Améliorer la table d'affichage
- ✅ Ajouter filtres avancés et pagination
- ✅ Ajouter actions (Vérifier, Changer statut)
- ✅ Ajouter vue détaillée et galerie de photos
- ✅ Ajouter cartes de statistiques

---

## 📝 4. STATUT D'IMPLÉMENTATION

- [ ] Migration base de données créée
- [ ] Entité mise à jour
- [ ] Interface mise à jour
- [ ] DTOs mis à jour
- [ ] Service amélioré
- [ ] Repository amélioré
- [ ] Controller amélioré
- [ ] Frontend amélioré

