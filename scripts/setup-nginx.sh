#!/bin/bash
# ===========================================================================
# Configuration Nginx + SSL — MkulimaChain
#
# À exécuter UNE SEULE FOIS sur le serveur de production, depuis la racine
# du dépôt :
#   cd ~/app-mkulimachain && sudo bash scripts/setup-nginx.sh
#
# Prérequis : les enregistrements DNS A doivent DÉJÀ pointer vers ce serveur.
#   mkulimachain.com       -> <IP du serveur>
#   www.mkulimachain.com   -> <IP du serveur>
#   app.mkulimachain.com   -> <IP du serveur>
#   api.mkulimachain.com   -> <IP du serveur>
#
# Vérifiez avant de lancer :  dig +short api.mkulimachain.com
# Certbot échoue si le DNS n'est pas encore propagé.
# ===========================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Racine du dépôt, déduite de l'emplacement du script : robuste même sous sudo,
# où $HOME vaudrait /root au lieu du home de l'utilisateur de déploiement.
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NGINX_SITE="mkulimachain"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-contact@mkulimachain.com}"
DOMAINS=(mkulimachain.com www.mkulimachain.com app.mkulimachain.com api.mkulimachain.com)

echo -e "${GREEN}🔧 Configuration de Nginx pour MkulimaChain${NC}"
echo -e "${GREEN}   (source : $APP_DIR/nginx/mkulimachain.conf)${NC}"

# ===========================================================================
# 0. Vérification DNS
#
# Certbot consomme un quota Let's Encrypt à chaque tentative. Autant détecter
# un DNS non propagé maintenant, gratuitement.
# ===========================================================================
SERVER_IP="$(curl -s --max-time 10 https://api.ipify.org || echo '')"
if [ -n "$SERVER_IP" ] && command -v dig >/dev/null 2>&1; then
    echo -e "${YELLOW}🌐 Vérification DNS (IP publique de ce serveur : $SERVER_IP)...${NC}"
    DNS_KO=0
    for d in "${DOMAINS[@]}"; do
        RESOLVED="$(dig +short "$d" | tail -n1)"
        if [ "$RESOLVED" = "$SERVER_IP" ]; then
            echo -e "  ${GREEN}✅ $d -> $RESOLVED${NC}"
        else
            echo -e "  ${RED}❌ $d -> ${RESOLVED:-(aucune réponse)}${NC}"
            DNS_KO=1
        fi
    done
    if [ "$DNS_KO" = "1" ]; then
        echo ""
        echo -e "${RED}Certains domaines ne pointent pas vers ce serveur.${NC}"
        echo -e "${YELLOW}Corrigez les enregistrements DNS A, attendez la propagation,${NC}"
        echo -e "${YELLOW}puis relancez ce script. (Ctrl+C pour arrêter, Entrée pour continuer${NC}"
        echo -e "${YELLOW}malgré tout — Certbot échouera probablement.)${NC}"
        [ -t 0 ] && read -r _ || true
    fi
fi

# ===========================================================================
# 1. Installation de Nginx
# ===========================================================================
echo -e "${YELLOW}📦 Installation de Nginx...${NC}"
sudo apt update
sudo apt install -y nginx dnsutils

# ===========================================================================
# 2. Copie de la configuration
# ===========================================================================
echo -e "${YELLOW}📋 Copie de la configuration Nginx...${NC}"
sudo cp "$APP_DIR/nginx/mkulimachain.conf" "/etc/nginx/sites-available/$NGINX_SITE"
sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" /etc/nginx/sites-enabled/

# Le site par défaut capture le port 80 et masque nos server_name.
sudo rm -f /etc/nginx/sites-enabled/default

# ===========================================================================
# 3. Test et rechargement
# ===========================================================================
echo -e "${YELLOW}🔍 Test de la configuration...${NC}"
sudo nginx -t

echo -e "${YELLOW}🔄 Rechargement de Nginx...${NC}"
sudo systemctl reload nginx
sudo systemctl enable nginx

# ===========================================================================
# 4. Certbot (Let's Encrypt)
# ===========================================================================
echo -e "${YELLOW}🔒 Installation de Certbot...${NC}"
sudo apt install -y certbot python3-certbot-nginx

echo -e "${YELLOW}🔒 Obtention des certificats SSL...${NC}"
CERTBOT_ARGS=()
for d in "${DOMAINS[@]}"; do CERTBOT_ARGS+=(-d "$d"); done
sudo certbot --nginx "${CERTBOT_ARGS[@]}" \
    --non-interactive --agree-tos --email "$CERTBOT_EMAIL" --redirect

echo -e "${YELLOW}⏰ Activation du renouvellement automatique...${NC}"
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# ===========================================================================
# 5. sudo sans mot de passe, restreint au strict nécessaire
#
# Permet à scripts/deploy.sh (donc à GitHub Actions) de réappliquer la config
# Nginx et d'étendre le certificat sans invite de mot de passe — limité aux
# commandes exactes utilisées, rien de plus.
# ===========================================================================
DEPLOY_USER="${SUDO_USER:-$(whoami)}"
echo -e "${YELLOW}🔑 Attribution d'un sudo restreint à '${DEPLOY_USER}' (Nginx/SSL)...${NC}"
SUDOERS_FILE="/etc/sudoers.d/mkulimachain-deploy"
sudo tee "$SUDOERS_FILE" > /dev/null <<EOF
# Géré par scripts/setup-nginx.sh — autorise les déploiements automatisés à
# mettre à jour Nginx et le certificat SSL.
${DEPLOY_USER} ALL=(root) NOPASSWD: /usr/bin/cp * /etc/nginx/sites-available/${NGINX_SITE}, /usr/bin/ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/, /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx, /usr/bin/certbot *, /usr/bin/certbot
EOF
sudo chmod 0440 "$SUDOERS_FILE"
if sudo visudo -c -f "$SUDOERS_FILE"; then
    echo -e "${GREEN}✅ sudo restreint configuré (${SUDOERS_FILE}).${NC}"
else
    echo -e "${YELLOW}⚠️  Validation sudoers échouée — suppression de ${SUDOERS_FILE}.${NC}"
    sudo rm -f "$SUDOERS_FILE"
fi

echo ""
echo -e "${GREEN}✅ Nginx et SSL sont configurés !${NC}"
echo ""
echo -e "${GREEN}Vos sites sont accessibles sur :${NC}"
echo "  - https://mkulimachain.com          (Web public)"
echo "  - https://app.mkulimachain.com      (Admin)"
echo "  - https://api.mkulimachain.com      (API)"
echo "  - https://api.mkulimachain.com/api/docs  (Swagger)"
