#!/bin/bash

# Script de compilation des contrats Aiken

echo "🔍 Vérification de la syntaxe..."
aiken check

if [ $? -eq 0 ]; then
    echo "✅ Syntaxe correcte"
    echo ""
    echo "🔨 Compilation des contrats..."
    aiken build
    
    if [ $? -eq 0 ]; then
        echo "✅ Compilation réussie!"
        echo ""
        echo "📄 Fichier généré: plutus.json"
        echo ""
        echo "📋 Pour extraire les codes CBOR, exécutez:"
        echo "   cat plutus.json | jq '.validators[] | {title, compiledCode}'"
    else
        echo "❌ Erreur lors de la compilation"
        exit 1
    fi
else
    echo "❌ Erreurs de syntaxe détectées"
    exit 1
fi
