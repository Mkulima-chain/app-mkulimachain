"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteWalletDialog({
  open,
  onOpenChange,
  walletAddress,
  onConfirm,
  isPending,
}: DeleteWalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supprimer le portefeuille</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce portefeuille
            {walletAddress && (
              <>
                {" "}
                <span className="font-mono text-xs">
                  ({walletAddress.slice(0, 8)}...)
                </span>
              </>
            )}
            ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
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
  );
}
