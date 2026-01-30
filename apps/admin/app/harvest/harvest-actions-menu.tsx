"use client";

import * as React from "react";
import { Edit, MoreVertical, Trash2, Eye, Copy, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HarvestActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  onViewMap?: () => void;
  onCopyHash?: () => void;
}

export function HarvestActionsMenu({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onViewMap,
  onCopyHash,
}: HarvestActionsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-2">
        <div className="space-y-1">
          {onView && (
            <button
              onClick={onView}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <Eye className="h-4 w-4" />
              Voir les détails
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <Copy className="h-4 w-4" />
              Dupliquer
            </button>
          )}
          {onViewMap && (
            <button
              onClick={onViewMap}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Voir sur la carte
            </button>
          )}
          {onCopyHash && (
            <button
              onClick={onCopyHash}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              Copier le hash
            </button>
          )}
          <div className="border-t my-1" />
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

