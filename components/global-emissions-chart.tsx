"use client"

import type { ChartConfig } from "@/components/ui/chart"

import {
  TrendingUp,
  TrendingDown,
  LineChart,
  Cloud,
  CloudRain,
  CloudFog,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGlobalEmissionsData } from "../hooks/use-global-emissions-data"
import { formatCompactNumber } from "../utils/number-format"
import type React from "react"
import { Separator } from "@/components/ui/separator"

interface GlobalEmissionsChartProps {
  yearRange: [number, number]
}

function hexToRgba(hex: string, alpha: number) {
  let r = 0,
    g = 0,
    b = 0
  // Handle #RRGGBB or #RGB
  if (hex.length === 7) {
    // #RRGGBB
    r = Number.parseInt(hex.substring(1, 3), 16)
    g = Number.parseInt(hex.substring(3, 5), 16)
    b = Number.parseInt(hex.substring(5, 7), 16)
  } else if (hex.length === 4) {
    // #RGB
    r = Number.parseInt(hex[1] + hex[1], 16)
    g = Number.parseInt(hex[2] + hex[2], 16)
    b = Number.parseInt(hex[3] + hex[3], 16)
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartConfig = {
  co2: {
    label: "Carbon Dioxide (CO₂)",
    color: "#3b82f6", // Blue
    bgColor: hexToRgba("#3b82f6", 0.03),
  },
  ghg: {
    label: "Agriculture Greenhouse Gas",
    color: "#10b981", // Green
    bgColor: hexToRgba("#10b981", 0.03),
  },
  ch4: {
    label: "Methane (CH₄)",
    color: "#f59e0b", // Orange-yellow
    bgColor: hexToRgba("#f59e0b", 0.03),
  },
  n2o: {
    label: "Nitrous Oxide (N₂O)",
    color: "#8b5cf6", // Purple
    bgColor: hexToRgba("#8b5cf6", 0.03),
  },
  nh3: {
    label: "Ammonia (NH₃)",
    color: "#ec4899", // Pink/Red
    bgColor: hexToRgba("#ec4899", 0.03),
  },
} satisfies ChartConfig

interface KpiMetric {
  label: string
  color: string
  bgColor: string
  startYear: number | null
  startValue: number | null
  endYear: number | null
  endValue: number | null
  growthPercentage: number | null
  growthDirection: "up" | "down" | "neutral"
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

export function GlobalEmissionsChart({ yearRange }: GlobalEmissionsChartProps) {
  const { emissionsData, loading, error } = useGlobalEmissionsData(yearRange)

  const calculateKpiMetrics = (): KpiMetric[] => {
    const metrics: KpiMetric[] = []

    Object.entries(chartConfig).forEach(([key, config]) => {
      const dataPoints = emissionsData.filter((d) => d[key as keyof typeof d] !== null)

      let startYear: number | null = null
      let startValue: number | null = null
      let endYear: number | null = null
      let endValue: number | null = null
      let growthPercentage: number | null = null
      let growthDirection: "up" | "down" | "neutral" = "neutral"

      if (dataPoints.length > 0) {
        // Find the first valid data point within the year range
        const firstDataPoint = dataPoints.find((d) => d.year >= yearRange[0] && d.year <= yearRange[1])
        if (firstDataPoint) {
          startYear = firstDataPoint.year
          startValue = firstDataPoint[key as keyof typeof firstDataPoint] as number
        }

        // Find the last valid data point within the year range
        const lastDataPoint = dataPoints
          .slice()
          .reverse()
          .find((d) => d.year >= yearRange[0] && d.year <= yearRange[1])
        if (lastDataPoint) {
          endYear = lastDataPoint.year
          endValue = lastDataPoint[key as keyof typeof lastDataPoint] as number
        }

        if (startValue !== null && endValue !== null && startValue !== 0) {
          growthPercentage = ((endValue - startValue) / startValue) * 100
          if (growthPercentage > 0) {
            growthDirection = "up"
          } else if (growthPercentage < 0) {
            growthDirection = "down"
          }
        } else if (startValue === 0 && endValue !== null && endValue > 0) {
          growthPercentage = Number.POSITIVE_INFINITY
          growthDirection = "up"
        } else if (startValue === 0 && endValue !== null && endValue < 0) {
          growthPercentage = Number.NEGATIVE_INFINITY
          growthDirection = "down"
        } else if (startValue === 0 && endValue === 0) {
          growthPercentage = 0
          growthDirection = "neutral"
        }
      }

      const keyToIconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
        co2: Cloud, // CO₂ Emissions - matches INDICATOR_OPTIONS
        ghg: CloudRain, // GHG Emissions - matches INDICATOR_OPTIONS
        ch4: CloudFog, // Methane (CH₄) - matches INDICATOR_OPTIONS
        n2o: CloudLightning, // Nitrous Oxide (N₂O) - matches INDICATOR_OPTIONS
        nh3: CloudDrizzle, // Ammonia (NH₃) - matches INDICATOR_OPTIONS
      }

      const IconComponent = keyToIconMap[key] || LineChart // Fallback to LineChart icon

      metrics.push({
        label: config.label,
        color: config.color,
        bgColor: config.bgColor,
        startYear,
        startValue,
        endYear,
        endValue,
        growthPercentage,
        growthDirection,
        icon: IconComponent,
      })
    })
    return metrics
  }

  const kpiMetrics = calculateKpiMetrics()

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <LineChart className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">Global Emissions Trends</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-1 mb-3">
        Showing the change between the first and last year in the selected time period. Measured in Tonnes of CO₂-equivalent
      </p>
      {loading ? (
        <GlobalEmissionsChartSkeleton count={kpiMetrics.length} />
      ) : error ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-600">Error loading emissions data: {error}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 xl:gap-2">
          {kpiMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="flex flex-col justify-between p-4 min-h-[88px] h-[88px]"
              style={{ backgroundColor: metric.bgColor }}
            >
              <CardContent className="p-0 flex justify-between items-center h-full">
                {/* Left column: Title and Year/Values */}
                <div className="flex flex-col flex-1 justify-center">
                  <CardTitle
                    className="text-base font-semibold flex items-center gap-1"
                    style={{ color: metric.color }}
                  >
                    {metric.icon && <metric.icon className="w-4 h-4" />}
                    <span className="text-foreground">{metric.label}</span>
                  </CardTitle>
                  {metric.startValue !== null && metric.endValue !== null ? (
                    <div className="text-sm flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{metric.startYear}:</span>
                        <span className="font-medium">{formatCompactNumber(metric.startValue).compact}</span>
                      </div>
                      <Separator orientation="vertical" className="h-4 bg-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{metric.endYear}:</span>
                        <span className="font-medium">{formatCompactNumber(metric.endValue).compact}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">No data available</div>
                  )}
                </div>

                {/* Right column: Percentage */}
                {metric.growthPercentage !== null && (
                  <div className="flex items-center justify-end ml-4">
                    <span className="text-2xl font-bold flex items-center gap-1" style={{ color: metric.color }}>
                      {metric.growthDirection === "up" && <TrendingUp className="w-6 h-6" />}
                      {metric.growthDirection === "down" && <TrendingDown className="w-6 h-6" />}
                      {metric.growthPercentage === Number.POSITIVE_INFINITY
                        ? "∞%"
                        : metric.growthPercentage === Number.NEGATIVE_INFINITY
                          ? "-∞%"
                          : `${Math.abs(metric.growthPercentage).toFixed(1)}%`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface GlobalEmissionsChartSkeletonProps {
  count?: number
}

function GlobalEmissionsChartSkeleton({ count = 5 }: GlobalEmissionsChartSkeletonProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"] // Matching colors from chartConfig

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 xl:gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="flex flex-col justify-between p-4 min-h-[88px] h-[88px]"
          style={{
            backgroundColor: hexToRgba(colors[i % colors.length], 0.03),
          }}
        >
          <CardContent className="p-0 flex justify-between items-center h-full">
            {/* Left column: Title and Year/Values */}
            <div className="flex flex-col flex-1 justify-center">
              <div className="text-base font-semibold flex items-center gap-1">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-24 h-4" />
              </div>
              <div className="text-sm flex items-center gap-2 mt-1">
                <Skeleton className="w-10 h-3" />
                <Skeleton className="w-16 h-3" />
                <div className="h-4 w-px bg-muted-foreground" />
                <Skeleton className="w-10 h-3" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>

            {/* Right column: Percentage */}
            <div className="flex items-center justify-end ml-4">
              <Skeleton className="w-20 h-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
