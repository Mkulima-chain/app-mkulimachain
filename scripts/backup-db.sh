#!/bin/bash
# ===========================================================================
# Sauvegarde de la base de données MkulimaChain
#
# Lit la configuration depuis apps/api/.env.local (puis .env) et produit une
# archive horodatée, compressée, éventuellement chiffrée, avec une somme de
# contrôle SHA-256 et une rotation automatique.
#
# Usage :
#   bash scripts/backup-db.sh                 # sauvegarde standard
#   bash scripts/backup-db.sh --verify        # + test de relecture de l'archive
#   BACKUP_DIR=/mnt/nas/mkulimachain bash scripts/backup-db.sh
#
# Variables reconnues :
#   BACKUP_DIR         Répertoire de destination (défaut : ~/backups/mkulimachain)
#   BACKUP_RETENTION   Jours de rétention (défaut : 30)
#   BACKUP_PASSPHRASE  Si défini, l'archive est chiffrée en AES-256 (gpg)
#
# Code de sortie 0 = succès. Tout autre code doit déclencher une alerte.
# ===========================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/mkulimachain}"
RETENTION_DAYS="${BACKUP_RETENTION:-30}"
LOG_FILE="$BACKUP_DIR/backup.log"
VERIFY=0

[ "${1:-}" = "--verify" ] && VERIFY=1

log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "$msg"
    mkdir -p "$BACKUP_DIR"
    echo "$msg" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
}

fail() {
    log "${RED}❌ ÉCHEC : $1${NC}"
    exit 1
}

# ---------------------------------------------------------------------------
# 1. Configuration de l'API
# ---------------------------------------------------------------------------
ENV_FILE=""
for candidate in "$APP_DIR/apps/api/.env.local" "$APP_DIR/apps/api/.env"; do
    [ -f "$candidate" ] && { ENV_FILE="$candidate"; break; }
done
[ -z "$ENV_FILE" ] && fail "Aucun fichier .env trouvé dans apps/api/ (attendu .env.local ou .env)"

# Extraction sûre : uniquement les clés attendues, sans exécuter le fichier.
# Le `|| true` est indispensable : une clé absente est un cas normal (valeur par
# défaut), et sans lui `set -e` interromprait le script sur le grep infructueux.
read_env() {
    { grep -E "^[[:space:]]*$1=" "$ENV_FILE" 2>/dev/null || true; } \
        | tail -n1 \
        | cut -d= -f2- \
        | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

DB_HOST="$(read_env DB_HOST)";     DB_HOST="${DB_HOST:-localhost}"
DB_PORT="$(read_env DB_PORT)";     DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="$(read_env DB_USERNAME)"
DB_PASSWORD="$(read_env DB_PASSWORD)"
# Le projet nomme la base DB_NAME (et non DB_DATABASE) — voir
# apps/api/src/config/database.config.ts.
DB_NAME="$(read_env DB_NAME)"

[ -z "$DB_NAME" ] && fail "DB_NAME est vide dans $ENV_FILE"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
STAMP="$(date '+%Y%m%d-%H%M%S')"
BASENAME="mkulimachain-${STAMP}"

log "${GREEN}🗄️  Sauvegarde de '$DB_NAME' (postgres) → $BACKUP_DIR${NC}"

# ---------------------------------------------------------------------------
# 2. Dump
# ---------------------------------------------------------------------------
DUMP_FILE="$BACKUP_DIR/$BASENAME.dump"

command -v pg_dump >/dev/null 2>&1 || fail "pg_dump introuvable (apt install postgresql-client)"

# Format 'custom' : compressé nativement, restaurable sélectivement par pg_restore.
PGPASSWORD="$DB_PASSWORD" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    --dbname="$DB_NAME" \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-privileges \
    --file="$DUMP_FILE" \
    || fail "pg_dump a échoué"

[ -s "$DUMP_FILE" ] || fail "Le dump produit est vide — sauvegarde inutilisable"

# ---------------------------------------------------------------------------
# 3. Chiffrement optionnel
# ---------------------------------------------------------------------------
FINAL_FILE="$DUMP_FILE"
if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
    command -v gpg >/dev/null 2>&1 || fail "gpg introuvable alors que BACKUP_PASSPHRASE est défini"
    gpg --batch --yes --symmetric \
        --cipher-algo AES256 \
        --passphrase "$BACKUP_PASSPHRASE" \
        --output "$DUMP_FILE.gpg" \
        "$DUMP_FILE" || fail "Chiffrement gpg échoué"
    rm -f "$DUMP_FILE"
    FINAL_FILE="$DUMP_FILE.gpg"
    log "🔒 Archive chiffrée (AES-256)"
else
    log "${YELLOW}⚠️  BACKUP_PASSPHRASE non défini — l'archive n'est PAS chiffrée.${NC}"
    log "${YELLOW}   Elle contient des données personnelles d'agriculteurs et des${NC}"
    log "${YELLOW}   références de portefeuilles : le chiffrement est recommandé.${NC}"
fi

chmod 600 "$FINAL_FILE"

# ---------------------------------------------------------------------------
# 4. Somme de contrôle
# ---------------------------------------------------------------------------
(cd "$BACKUP_DIR" && sha256sum "$(basename "$FINAL_FILE")" > "$(basename "$FINAL_FILE").sha256")

SIZE="$(du -h "$FINAL_FILE" | cut -f1)"
log "${GREEN}✅ Sauvegarde créée : $(basename "$FINAL_FILE") ($SIZE)${NC}"

# ---------------------------------------------------------------------------
# 5. Vérification optionnelle : l'archive est-elle relisible ?
# ---------------------------------------------------------------------------
if [ "$VERIFY" = "1" ]; then
    log "🔍 Vérification de l'intégrité de l'archive..."
    (cd "$BACKUP_DIR" && sha256sum -c "$(basename "$FINAL_FILE").sha256" >/dev/null) \
        || fail "Somme de contrôle invalide"

    CHECK_SRC="$FINAL_FILE"
    TMP_PLAIN=""
    if [ -n "${BACKUP_PASSPHRASE:-}" ]; then
        TMP_PLAIN="$(mktemp)"
        gpg --batch --yes --quiet --decrypt \
            --passphrase "$BACKUP_PASSPHRASE" \
            --output "$TMP_PLAIN" "$FINAL_FILE" || fail "Déchiffrement de contrôle échoué"
        CHECK_SRC="$TMP_PLAIN"
    fi

    pg_restore --list "$CHECK_SRC" >/dev/null 2>&1 \
        || fail "pg_restore ne parvient pas à lire l'archive"

    [ -n "$TMP_PLAIN" ] && rm -f "$TMP_PLAIN"
    log "${GREEN}✅ Archive vérifiée et relisible${NC}"
fi

# ---------------------------------------------------------------------------
# 6. Rotation
# ---------------------------------------------------------------------------
DELETED=$(find "$BACKUP_DIR" -maxdepth 1 -name 'mkulimachain-*' -type f -mtime "+$RETENTION_DAYS" -print -delete | wc -l)
[ "$DELETED" -gt 0 ] && log "🧹 Rotation : $DELETED fichier(s) de plus de $RETENTION_DAYS jours supprimé(s)"

REMAINING=$(find "$BACKUP_DIR" -maxdepth 1 -name 'mkulimachain-*.dump*' ! -name '*.sha256' -type f | wc -l)
log "📦 $REMAINING sauvegarde(s) conservée(s) dans $BACKUP_DIR"

# ---------------------------------------------------------------------------
# 7. Garde-fou : alerter si l'archive est anormalement petite
# ---------------------------------------------------------------------------
SIZE_BYTES=$(stat -c%s "$FINAL_FILE" 2>/dev/null || stat -f%z "$FINAL_FILE")
if [ "$SIZE_BYTES" -lt 10240 ]; then
    log "${YELLOW}⚠️  Archive inhabituellement petite (${SIZE_BYTES} octets) — vérifiez que la base n'est pas vide.${NC}"
fi

exit 0
