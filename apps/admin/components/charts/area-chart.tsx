"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

// Types
export type ChartDataPoint = {
  name: string;
  [key: string]: string | number;
};

export type ChartSeries = {
  dataKey: string;
  label: string;
  color: string;
  gradientId?: string;
};

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y";

type AreaChartProps = {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  series: ChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  trendPercent?: number;
  trendPeriod?: string;
  variant?: "default" | "linear" | "step";
};

type InteractiveChartProps = {
  title: string;
  description?: string;
  dataSets: Record<TimeRange, ChartDataPoint[]>;
  series: ChartSeries[];
  height?: number;
};

// Custom Tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Reusable Area Chart Component
 */
export function DashboardAreaChart({
  title,
  description,
  data,
  series,
  height = 300,
  showLegend = true,
  showGrid = true,
  trendPercent,
  trendPeriod,
  variant = "default",
}: AreaChartProps) {
  const curveType =
    variant === "linear" ? "linear" : variant === "step" ? "step" : "monotone";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {trendPercent !== undefined && (
            <div className="flex items-center gap-1">
              {trendPercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-[#3A8F4C]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trendPercent >= 0 ? "text-[#3A8F4C]" : "text-red-500"
                }`}
              >
                {trendPercent >= 0 ? "+" : ""}
                {trendPercent}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.dataKey}
                  id={s.gradientId || `gradient-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "10px" }}
              />
            )}
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type={curveType}
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${s.gradientId || `gradient-${s.dataKey}`})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        {trendPeriod && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {trendPeriod}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Interactive Area Chart with Time Range Selector
 */
export function InteractiveAreaChart({
  title,
  description,
  dataSets,
  series,
  height = 350,
}: InteractiveChartProps) {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("3m");
  const [isOpen, setIsOpen] = React.useState(false);

  const rangeLabels: Record<TimeRange, string> = {
    "7d": "7 derniers jours",
    "30d": "30 derniers jours",
    "3m": "3 derniers mois",
    "6m": "6 derniers mois",
    "1y": "Cette année",
  };

  const data = dataSets[selectedRange] || [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {rangeLabels[selectedRange]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              {(Object.keys(rangeLabels) as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedRange === range
                      ? "bg-accent font-medium"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {rangeLabels[range]}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.dataKey}
                  id={`interactive-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "10px" }}
            />
            {series.map((s) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#interactive-${s.dataKey})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Mini Sparkline Chart for Cards
 */
export function SparklineChart({
  data,
  dataKey,
  color = "#3A8F4C",
  height = 60,
}: {
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient
            id={`sparkline-${dataKey}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#sparkline-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
