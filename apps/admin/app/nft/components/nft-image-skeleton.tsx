/**
 * Composant skeleton pour l'affichage pendant le chargement des images NFT
 * Affiche une animation de chargement élégante avec effet shimmer
 */
export const NFTImageSkeleton = () => {
  return (
    <div className="w-16 h-16 rounded-lg border border-border bg-muted overflow-hidden relative">
      {/* Fond avec dégradé */}
      <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
      {/* Animation shimmer */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
        style={{ transform: "translateX(-100%)" }}
      />
    </div>
  );
};
