#!/bin/bash
# ===========================================================================
# Déploiement — MkulimaChain
#
# Exécutable à la main sur le serveur, ou appelé par GitHub Actions.
#   cd ~/app-mkulimachain && bash scripts/deploy.sh
#
# Déploie :
#   apps/api    -> api.mkulimachain.com  (NestJS, 5600)
#   apps/web    -> mkulimachain.com      (Next.js, 5601)
#   apps/admin  -> app.mkulimachain.com  (Next.js, 5602)
# ===========================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Déploiement de MkulimaChain...${NC}"

# Racine du projet, déduite de l'emplacement de ce script (fonctionne où qu'il
# soit cloné, pas seulement dans ~/app-mkulimachain).
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Purement informatif : le code est déjà synchronisé sur le serveur par la CI
# (rsync), ce script ne fait pas de git checkout.
BRANCH="${1:-main}"
echo -e "${YELLOW}   Répertoire : $APP_DIR — branche annoncée : $BRANCH${NC}"

API_URL="https://api.mkulimachain.com/api"
WEB_URL="https://mkulimachain.com"
ADMIN_URL="https://app.mkulimachain.com"

DOMAINS=(mkulimachain.com www.mkulimachain.com app.mkulimachain.com api.mkulimachain.com)
CERTBOT_EMAIL="${CERTBOT_EMAIL:-contact@mkulimachain.com}"
NGINX_SITE="mkulimachain"

# ===========================================================================
# 1. Vérifications préalables
# ===========================================================================
echo -e "${YELLOW}📋 Vérifications préalables...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm introuvable, installation...${NC}"
    # Version alignée sur "packageManager" dans package.json : pnpm refuse
    # de tourner sur une version différente de celle déclarée.
    npm install -g pnpm@9.0.0
fi

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 introuvable, installation...${NC}"
    npm install -g pm2
fi

# L'API refusera de démarrer sans sa configuration : autant échouer maintenant,
# avec un message clair, plutôt qu'après un build de plusieurs minutes.
if [ ! -f "$APP_DIR/apps/api/.env.local" ]; then
    echo -e "${RED}❌ apps/api/.env.local est absent.${NC}"
    echo -e "${YELLOW}   L'API le lit via @nestjs/config (envFilePath: '.env.local').${NC}"
    echo -e "${YELLOW}   Créez-le à partir de apps/api/.env.example, puis relancez.${NC}"
    exit 1
fi

mkdir -p "$APP_DIR/logs"

# ===========================================================================
# 2. Dépendances
# ===========================================================================
echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
cd "$APP_DIR"
pnpm install --frozen-lockfile

# ===========================================================================
# 3. Build
#
# Les packages partagés d'abord : api, web et admin les importent en
# workspace:* et lisent leur dist/.
# NEXT_PUBLIC_* est figé dans le bundle au moment du build — d'où sa présence
# ici ET dans ecosystem.config.js.
# ===========================================================================
echo -e "${YELLOW}🔨 Build des packages partagés...${NC}"
pnpm --filter=@mkulimachain/shared-types build
pnpm --filter=@mkulimachain/shared-utils build

echo -e "${YELLOW}🔨 Build de l'API...${NC}"
pnpm --filter=api build

echo -e "${YELLOW}🔨 Build du Web...${NC}"
NODE_ENV=production \
NEXT_PUBLIC_API_URL="$API_URL" \
NEXT_PUBLIC_SITE_URL="$WEB_URL" \
pnpm --filter=web build

echo -e "${YELLOW}🔨 Build de l'Admin...${NC}"
NODE_ENV=production \
NEXT_PUBLIC_API_URL="$API_URL" \
NEXT_PUBLIC_SITE_URL="$ADMIN_URL" \
pnpm --filter=admin build

# ===========================================================================
# 4. Migrations de base de données
#
# En production, synchronize et migrationsRun sont désactivés (voir
# apps/api/src/config/database.config.ts) : le schéma n'évolue QUE par ici.
# ===========================================================================
echo -e "${YELLOW}🗄️  Exécution des migrations...${NC}"
if ! pnpm --filter=api migration:run; then
    echo -e "${RED}❌ Les migrations ont échoué — déploiement interrompu.${NC}"
    echo -e "${YELLOW}   Les services actuels restent en ligne sur l'ancienne version.${NC}"
    exit 1
fi

# ===========================================================================
# 5. Redémarrage PM2
# ===========================================================================
echo -e "${YELLOW}🔄 Redémarrage des services (PM2)...${NC}"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# ===========================================================================
# 6. Nginx + SSL
#
# Applique nginx/mkulimachain.conf et étend le certificat Let's Encrypt quand
# un nouveau domaine apparaît. Nécessite un sudo sans mot de passe restreint
# (installé une fois par scripts/setup-nginx.sh). Sans lui, on n'interrompt
# pas le déploiement : on affiche les commandes à passer manuellement.
# ===========================================================================
if sudo -n true 2>/dev/null; then
    if [ ! -f "/etc/nginx/sites-available/$NGINX_SITE" ] \
       || ! cmp -s "$APP_DIR/nginx/mkulimachain.conf" "/etc/nginx/sites-available/$NGINX_SITE"; then
        echo -e "${YELLOW}🔧 Application de nginx/mkulimachain.conf...${NC}"
        sudo cp "$APP_DIR/nginx/mkulimachain.conf" "/etc/nginx/sites-available/$NGINX_SITE"
        sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" /etc/nginx/sites-enabled/
        if sudo nginx -t; then
            sudo systemctl reload nginx
            echo -e "${GREEN}✅ Configuration Nginx rechargée.${NC}"
        else
            echo -e "${RED}❌ nginx -t a échoué — configuration NON rechargée.${NC}"
        fi
    else
        echo -e "${GREEN}✅ Configuration Nginx déjà à jour.${NC}"
    fi

    # N'étendre le certificat que pour les domaines non couverts : Let's Encrypt
    # applique des quotas stricts sur les demandes répétées.
    COVERED="$(sudo certbot certificates 2>/dev/null | grep -oE 'Domains:.*' || true)"
    MISSING=()
    for d in "${DOMAINS[@]}"; do
        echo "$COVERED" | grep -qw "$d" || MISSING+=("$d")
    done
    if [ "${#MISSING[@]}" -gt 0 ]; then
        echo -e "${YELLOW}🔒 Domaines sans certificat : ${MISSING[*]} — exécution de Certbot...${NC}"
        CERTBOT_ARGS=()
        for d in "${DOMAINS[@]}"; do CERTBOT_ARGS+=(-d "$d"); done
        sudo certbot --nginx "${CERTBOT_ARGS[@]}" --expand --non-interactive --agree-tos \
            --email "$CERTBOT_EMAIL" --redirect \
            && echo -e "${GREEN}✅ Certificat SSL mis à jour.${NC}" \
            || echo -e "${RED}❌ Certbot a échoué — vérifiez que les enregistrements DNS A pointent vers ce serveur.${NC}"
    else
        echo -e "${GREEN}✅ Le certificat SSL couvre déjà tous les domaines.${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  sudo sans mot de passe indisponible — mise à jour Nginx/SSL ignorée.${NC}"
    echo -e "${YELLOW}   À appliquer manuellement :${NC}"
    echo "     sudo cp nginx/mkulimachain.conf /etc/nginx/sites-available/$NGINX_SITE"
    echo "     sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/"
    echo "     sudo nginx -t && sudo systemctl reload nginx"
    printf '     sudo certbot --nginx'; for d in "${DOMAINS[@]}"; do printf ' -d %s' "$d"; done; printf ' --expand --redirect\n'
fi

# ===========================================================================
# 7. Contrôle de santé
#
# PM2 annonce « online » dès que le process démarre, avant que l'application
# ne réponde. On interroge donc réellement chaque port.
# ===========================================================================
echo ""
echo -e "${YELLOW}🩺 Contrôle de santé...${NC}"
sleep 8
FAILED=0
check() {
    local name="$1" url="$2"
    # 000 = pas de réponse. Tout code HTTP renvoyé signifie que le process écoute.
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo 000)"
    if [ "$code" = "000" ]; then
        echo -e "  ${RED}❌ $name ne répond pas ($url)${NC}"
        FAILED=1
    else
        echo -e "  ${GREEN}✅ $name répond (HTTP $code)${NC}"
    fi
}
check "API  " "http://localhost:5600/api/docs"
check "Web  " "http://localhost:5601"
check "Admin" "http://localhost:5602"

echo ""
pm2 list

echo ""
if [ "$FAILED" = "1" ]; then
    echo -e "${RED}⚠️  Déploiement terminé mais un service ne répond pas.${NC}"
    echo -e "${YELLOW}   Consultez les logs :  pm2 logs --lines 100${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Déploiement réussi !${NC}"
echo ""
echo -e "${GREEN}URLs :${NC}"
echo "  - Web   : $WEB_URL                     (localhost:5601)"
echo "  - Admin : $ADMIN_URL                 (localhost:5602)"
echo "  - API   : https://api.mkulimachain.com     (localhost:5600)"
echo "  - Docs  : https://api.mkulimachain.com/api/docs"
