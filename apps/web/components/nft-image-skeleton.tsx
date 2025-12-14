/**
 * Composant skeleton pour l'affichage pendant le chargement des images NFT
 * Affiche une animation de chargement élégante avec effet shimmer
 */
export const NFTImageSkeleton = () => {
  return (
    <div className="w-full h-64 rounded-lg border border-border bg-muted overflow-hidden relative animate-shimmer">
      {/* Fond avec dégradé */}
      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
    </div>
  );
};
