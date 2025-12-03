export default function AdminPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Panneau d&apos;Administration</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Utilisateurs</h2>
            <p className="text-muted-foreground">
              Gérez les utilisateurs de la plateforme
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Produits</h2>
            <p className="text-muted-foreground">
              Gérez les produits agricoles
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Commandes</h2>
            <p className="text-muted-foreground">
              Suivez et gérez les commandes
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>
            <p className="text-muted-foreground">
              Consultez les statistiques de la plateforme
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Paramètres</h2>
            <p className="text-muted-foreground">
              Configurez les paramètres du système
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

