#!/bin/bash
# ===========================================================================
# Installation des sauvegardes planifiées — MkulimaChain
#
# À lancer UNE FOIS sur le serveur, avec l'utilisateur de déploiement :
#   bash scripts/setup-backup-cron.sh
#
# Installe deux entrées cron :
#   1. Sauvegarde quotidienne à 02h30
#   2. Exercice de restauration hebdomadaire, dimanche à 03h30
#
# La passphrase de chiffrement est stockée dans ~/.mkulimachain-backup.env
# (mode 600), hors du dépôt Git.
# ===========================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/mkulimachain}"
SECRET_FILE="$HOME/.mkulimachain-backup.env"

echo -e "${GREEN}⏰ Installation des sauvegardes planifiées${NC}"
echo ""

# ---------------------------------------------------------------------------
# 0. Contexte d'exécution
#
# Ce script tourne aussi bien à la main qu'à travers une session SSH non
# interactive. Sans terminal, `sudo` ne peut pas demander de mot de passe et
# `read` ne peut rien lire : les deux doivent être détectés, jamais tentés
# à l'aveugle.
# ---------------------------------------------------------------------------
INTERACTIVE=0
[ -t 0 ] && INTERACTIVE=1

HAS_SUDO=0
if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    HAS_SUDO=1
fi

# ---------------------------------------------------------------------------
# 1. Dépendances
# ---------------------------------------------------------------------------
MISSING=()
command -v pg_dump >/dev/null 2>&1 || MISSING+=("postgresql-client")
command -v gpg     >/dev/null 2>&1 || MISSING+=("gnupg")

if [ "${#MISSING[@]}" -gt 0 ]; then
    if [ "$HAS_SUDO" = "1" ]; then
        echo -e "${YELLOW}📦 Installation des paquets manquants : ${MISSING[*]}${NC}"
        sudo apt-get update -qq && sudo apt-get install -y "${MISSING[@]}"
    else
        # Mieux vaut une consigne exacte qu'une erreur sudo brute : le sudoers
        # du déploiement n'autorise que Nginx/Certbot, pas apt-get.
        echo -e "${RED}❌ Paquets manquants : ${MISSING[*]}${NC}"
        echo ""
        echo -e "${YELLOW}   Lancez cette commande, puis relancez ce script :${NC}"
        echo ""
        echo "     sudo apt-get update && sudo apt-get install -y ${MISSING[*]}"
        echo ""
        exit 1
    fi
fi

# ---------------------------------------------------------------------------
# 2. Passphrase de chiffrement
# ---------------------------------------------------------------------------
if [ ! -f "$SECRET_FILE" ]; then
    PASSPHRASE="$(openssl rand -base64 32)"
    cat > "$SECRET_FILE" <<EOF
# Passphrase de chiffrement des sauvegardes MkulimaChain.
# ⚠️  CONSERVEZ-EN UNE COPIE HORS DE CE SERVEUR.
# Sans elle, les archives chiffrées sont définitivement illisibles.
BACKUP_PASSPHRASE='$PASSPHRASE'
BACKUP_DIR='$BACKUP_DIR'
BACKUP_RETENTION=30
EOF
    chmod 600 "$SECRET_FILE"
    echo -e "${GREEN}🔑 Passphrase générée dans $SECRET_FILE${NC}"
    echo ""
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  ⚠️  COPIEZ CETTE PASSPHRASE HORS DU SERVEUR MAINTENANT${NC}"
    echo -e "${RED}      (gestionnaire de mots de passe, coffre-fort…)${NC}"
    echo ""
    echo -e "      ${YELLOW}$PASSPHRASE${NC}"
    echo ""
    echo -e "${RED}  Sans elle, aucune sauvegarde ne pourra être restaurée.${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ "$INTERACTIVE" = "1" ]; then
        read -r -p "Appuyez sur Entrée une fois la passphrase mise en sécurité... "
    else
        echo -e "${YELLOW}   (exécution non interactive — récupérez la passphrase dans${NC}"
        echo -e "${YELLOW}    $SECRET_FILE et stockez-la hors de ce serveur)${NC}"
        echo ""
    fi
else
    echo -e "${GREEN}🔑 Passphrase existante conservée ($SECRET_FILE)${NC}"
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# 3. Entrées cron (idempotent : les anciennes lignes marquées sont retirées)
# ---------------------------------------------------------------------------
CRON_MARK="# mkulimachain-backup"
CURRENT="$(crontab -l 2>/dev/null | grep -v "$CRON_MARK" || true)"

NEW_CRON="$CURRENT
$CRON_MARK — sauvegarde quotidienne 02h30
30 2 * * * . $SECRET_FILE && bash $APP_DIR/scripts/backup-db.sh --verify >> $BACKUP_DIR/cron.log 2>&1
$CRON_MARK — exercice de restauration, dimanche 03h30
30 3 * * 0 . $SECRET_FILE && bash $APP_DIR/scripts/restore-db.sh --drill >> $BACKUP_DIR/drill.log 2>&1"

echo "$NEW_CRON" | crontab -

echo ""
echo -e "${GREEN}✅ Tâches planifiées installées :${NC}"
# Purement informatif : sous `pipefail`, un grep sans correspondance suffirait
# à faire échouer le script alors que l'installation vient de réussir.
{ crontab -l 2>/dev/null || true; } | { grep -A1 "$CRON_MARK" || true; } | sed 's/^/   /'

# ---------------------------------------------------------------------------
# 4. Première sauvegarde immédiate, pour valider la chaîne complète
# ---------------------------------------------------------------------------
echo ""
echo -e "${YELLOW}🧪 Exécution d'une première sauvegarde de contrôle...${NC}"
# shellcheck disable=SC1090
. "$SECRET_FILE"
export BACKUP_PASSPHRASE BACKUP_DIR BACKUP_RETENTION
if bash "$APP_DIR/scripts/backup-db.sh" --verify; then
    echo ""
    echo -e "${GREEN}✅ La chaîne de sauvegarde fonctionne de bout en bout.${NC}"
    echo ""
    echo -e "${YELLOW}Il reste UNE chose à faire, et elle est essentielle :${NC}"
    echo -e "${YELLOW}copier les archives hors de ce serveur.${NC}"
    echo "  Une sauvegarde stockée sur la machine qu'elle protège ne protège de rien."
    echo "  Exemple (rsync vers un autre hôte, à ajouter au cron) :"
    echo "    rsync -az $BACKUP_DIR/ backup@autre-serveur:/srv/mkulimachain/"
else
    echo -e "${RED}❌ La sauvegarde de contrôle a échoué — corrigez avant de compter dessus.${NC}"
    exit 1
fi
