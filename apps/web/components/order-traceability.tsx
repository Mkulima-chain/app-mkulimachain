"use client";

import {
  ShoppingCart,
  Calendar,
  Leaf,
  Factory,
  Package,
  Truck,
  Home,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderTraceabilityProps {
  traceability: {
    order: { completed: boolean; date?: string };
    preparation: { completed: boolean; date?: string };
    harvest: { completed: boolean; date?: string };
    processing: { completed: boolean; date?: string };
    packaging: { completed: boolean; date?: string };
    shipping: { completed: boolean; date?: string };
    delivery: { completed: boolean; date?: string };
  };
}

export function OrderTraceability({ traceability }: OrderTraceabilityProps) {
  const steps = [
    {
      id: "order",
      title: "Commande",
      icon: ShoppingCart,
      completed: traceability.order.completed,
      date: traceability.order.date,
      note: (traceability.order as any).note,
    },
    {
      id: "preparation",
      title: "Préparation",
      icon: Calendar,
      completed: traceability.preparation.completed,
      date: traceability.preparation.date,
    },
    {
      id: "harvest",
      title: "Récolte",
      icon: Leaf,
      completed: traceability.harvest.completed,
      date: traceability.harvest.date,
    },
    {
      id: "processing",
      title: "Transformation",
      icon: Factory,
      completed: traceability.processing.completed,
      date: traceability.processing.date,
    },
    {
      id: "packaging",
      title: "Emballage",
      icon: Package,
      completed: traceability.packaging.completed,
      date: traceability.packaging.date,
    },
    {
      id: "shipping",
      title: "Expédition",
      icon: Truck,
      completed: traceability.shipping.completed,
      date: traceability.shipping.date,
      note: (traceability.shipping as any).note,
    },
    {
      id: "delivery",
      title: "Livraison",
      icon: Home,
      completed: traceability.delivery.completed,
      date: traceability.delivery.date,
    },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getCurrentStep = () => {
    if (!traceability.order.completed) return 0;
    if (!traceability.preparation.completed) return 1;
    if (!traceability.harvest.completed) return 2;
    if (!traceability.processing.completed) return 3;
    if (!traceability.packaging.completed) return 4;
    if (!traceability.shipping.completed) return 5;
    if (!traceability.delivery.completed) return 6;
    return 7;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="mt-3 pt-3 border-t border-[#004D73]/10 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[#004D73] dark:text-white/70">
          Traçabilité
        </p>
        <span className="text-xs text-[#3A8F4C] font-medium">
          {currentStep}/{steps.length}
        </span>
      </div>

      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute left-0 top-3 h-0.5 bg-[#3A8F4C] transition-all duration-500"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />

        {/* Étapes */}
        <div className="relative flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.completed;
            const isCurrent = index === currentStep && !isCompleted;
            const isPending = index > currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all",
                    isCompleted
                      ? "bg-[#3A8F4C] border-[#3A8F4C] text-white"
                      : isCurrent
                        ? "bg-[#F2C94C] border-[#F2C94C] text-[#5A3E36] animate-pulse"
                        : "bg-white dark:bg-[#003D5C] border-gray-300 dark:border-gray-600 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="mt-1.5 text-center">
                  <p
                    className={cn(
                      "text-[10px] font-medium",
                      isCompleted || isCurrent
                        ? "text-[#5A3E36] dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.date && (
                    <p className="text-[9px] text-[#004D73] dark:text-white/60 mt-0.5">
                      {formatDate(step.date)}
                    </p>
                  )}
                  {(step as any).note && (
                    <p
                      className="text-[9px] text-[#004D73]/80 dark:text-white/50 mt-0.5 max-w-[60px] truncate"
                      title={(step as any).note}
                    >
                      {(step as any).note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
