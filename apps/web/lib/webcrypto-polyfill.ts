/**
 * WebCrypto Polyfill pour Node.js
 * Initialise @peculiar/webcrypto comme polyfill pour l'API WebCrypto
 * Nécessaire pour lucid-cardano côté serveur
 */

if (typeof window === "undefined") {
    // Côté serveur uniquement
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webcrypto = require("@peculiar/webcrypto");
    const { Crypto } = webcrypto;

    if (!globalThis.crypto) {
        globalThis.crypto = new Crypto() as Crypto;
    }

    // Assurez-vous que les APIs nécessaires sont disponibles
    if (!globalThis.crypto.subtle) {
        const crypto = new Crypto();
        globalThis.crypto = crypto as typeof globalThis.crypto;
    }
}

