# Déploiement — MkulimaChain

Guide de mise en production du monorepo sur un serveur Ubuntu, avec Nginx,
PM2, PostgreSQL et déploiement continu par GitHub Actions.

## Architecture cible

| Domaine | Application | Port interne | Process PM2 |
|---|---|---|---|
| `mkulimachain.com` | `apps/web` (Next.js) | 5601 | `mkulima-web` |
| `www.mkulimachain.com` | redirection 301 vers le domaine canonique | — | — |
| `app.mkulimachain.com` | `apps/admin` (Next.js) | 5602 | `mkulima-admin` |
| `api.mkulimachain.com` | `apps/api` (NestJS) | 5600 | `mkulima-api` |

Les ports applicatifs ne sont jamais exposés : le pare-feu n'ouvre que 22 (ou
votre port SSH), 80 et 443. Nginx joint les applications via `localhost`.

Documentation Swagger : `https://api.mkulimachain.com/api/docs`

## Fichiers ajoutés

```
nginx/mkulimachain.conf          Reverse-proxy des 4 domaines (+ WebSockets)
ecosystem.config.js              Définition des 3 process PM2
scripts/setup-server.sh          Provisioning initial (Node, pnpm, PM2, PostgreSQL, UFW)
scripts/setup-nginx.sh           Nginx + Certbot + sudo restreint pour la CI
scripts/deploy.sh                Build, migrations, redémarrage, Nginx/SSL, health check
scripts/backup-db.sh             Sauvegarde chiffrée avec somme de contrôle
scripts/restore-db.sh            Restauration + exercice automatisé (--drill)
scripts/setup-backup-cron.sh     Planification des sauvegardes
.github/workflows/ci.yml         Build, tests, déploiement sur push vers main
apps/*/env.example               Modèles de configuration
```

## 1. DNS

Créez quatre enregistrements A pointant vers l'IP publique du serveur :

```
mkulimachain.com          A    <IP>
www.mkulimachain.com      A    <IP>
app.mkulimachain.com      A    <IP>
api.mkulimachain.com      A    <IP>
```

Vérifiez la propagation **avant** de lancer Certbot — Let's Encrypt applique un
quota de 5 échecs par heure et par domaine :

```bash
dig +short api.mkulimachain.com
```

## 2. Provisioning du serveur

Connectez-vous **avec l'utilisateur de déploiement, pas root** (les
applications tournent dans son home, sans privilèges) :

```bash
ssh <utilisateur>@<IP>
git clone git@github.com-second:Mkulima-chain/app-mkulimachain.git ~/app-mkulimachain
cd ~/app-mkulimachain
bash scripts/setup-server.sh
```

Si votre serveur écoute sur un port SSH non standard, indiquez-le pour que la
règle de pare-feu soit correcte — sinon UFW vous coupera l'accès :

```bash
SSH_PORT=1994 bash scripts/setup-server.sh
```

Le script installe Node 20, pnpm, PM2, PostgreSQL et UFW, crée la base
`mkulimachain`, **génère un mot de passe PostgreSQL aléatoire** et affiche :

- les identifiants de base de données à reporter dans `apps/api/.env.local` ;
- une clé SSH privée à copier dans le secret GitHub `DEPLOY_SSH_KEY`.

Notez les deux avant de fermer le terminal.

## 3. Configuration de l'API

```bash
cp apps/api/.env.example apps/api/.env.local
nano apps/api/.env.local
```

Le nom du fichier n'est pas interchangeable : `apps/api/src/database/database.module.ts`
charge explicitement `envFilePath: '.env.local'`. Un `.env` seul ne serait lu
que par le CLI TypeORM.

Renseignez au minimum `DB_*` (valeurs affichées à l'étape 2), `JWT_SECRET` et
`JWT_REFRESH_SECRET` :

```bash
openssl rand -base64 48
```

Ce fichier n'est ni versionné ni synchronisé par la CI (`rsync --exclude '.env.local'`) :
il vit uniquement sur le serveur.

## 4. Nginx et SSL

```bash
sudo bash scripts/setup-nginx.sh
```

Le script vérifie d'abord que les DNS pointent bien ici, installe Nginx et
Certbot, obtient le certificat pour les quatre domaines, active le
renouvellement automatique, puis installe un `sudo` sans mot de passe
**restreint aux seules commandes Nginx/Certbot** — c'est ce qui permet ensuite
à `deploy.sh` de mettre à jour la configuration sans intervention.

## 5. Secrets GitHub

Dans `Settings → Secrets and variables → Actions` :

| Secret | Valeur |
|---|---|
| `DEPLOY_HOST` | IP publique du serveur |
| `DEPLOY_USER` | utilisateur de déploiement |
| `DEPLOY_PORT` | port SSH — **à définir si différent de 22** |
| `DEPLOY_SSH_KEY` | clé privée affichée à l'étape 2, intégralement |

Pour `DEPLOY_SSH_KEY`, copiez la sortie complète de `cat ~/.ssh/id_ed25519`,
lignes `BEGIN`/`END` comprises. Le workflow valide la clé avant de s'en servir
et échoue avec un message explicite si elle est tronquée.

## 6. Premier déploiement

```bash
cd ~/app-mkulimachain
bash scripts/deploy.sh
```

Ensuite, tout push sur `main` déclenche le déploiement automatiquement. La
branche `develop` ne déclenche que le build et les tests.

Le pipeline actuel construit trois fois : une fois en CI pour valider, une fois
sur le serveur. C'est plus lent qu'un transfert d'artefacts, mais cela garantit
que le build correspond exactement à l'environnement d'exécution. Si les
déploiements deviennent trop longs, l'étape suivante est de publier les
artefacts de build depuis la CI et de ne faire qu'un `pnpm install --prod` sur
le serveur.

## 7. Sauvegardes

```bash
bash scripts/setup-backup-cron.sh
```

Installe une sauvegarde quotidienne à 02h30 et un **exercice de restauration
hebdomadaire** le dimanche à 03h30 — celui-ci restaure la dernière archive dans
une base jetable, compte les tables, puis la supprime. Une sauvegarde jamais
restaurée n'est qu'une hypothèse.

La passphrase de chiffrement est générée et affichée une seule fois, puis
stockée dans `~/.mkulimachain-backup.env`. **Copiez-la hors du serveur** :
sans elle, les archives sont définitivement illisibles.

Il reste une chose que le script ne peut pas faire à votre place : copier les
archives ailleurs. Une sauvegarde stockée sur la machine qu'elle protège ne
protège de rien.

```bash
# À ajouter au cron, vers un autre hôte
rsync -az ~/backups/mkulimachain/ backup@autre-serveur:/srv/mkulimachain/
```

Restauration manuelle :

```bash
bash scripts/restore-db.sh --latest --into mkulimachain_test   # essai
bash scripts/restore-db.sh --latest                            # production (confirmation demandée)
```

## Exploitation courante

```bash
pm2 list                        # état des 3 process
pm2 logs mkulima-api --lines 100
pm2 restart mkulima-web
pm2 monit

sudo nginx -t                   # valider la config avant rechargement
sudo systemctl reload nginx
sudo certbot certificates       # échéance des certificats
```

Logs applicatifs : `~/app-mkulimachain/logs/`.

## Points d'attention

**Les variables `NEXT_PUBLIC_*` sont figées au build.** Elles sont inscrites
dans le bundle JavaScript au moment de `next build`, pas lues au démarrage.
Les modifier dans `ecosystem.config.js` seul n'a aucun effet : il faut aussi
les changer dans `scripts/deploy.sh` **et** dans `.github/workflows/ci.yml`,
puis rebuilder. Les trois doivent rester cohérents.

**Le schéma n'évolue que par migrations.** En production, `synchronize` et
`migrationsRun` sont désactivés (`apps/api/src/config/database.config.ts`).
`deploy.sh` exécute `migration:run` et interrompt le déploiement si les
migrations échouent — les services restent alors en ligne sur l'ancienne
version, ce qui est le comportement souhaitable.

**`apps/web` et `apps/admin` contiennent chacun un `package-lock.json`**,
vestige d'installations npm ponctuelles. Le monorepo est géré par pnpm : ces
fichiers sont ignorés en production mais peuvent semer la confusion. Les
supprimer est sans risque.

**CORS.** Si `FRONTEND_URL` est défini dans `.env.local`, il *remplace*
entièrement la liste par défaut codée dans `apps/api/src/main.ts` — pensez à y
inclure le web **et** l'admin, séparés par des virgules.

**Certbot et le bloc `map`.** `nginx/mkulimachain.conf` déclare une `map
$http_upgrade $connection_upgrade` pour gérer proprement les WebSockets
(socket.io : chat et notifications). Si un autre site du serveur déclare déjà
cette variable, Nginx refusera le doublon — supprimez alors le bloc de notre
fichier.
