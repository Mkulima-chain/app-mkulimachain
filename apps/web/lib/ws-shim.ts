/**
 * Module shim pour ws (WebSocket) côté client
 * ws est un package Node.js qui ne peut pas être utilisé côté client
 * Ce module vide permet à lucid-cardano de fonctionner côté client
 * sans essayer d'importer ws
 */

// Module vide pour remplacer ws côté client
export default null;

