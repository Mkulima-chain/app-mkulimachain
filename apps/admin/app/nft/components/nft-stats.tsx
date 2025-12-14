import { Image } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFT, NFTStatus } from "../types";

interface NFTStatsProps {
  nfts: NFT[];
  isLoading: boolean;
}

export const NFTStats = ({ nfts, isLoading }: NFTStatsProps) => {
  const activeNFTs = nfts.filter((n) => n.status === NFTStatus.LISTED);
  const totalRevenue = nfts
    .filter((n) => n.status === NFTStatus.SOLD)
    .reduce((sum, n) => sum + Number(n.priceADA || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">NFTs créés</CardTitle>
          <Image className="h-5 w-5 text-[#3A8F4C]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : nfts.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenus générés</CardTitle>
          <Image className="h-5 w-5 text-[#5A3E36]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₳ {isLoading ? "..." : totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pour fonds scolaires
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">NFTs en vente</CardTitle>
          <Image className="h-5 w-5 text-[#004D73]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : activeNFTs.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Actuellement</p>
        </CardContent>
      </Card>
    </div>
  );
};
