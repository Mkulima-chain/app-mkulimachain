// Déclaration de type pour permettre l'import de fichiers CSS
declare module "*.css" {
  const content: string;
  export default content;
}

// Spécifiquement pour leaflet CSS
declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
