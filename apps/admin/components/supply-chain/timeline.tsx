"use client";

import { Clock, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Step = {
  id: string;
  stepType: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  description?: string;
  metadataHash?: string;
  txHash?: string;
};

type TimelineProps = {
  steps: Step[];
  selectedStepId?: string | null;
  onSelectStep: (step: Step) => void;
};

export default function Timeline({
  steps,
  selectedStepId,
  onSelectStep,
}: TimelineProps) {
  // Sort steps by date descending (newest first)
  const sortedSteps = [...steps].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedSteps.map((step, index) => {
        const isSelected = selectedStepId === step.id;
        const isLast = index === sortedSteps.length - 1;

        return (
          <div key={step.id} className="relative pl-6 pb-6 last:pb-0">
            {/* Connecting Line */}
            {!isLast && (
              <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-border" />
            )}

            {/* Dot */}
            <div
              className={cn(
                "absolute left-0 top-1.5 h-[19px] w-[19px] rounded-full border-2 flex items-center justify-center bg-background transition-colors",
                isSelected
                  ? "border-[#3A8F4C] bg-[#3A8F4C]/10"
                  : "border-muted-foreground/30"
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isSelected ? "bg-[#3A8F4C]" : "bg-muted-foreground/30"
                )}
              />
            </div>

            {/* Content */}
            <div
              onClick={() => onSelectStep(step)}
              className={cn(
                "ml-2 -mt-1 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                isSelected
                  ? "bg-accent/50 border-[#3A8F4C]/30 shadow-sm"
                  : "bg-card border-transparent hover:bg-accent/20"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className={cn(isSelected ? "bg-[#3A8F4C]" : "")}
                >
                  {step.stepType}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(step.timestamp).toLocaleDateString()}{" "}
                  {new Date(step.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {step.locationName && (
                <div className="flex items-center text-sm text-foreground mb-2">
                  <MapPin className="w-3 h-3 mr-1 text-[#3A8F4C]" />
                  <span className="font-medium">{step.locationName}</span>
                </div>
              )}

              {step.description && (
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {step.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {step.txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 gap-1 text-[#3A8F4C] border-[#3A8F4C]/20 hover:bg-[#3A8F4C]/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://preprod.cardanoscan.io/transaction/${step.txHash}`,
                        "_blank"
                      );
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Explorer
                  </Button>
                )}
                {step.metadataHash && (
                  <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[150px]">
                    Hash: {step.metadataHash.slice(0, 12)}...
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
