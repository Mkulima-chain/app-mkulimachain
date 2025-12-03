"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/animated-counter"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number
  suffix?: string
  prefix?: string
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  valueClassName?: string
}

export function StatsCard({
  title,
  value,
  suffix,
  prefix,
  description,
  icon,
  trend,
  className,
  valueClassName,
}: StatsCardProps) {
  return (
    <Card className={cn("border-[#004D73]/10 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 group", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[#004D73]">{title}</CardTitle>
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold mb-2", valueClassName)}>
          {prefix}
          <AnimatedCounter value={value} suffix={suffix} />
        </div>
        {description && (
          <p className="text-sm text-[#004D73] mb-2">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.isPositive ? "text-[#3A8F4C]" : "text-red-500"
          )}>
            <svg
              className={cn("w-3 h-3", trend.isPositive ? "rotate-0" : "rotate-180")}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

