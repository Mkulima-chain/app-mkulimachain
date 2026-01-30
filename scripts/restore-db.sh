#!/bin/bash
# ===========================================================================
# Restauration de la base MkulimaChain
#
# Une sauvegarde jamais restaurée n'est pas une sauvegarde. Ce script est fait
# pour être exécuté RÉGULIÈREMENT sur une base jetable (--drill), pas seulement
# le jour de l'incident.
#
# Usage :
#   bash scripts/restore-db.sh <archive>                        # restaure dans DB_NAME
#   bash scripts/restore-db.sh <archive> --into mkulima_test    # base cible différente
#   bash scripts/restore-db.sh --latest --into mkulima_test     # dernière archive
#   bash scripts/restore-db.sh --drill                          # test complet automatisé
#
# Options :
#   --latest        Utilise la sauvegarde la plus récente de BACKUP_DIR
#   --into <db>     Restaure dans une autre base (créée si absente)
#   --drill         Restaure la dernière archive dans <db>_restore_test,
#                   compte les tables, puis supprime la base de test
#   --yes           N'exige pas la confirmation interactive
# ===========================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/mkulimachain}"

ARCHIVE=""
TARGET_DB=""
USE_LATEST=0
DRILL=0
ASSUME_YES=0

while [ $# -gt 0 ]; do
    case "$1" in
        --latest) USE_LATEST=1; shift ;;
        --into)   TARGET_DB="$2"; shift 2 ;;
        --drill)  DRILL=1; USE_LATEST=1; ASSUME_YES=1; shift ;;
        --yes|-y) ASSUME_YES=1; shift ;;
        -*)       echo -e "${RED}Option inconnue : $1${NC}"; exit 1 ;;
        *)        ARCHIVE="$1"; shift ;;
    esac
done

fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
info() { echo -e "${YELLOW}$1${NC}"; }
ok()   { echo -e "${GREEN}$1${NC}"; }

# ---------------------------------------------------------------------------
# 1. Configuration
# ---------------------------------------------------------------------------
ENV_FILE=""
for candidate in "$APP_DIR/apps/api/.env.local" "$APP_DIR/apps/api/.env"; do
    [ -f "$candidate" ] && { ENV_FILE="$candidate"; break; }
done
[ -z "$ENV_FILE" ] && fail "Aucun fichier .env trouvé dans apps/api/"

# Le `|| true` est indispensable : une clé absente est un cas normal, et sans lui
# `set -e` interromprait le script sur le grep infructueux.
read_env() {
    { grep -E "^[[:space:]]*$1=" "$ENV_FILE" 2>/dev/null || true; } \
        | tail -n1 | cut -d= -f2- \
        | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

DB_HOST="$(read_env DB_HOST)";     DB_HOST="${DB_HOST:-localhost}"
DB_PORT="$(read_env DB_PORT)";     DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="$(read_env DB_USERNAME)"
DB_PASSWORD="$(read_env DB_PASSWORD)"
DB_NAME="$(read_env DB_NAME)"

[ -z "$DB_NAME" ] && fail "DB_NAME est vide dans $ENV_FILE"

# ---------------------------------------------------------------------------
# 2. Choix de l'archive
# ---------------------------------------------------------------------------
if [ "$USE_LATEST" = "1" ]; then
    ARCHIVE="$(find "$BACKUP_DIR" -maxdepth 1 -name 'mkulimachain-*.dump*' ! -name '*.sha256' -type f \
        -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -n1 | cut -d' ' -f2-)"
    [ -z "$ARCHIVE" ] && fail "Aucune sauvegarde trouvée dans $BACKUP_DIR"
fi

[ -z "$ARCHIVE" ] && fail "Usage : bash scripts/restore-db.sh <archive> | --latest [--into <db>]"
[ -f "$ARCHIVE" ] || fail "Archive introuvable : $ARCHIVE"

if [ "$DRILL" = "1" ]; then
    TARGET_DB="${DB_NAME}_restore_test"
fi
TARGET_DB="${TARGET_DB:-$DB_NAME}"

echo ""
info "Archive cible        : $ARCHIVE"
info "Base de destination  : $TARGET_DB (postgres @ $DB_HOST:$DB_PORT)"
echo ""

# ---------------------------------------------------------------------------
# 3. Somme de contrôle
# ---------------------------------------------------------------------------
if [ -f "$ARCHIVE.sha256" ]; then
    (cd "$(dirname "$ARCHIVE")" && sha256sum -c "$(basename "$ARCHIVE").sha256" >/dev/null) \
        || fail "Somme de contrôle invalide — l'archive est corrompue, ne pas restaurer"
    ok "✅ Somme de contrôle valide"
else
    info "⚠️  Pas de fichier .sha256 associé — intégrité non vérifiable"
fi

# ---------------------------------------------------------------------------
# 4. Confirmation (la restauration écrase des données)
# ---------------------------------------------------------------------------
if [ "$ASSUME_YES" != "1" ]; then
    if [ "$TARGET_DB" = "$DB_NAME" ]; then
        echo -e "${RED}⚠️  ATTENTION : vous allez ÉCRASER la base de PRODUCTION '$DB_NAME'.${NC}"
        echo -e "${RED}   Toutes les données actuelles seront perdues.${NC}"
    fi
    read -r -p "Tapez le nom de la base pour confirmer ($TARGET_DB) : " CONFIRM
    [ "$CONFIRM" = "$TARGET_DB" ] || fail "Confirmation incorrecte — restauration annulée"
fi

# ---------------------------------------------------------------------------
# 5. Déchiffrement si nécessaire
# ---------------------------------------------------------------------------
WORK_FILE="$ARCHIVE"
TMP_PLAIN=""
if [[ "$ARCHIVE" == *.gpg ]]; then
    [ -z "${BACKUP_PASSPHRASE:-}" ] && fail "Archive chiffrée : définissez BACKUP_PASSPHRASE"
    TMP_PLAIN="$(mktemp)"
    gpg --batch --yes --quiet --decrypt \
        --passphrase "$BACKUP_PASSPHRASE" \
        --output "$TMP_PLAIN" "$ARCHIVE" || fail "Déchiffrement échoué"
    WORK_FILE="$TMP_PLAIN"
    ok "🔓 Archive déchiffrée"
fi
cleanup() { [ -n "$TMP_PLAIN" ] && rm -f "$TMP_PLAIN"; }
trap cleanup EXIT

# ---------------------------------------------------------------------------
# 6. Restauration
# ---------------------------------------------------------------------------
info "♻️  Restauration en cours..."

export PGPASSWORD="$DB_PASSWORD"
PSQL="psql --host=$DB_HOST --port=$DB_PORT --username=$DB_USERNAME"

# Créer la base cible si elle n'existe pas.
if ! $PSQL --dbname=postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$TARGET_DB'" | grep -q 1; then
    $PSQL --dbname=postgres -c "CREATE DATABASE \"$TARGET_DB\"" >/dev/null
    ok "📁 Base '$TARGET_DB' créée"
fi

pg_restore \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USERNAME" \
    --dbname="$TARGET_DB" \
    --clean --if-exists \
    --no-owner --no-privileges \
    --exit-on-error \
    "$WORK_FILE" || fail "pg_restore a échoué"

TABLE_COUNT=$($PSQL --dbname="$TARGET_DB" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")

ok "✅ Restauration terminée — $TABLE_COUNT table(s) présentes dans '$TARGET_DB'"

# Le schéma MkulimaChain compte plusieurs dizaines de tables (farmers, harvests,
# batches, wallets, loans, nfts…). Moins de 10 signale une restauration partielle.
[ "$TABLE_COUNT" -lt 10 ] && fail "Trop peu de tables ($TABLE_COUNT) — la restauration semble incomplète"

# ---------------------------------------------------------------------------
# 7. Mode exercice : nettoyer la base de test
# ---------------------------------------------------------------------------
if [ "$DRILL" = "1" ]; then
    info "🧪 Exercice de restauration : nettoyage de la base de test..."
    $PSQL --dbname=postgres -c "DROP DATABASE IF EXISTS \"$TARGET_DB\"" >/dev/null
    echo ""
    ok "════════════════════════════════════════════════════════"
    ok "  ✅ EXERCICE RÉUSSI"
    ok "  La sauvegarde du $(date -r "$ARCHIVE" '+%d/%m/%Y %H:%M' 2>/dev/null || echo '?')"
    ok "  est restaurable : $TABLE_COUNT tables reconstruites."
    ok "════════════════════════════════════════════════════════"
fi

exit 0
