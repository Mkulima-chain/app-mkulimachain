# Instructions de Compilation

## Problème de Compilation

Si la compilation semble se bloquer ou prendre beaucoup de temps, c'est normal lors de la première compilation car Aiken doit :
1. Télécharger les dépendances (stdlib)
2. Compiler la bibliothèque standard
3. Compiler vos contrats

## Solution

### Option 1: Attendre la fin de la compilation

Laissez la compilation se terminer complètement. Cela peut prendre 1-2 minutes la première fois :

```bash
cd contracts
aiken build
```

Attendez jusqu'à voir le message "Generating project's blueprint" ou jusqu'à ce que le fichier `plutus.json` soit créé.

### Option 2: Vérifier que la compilation fonctionne

```bash
cd contracts
# Nettoyer le cache
rm -rf build .aiken

# Vérifier la syntaxe (plus rapide)
aiken check

# Compiler (peut prendre du temps)
aiken build
```

### Option 3: Vérifier le fichier généré

Après la compilation, vérifiez que le fichier a été créé :

```bash
ls -la plutus.json
cat plutus.json | jq '.validators | length'
```

Vous devriez voir 4 validators :
- `minting_policy`
- `simple_minting_policy`
- `sale_validator`
- `simple_sale_validator`

## Extraire les Codes CBOR

Une fois la compilation réussie :

```bash
cat plutus.json | jq '.validators[] | {title, compiledCode}'
```

Cela affichera les codes CBOR pour chaque validator que vous pouvez utiliser dans votre application.

## Utilisation dans l'Application

Ajoutez les codes CBOR dans `.env.local` :

```env
NEXT_PUBLIC_PLUTUS_MINTING_POLICY_CODE=<code_cbor_du_minting_policy>
NEXT_PUBLIC_PLUTUS_SALE_VALIDATOR_CODE=<code_cbor_du_sale_validator>
```

## Dépannage

Si la compilation échoue toujours :

1. Vérifiez la version d'Aiken : `aiken --version`
2. Vérifiez que vous êtes dans le bon répertoire
3. Essayez de supprimer `build/` et `.aiken/` et recommencez
4. Vérifiez les logs d'erreur complets
