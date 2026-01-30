#!/bin/bash
# ===========================================================================
# Préparation du serveur — MkulimaChain
#
# À exécuter UNE SEULE FOIS sur un serveur neuf, AVEC L'UTILISATEUR DE
# DÉPLOIEMENT (pas root) :
#   ssh -p <PORT_SSH> <utilisateur>@<IP>
#   bash scripts/setup-server.sh
#
# Les étapes privilégiées passent par sudo ; Node/pnpm/PM2 sont installés
# pour l'utilisateur courant.
#
# Variables ajustables :
#   SSH_PORT=22        Port SSH réellement écouté (règle de pare-feu)
#   DB_NAME / DB_USER  Base et rôle PostgreSQL à créer
# ===========================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SSH_PORT="${SSH_PORT:-22}"
APP_DIR="$HOME/app-mkulimachain"
DB_NAME="${DB_NAME:-mkulimachain}"
DB_USER="${DB_USER:-mkulimachain}"

if [ "$(id -u)" = "0" ]; then
    echo -e "${RED}❌ Ne lancez pas ce script en root.${NC}"
    echo -e "${YELLOW}   Connectez-vous avec l'utilisateur de déploiement : les applications${NC}"
    echo -e "${YELLOW}   tournent dans son home, sans privilèges.${NC}"
    exit 1
fi

echo -e "${GREEN}🖥️  Préparation du serveur pour MkulimaChain (utilisateur : $USER)${NC}"

# ===========================================================================
# 1. Système
# ===========================================================================
echo -e "${YELLOW}📦 Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential rsync

# ===========================================================================
# 2. Node.js 20 (via nvm, pour l'utilisateur courant)
#
# Node 20 est le minimum pour Next.js 16 ; le projet déclare >=18 mais Next 16
# et React 19 exigent 20.9+ en pratique.
# ===========================================================================
echo -e "${YELLOW}📦 Installation de Node.js 20...${NC}"
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

# ===========================================================================
# 3. pnpm et PM2 (niveau utilisateur, sans sudo)
# ===========================================================================
echo -e "${YELLOW}📦 Installation de pnpm et PM2...${NC}"
npm install -g pnpm@9 pm2

# ===========================================================================
# 4. PostgreSQL
# ===========================================================================
echo -e "${YELLOW}📦 Installation de PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib postgresql-client
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo -e "${YELLOW}🗄️  Création de la base '$DB_NAME'...${NC}"
# Mot de passe généré : un mot de passe en clair dans un script versionné
# finit toujours par rester tel quel en production.
DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"

# Idempotent : relancer ce script ne doit pas échouer sur un rôle existant.
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
   ELSE
      ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASSWORD';
   END IF;
END
\$\$;
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# TypeORM crée les tables via les migrations : le rôle a besoin du schéma public.
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Identifiants PostgreSQL — à reporter dans apps/api/.env.local${NC}"
echo ""
echo -e "    DB_HOST=localhost"
echo -e "    DB_PORT=5432"
echo -e "    DB_USERNAME=$DB_USER"
echo -e "    DB_PASSWORD=${YELLOW}$DB_PASSWORD${NC}"
echo -e "    DB_NAME=$DB_NAME"
echo -e "    DB_SSL=false"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""

# ===========================================================================
# 5. Répertoire applicatif
# ===========================================================================
echo -e "${YELLOW}📁 Création de $APP_DIR...${NC}"
mkdir -p "$APP_DIR/logs"

# ===========================================================================
# 6. Clé SSH pour GitHub Actions
#
# La clé PUBLIQUE est autorisée sur CE serveur (cet utilisateur) pour que la CI
# puisse s'y connecter. La clé PRIVÉE va dans le secret GitHub DEPLOY_SSH_KEY.
# ===========================================================================
echo -e "${YELLOW}🔑 Clé SSH de déploiement...${NC}"
if [ ! -f "$HOME/.ssh/id_ed25519" ]; then
    mkdir -p "$HOME/.ssh"
    ssh-keygen -t ed25519 -C "deploy@mkulimachain" -f "$HOME/.ssh/id_ed25519" -N ""
    cat "$HOME/.ssh/id_ed25519.pub" >> "$HOME/.ssh/authorized_keys"
    chmod 700 "$HOME/.ssh" && chmod 600 "$HOME/.ssh/authorized_keys"
    echo ""
    echo -e "${GREEN}Clé publique ajoutée à ~/.ssh/authorized_keys pour $USER.${NC}"
    echo ""
    echo -e "${GREEN}Copiez cette clé PRIVÉE dans le secret GitHub DEPLOY_SSH_KEY${NC}"
    echo -e "${YELLOW}(intégralement, lignes BEGIN et END comprises) :${NC}"
    echo ""
    cat "$HOME/.ssh/id_ed25519"
    echo ""
else
    echo -e "${GREEN}✅ Clé existante conservée (~/.ssh/id_ed25519).${NC}"
    echo -e "${YELLOW}   Pour la réafficher : cat ~/.ssh/id_ed25519${NC}"
fi

# ===========================================================================
# 7. Démarrage automatique de PM2 au reboot
# ===========================================================================
echo -e "${YELLOW}🔧 Configuration du démarrage automatique PM2...${NC}"
sudo env PATH="$PATH" "$(command -v pm2)" startup systemd -u "$USER" --hp "$HOME"

# ===========================================================================
# 8. Pare-feu
#
# SSH + HTTP/HTTPS uniquement. Les ports applicatifs (5600/5601/5602) et
# PostgreSQL (5432) restent privés : Nginx les atteint via localhost.
# ===========================================================================
echo -e "${YELLOW}🔥 Configuration du pare-feu (SSH sur $SSH_PORT)...${NC}"
sudo apt install -y ufw
sudo ufw allow "$SSH_PORT"/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo -e "${GREEN}✅ Serveur prêt !${NC}"
echo ""
echo -e "${YELLOW}Étapes suivantes :${NC}"
echo "  1. Faire pointer les DNS A vers ce serveur :"
echo "       mkulimachain.com, www.mkulimachain.com, app.mkulimachain.com, api.mkulimachain.com"
echo "  2. Déposer le code dans $APP_DIR (premier push CI, ou git clone)."
echo "  3. Créer $APP_DIR/apps/api/.env.local à partir de apps/api/.env.example"
echo "     (avec les identifiants PostgreSQL affichés plus haut)."
echo "  4. sudo bash scripts/setup-nginx.sh     # Nginx + SSL"
echo "  5. bash scripts/setup-backup-cron.sh    # sauvegardes planifiées"
echo "  6. Pousser sur main — GitHub Actions déploie automatiquement."
echo ""
echo -e "${YELLOW}Secrets GitHub à renseigner :${NC}"
echo "  - DEPLOY_HOST    : $(curl -s --max-time 5 https://api.ipify.org || echo '<IP du serveur>')"
echo "  - DEPLOY_USER    : $USER"
echo "  - DEPLOY_PORT    : $SSH_PORT"
echo "  - DEPLOY_SSH_KEY : la clé privée affichée plus haut"
