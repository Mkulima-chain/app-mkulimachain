"use client";

import * as React from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Eye,
  Copy,
  Power,
  PowerOff,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { ImageUpload } from "@/components/ui/image-upload";

type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  originCountry?: string;
  isActive: boolean;
  tags?: string[];
  image?: string[];
  createdAt: string;
  updatedAt: string;
};

type CreateProductDto = {
  sku: string;
  name: string;
  unit: string;
  category: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  originCountry?: string;
  isActive?: boolean;
  tags?: string[];
  image?: string[];
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [formData, setFormData] = React.useState<CreateProductDto>({
    sku: "",
    name: "",
    unit: "",
    category: "",
    description: "",
    price: 0,
    currency: "",
    stock: 0,
    originCountry: "",
    isActive: true,
    tags: [],
    image: [],
  });

  // Fonction pour générer le SKU automatiquement
  const generateSKU = (productName: string): string => {
    if (!productName || productName.trim() === "") {
      return "";
    }

    // Normaliser le nom: enlever les accents, mettre en majuscules, remplacer les espaces par des tirets
    const normalizedName = productName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-") // Remplacer les caractères non alphanumériques par des tirets
      .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, ""); // Enlever les tirets en début et fin

    // Générer un nombre unique basé sur le timestamp (3 derniers chiffres)
    const uniqueNumber = Date.now().toString().slice(-3);

    // Concaténer: SKU-NOMDUPRODUIT-NOMBREUNIQUE
    return `SKU-${normalizedName}-${uniqueNumber}`;
  };

  // Fetch products
  const {
    data: products = [],
    isLoading,
    refetch,
  } = useApiQuery<Product[]>(
    ["products", searchQuery],
    `/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Fetch categories, units, and currencies
  type Category = { id: string; name: string };
  type Unit = { id: string; name: string; symbol: string };
  type Currency = { id: string; code: string; name: string };

  const { data: categories = [] } = useApiQuery<Category[]>(
    ["categories"],
    "/categories?activeOnly=true"
  );
  const { data: units = [] } = useApiQuery<Unit[]>(
    ["units"],
    "/units?activeOnly=true"
  );
  const { data: currencies = [] } = useApiQuery<Currency[]>(
    ["currencies"],
    "/currencies?activeOnly=true"
  );

  // Create mutation
  const createMutation = useApiMutation<Product, CreateProductDto>(
    "/products",
    "POST",
    {
      onSuccess: () => {
        toast.success("Produit ajouté avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  // Update mutation
  const updateMutation = useApiMutation<Product, CreateProductDto>(
    () => `/products/${selectedProduct?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Produit modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        refetch();
      },
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/products/${selectedProduct?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Produit supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
        refetch();
      },
    }
  );

  // Toggle active status mutation
  const toggleActiveMutation = useApiMutation<Product, { isActive: boolean }>(
    (variables) => `/products/${selectedProduct?.id}`,
    "PUT",
    {
      onSuccess: (_, variables) => {
        toast.success(
          variables.isActive
            ? "Produit activé avec succès"
            : "Produit désactivé avec succès"
        );
        setSelectedProduct(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    setFormData({
      sku: "",
      name: "",
      unit: "",
      category: "",
      description: "",
      price: 0,
      currency: "",
      stock: 0,
      originCountry: "",
      isActive: true,
      tags: [],
      image: [],
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      category: product.category,
      description: product.description || "",
      price: Number(product.price),
      currency: product.currency,
      stock: Number(product.stock),
      originCountry: product.originCountry || "",
      isActive: product.isActive,
      tags: product.tags || [],
      image: product.image || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    setFormData({
      sku: generateSKU(product.name + " (Copie)"),
      name: product.name + " (Copie)",
      unit: product.unit,
      category: product.category,
      description: product.description || "",
      price: Number(product.price),
      currency: product.currency,
      stock: 0,
      originCountry: product.originCountry || "",
      isActive: false,
      tags: product.tags || [],
      image: [],
    });
    setIsAddDialogOpen(true);
    toast.success("Produit dupliqué, veuillez compléter les informations");
  };

  const handleToggleActive = (product: Product) => {
    setSelectedProduct(product);
    toggleActiveMutation.mutate({ isActive: !product.isActive });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    updateMutation.mutate(formData);
  };

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;
    deleteMutation.mutate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les produits agricoles de la plateforme
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total produits
            </CardTitle>
            <Package className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : products.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "..." : products.filter((p) => p.isActive).length}{" "}
              actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
            <Package className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : products.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unités disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : products
                    .reduce(
                      (sum, p) => sum + Number(p.price) * Number(p.stock),
                      0
                    )
                    .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "..." : products[0]?.currency || "USD"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Produits actifs
            </CardTitle>
            <Package className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : products.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading
                ? "..."
                : `${Math.round((products.filter((p) => p.isActive).length / products.length) * 100) || 0}% du total`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des produits</CardTitle>
              <CardDescription>
                Recherchez et gérez les produits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono">
                              {product.sku}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {product.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {Number(product.price).toFixed(2)}{" "}
                              {product.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{product.stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                product.isActive ? "default" : "secondary"
                              }
                            >
                              {product.isActive ? "Actif" : "Inactif"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-48 p-2">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => handleView(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir les détails
                                  </button>
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDuplicate(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Copy className="h-4 w-4" />
                                    Dupliquer
                                  </button>
                                  <button
                                    onClick={() => handleToggleActive(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    disabled={toggleActiveMutation.isPending}
                                  >
                                    {product.isActive ? (
                                      <>
                                        <PowerOff className="h-4 w-4" />
                                        Désactiver
                                      </>
                                    ) : (
                                      <>
                                        <Power className="h-4 w-4" />
                                        Activer
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t my-1" />
                                  <button
                                    onClick={() => handleDelete(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU (Référence unique) *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Généré automatiquement"
                />
                <p className="text-xs text-muted-foreground">
                  Le SKU est généré automatiquement à partir du nom du produit
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const newSKU = generateSKU(newName);
                    setFormData({ ...formData, name: newName, sku: newSKU });
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Prix unitaire *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock initial</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="originCountry">Pays d&apos;origine</Label>
                  <Input
                    id="originCountry"
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originCountry: e.target.value,
                      })
                    }
                    placeholder="CD, FR, etc."
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  images={formData.image || []}
                  onImagesChange={(images) =>
                    setFormData({ ...formData, image: images })
                  }
                  maxImages={5}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="isActive"
                  className="text-sm font-normal cursor-pointer"
                >
                  Produit actif
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU (Référence unique) *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Le SKU ne peut pas être modifié après la création
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du produit *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unité *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Prix unitaire *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-originCountry">
                    Pays d&apos;origine
                  </Label>
                  <Input
                    id="edit-originCountry"
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  images={formData.image || []}
                  onImagesChange={(images) =>
                    setFormData({ ...formData, image: images })
                  }
                  maxImages={5}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="edit-isActive"
                  className="text-sm font-normal cursor-pointer"
                >
                  Produit actif
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#3A8F4C]" />
              Détails du produit
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur le produit
            </DialogDescription>
          </DialogHeader>

          {selectedProduct ? (
            <div className="space-y-6">
              {/* Image */}
              {selectedProduct.image && selectedProduct.image.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedProduct.image.map((img, index) => (
                    <div
                      key={index}
                      className="w-32 h-32 rounded-lg border bg-muted flex-shrink-0 overflow-hidden"
                    >
                      <img
                        src={img}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Informations principales */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SKU</p>
                    <p className="text-base font-mono font-semibold">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nom</p>
                    <p className="text-base font-semibold">{selectedProduct.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                    <Badge variant="outline">{selectedProduct.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unité</p>
                    <p className="text-base">{selectedProduct.unit}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prix</p>
                    <p className="text-base font-semibold">
                      {Number(selectedProduct.price).toFixed(2)} {selectedProduct.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock</p>
                    <p className="text-base font-semibold">{selectedProduct.stock}</p>
                  </div>
                </div>
                {selectedProduct.originCountry && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pays d'origine</p>
                    <p className="text-base">{selectedProduct.originCountry}</p>
                  </div>
                )}
                {selectedProduct.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-base">{selectedProduct.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <Badge
                      variant={selectedProduct.isActive ? "default" : "secondary"}
                    >
                      {selectedProduct.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                    <p className="text-base text-sm">
                      {new Date(selectedProduct.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chargement des détails...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{selectedProduct?.name}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
