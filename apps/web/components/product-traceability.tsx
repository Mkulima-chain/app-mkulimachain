"use client"

import { useState } from "react"
import { 
  Sparkles, Copy, Check, ExternalLink, Calendar, 
  Factory, Truck, Package, Store, CheckCircle2,
  Leaf, Award, MapPin, Users, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TraceabilityStep {
  id: string
  title: string
  description: string
  date: string
  location?: string
  actor?: string
  icon: React.ReactNode
  status: "completed" | "current" | "pending"
}

interface ProductTraceabilityProps {
  blockchainHash?: string
  producer: string
  location: string
  certified: boolean
  harvestDate?: string
  processingDate?: string
  packagingDate?: string
  shippingDate?: string
  arrivalDate?: string
}

export function ProductTraceability({
  blockchainHash,
  producer,
  location,
  certified,
  harvestDate,
  processingDate,
  packagingDate,
  shippingDate,
  arrivalDate,
}: ProductTraceabilityProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyHash = () => {
    if (blockchainHash) {
      navigator.clipboard.writeText(blockchainHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Générer les étapes de traçabilité
  const steps: TraceabilityStep[] = [
    {
      id: "1",
      title: "Récolte",
      description: "Récolte des matières premières",
      date: harvestDate || "2024-01-05",
      location: location,
      actor: producer,
      icon: <Leaf className="w-4 h-4" />,
      status: "completed",
    },
    {
      id: "2",
      title: "Transformation",
      description: "Transformation et traitement",
      date: processingDate || "2024-01-08",
      location: location,
      actor: producer,
      icon: <Factory className="w-4 h-4" />,
      status: "completed",
    },
    {
      id: "3",
      title: "Emballage",
      description: "Conditionnement et emballage",
      date: packagingDate || "2024-01-10",
      location: location,
      actor: producer,
      icon: <Package className="w-4 h-4" />,
      status: "completed",
    },
    {
      id: "4",
      title: "Expédition",
      description: "Envoi vers le point de vente",
      date: shippingDate || "2024-01-12",
      location: location,
      actor: "Transporteur",
      icon: <Truck className="w-4 h-4" />,
      status: shippingDate ? "completed" : "current",
    },
    {
      id: "5",
      title: "Arrivée",
      description: "Réception au point de vente",
      date: arrivalDate || "2024-01-15",
      location: "Entrepôt Mkulima Chain",
      actor: "Mkulima Chain",
      icon: <Store className="w-4 h-4" />,
      status: arrivalDate ? "completed" : "pending",
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStepColor = (status: TraceabilityStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-[#3A8F4C] border-[#3A8F4C] text-white"
      case "current":
        return "bg-[#F2C94C] border-[#F2C94C] text-[#5A3E36]"
      case "pending":
        return "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-4">
      {/* Blockchain Hash */}
      {blockchainHash && (
        <Card className="bg-gradient-to-br from-[#3A8F4C]/10 to-[#004D73]/10 dark:from-[#3A8F4C]/20 dark:to-[#004D73]/30 border-[#3A8F4C]/30 dark:border-[#3A8F4C]/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30">
                  <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#5A3E36] dark:text-white text-sm">Hash Blockchain</h3>
                  <p className="text-xs text-[#004D73] dark:text-white/70">Identifiant unique sur la blockchain</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyHash}
                className="h-8 w-8 hover:bg-[#3A8F4C]/10 dark:hover:bg-[#3A8F4C]/20"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#3A8F4C]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#5A3E36] dark:text-white/70" />
                )}
              </Button>
            </div>
            <div className="bg-white/50 dark:bg-[#003D5C]/50 rounded-lg p-3 border border-[#004D73]/20 dark:border-white/20">
              <p className="text-xs font-mono text-[#004D73] dark:text-white/70 break-all">
                {blockchainHash}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8 border-[#004D73]/20 dark:border-white/20"
                onClick={() => window.open(`https://cardanoscan.io/transaction/${blockchainHash}`, "_blank")}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Voir sur CardanoScan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {certified && (
        <Card className="bg-gradient-to-br from-[#F2C94C]/10 to-[#F2C94C]/5 dark:from-[#F2C94C]/20 dark:to-[#F2C94C]/10 border-[#F2C94C]/30 dark:border-[#F2C94C]/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F2C94C]/20 dark:bg-[#F2C94C]/30">
                <Award className="w-5 h-5 text-[#F2C94C]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#5A3E36] dark:text-white text-sm mb-1">Certification Bio</h3>
                <p className="text-xs text-[#004D73] dark:text-white/70">Produit certifié biologique et traçable</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-[#3A8F4C]" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de traçabilité */}
      <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#3A8F4C]" />
            <h3 className="font-semibold text-[#5A3E36] dark:text-white">Chaîne d'approvisionnement</h3>
          </div>
          
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3A8F4C] via-[#3A8F4C]/50 to-gray-200 dark:to-gray-700" />
            
            {/* Étapes */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Icône de l'étape */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                    getStepColor(step.status)
                  )}>
                    {step.icon}
                  </div>
                  
                  {/* Contenu de l'étape */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="font-semibold text-sm text-[#5A3E36] dark:text-white">
                          {step.title}
                        </h4>
                        <p className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                      {step.status === "completed" && (
                        <CheckCircle2 className="w-4 h-4 text-[#3A8F4C] flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#004D73] dark:text-white/60">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(step.date)}</span>
                      </div>
                      {step.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[#004D73] dark:text-white/60">
                          <MapPin className="w-3 h-3" />
                          <span>{step.location}</span>
                        </div>
                      )}
                      {step.actor && (
                        <div className="flex items-center gap-1.5 text-xs text-[#004D73] dark:text-white/60">
                          <Users className="w-3 h-3" />
                          <span>{step.actor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations producteur */}
      <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[#3A8F4C]" />
            <h3 className="font-semibold text-[#5A3E36] dark:text-white">Producteur</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[#004D73] dark:text-white/60 mb-1">Nom</p>
              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">{producer}</p>
            </div>
            <div>
              <p className="text-xs text-[#004D73] dark:text-white/60 mb-1">Localisation</p>
              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">{location}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

