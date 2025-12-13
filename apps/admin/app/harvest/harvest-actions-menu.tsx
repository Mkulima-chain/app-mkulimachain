"use client";

import * as React from "react";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HarvestActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function HarvestActionsMenu({
  onEdit,
  onDelete,
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
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
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

