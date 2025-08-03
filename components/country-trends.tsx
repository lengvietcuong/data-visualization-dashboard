"use client"

import { useState } from "react"
import { LineChart, Cloud, Mountain, Zap } from "lucide-react"
import { GiCow } from "react-icons/gi"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { useCountryData } from "../hooks/use-country-data"
import { INDICATOR_OPTIONS } from "../hooks/use-dashboard-data"
import { getCountryFlag } from "../utils/country-flags"
import { formatCompactNumber } from "../utils/number-format"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown } from "lucide-react"

function hexToRgba(hex: string, alpha: number) {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 7) {
    r = Number.parseInt(hex.substring(1, 3), 16)
    g = Number.parseInt(hex.substring(3, 5), 16)
    b = Number.parseInt(hex.substring(5, 7), 16)
  } else if (hex.length === 4) {
    r = Number.parseInt(hex[1] + hex[1], 16)
    g = Number.parseInt(hex[2] + hex[2], 16)
    b = Number.parseInt(hex[3] + hex[3], 16)
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface CountryTrendsProps {
  countryCode: string
  countryName: string
  yearRange: [number, number]
}

export function CountryTrends({ countryCode, countryName, yearRange }: CountryTrendsProps) {
  const [activeTab, setActiveTab] = useState<"emissions" | "agriculture" | "livestock" | "nutrients">("emissions")
  const { data, loading, error } = useCountryData(countryCode, yearRange)

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "emissions":
        return Cloud
      case "agriculture":
        return Mountain
      case "livestock":
        return GiCow
      case "nutrients":
        return Zap
      default:
        return LineChart
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "emissions":
        return "Emissions"
      case "agriculture":
        return "Land"
      case "livestock":
        return "Livestock"
      case "nutrients":
        return "Nutrients"
      default:
        return tab
    }
  }

  if (loading) {
    return <CountryTrendsSkeleton countryName={countryName} />
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            <span className="country-flag">{getCountryFlag(countryCode)}</span> {countryName} Trends
          </h3>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-600">Error loading country data: {error}</div>
        </div>
      </div>
    )
  }

  const categoryData = data[activeTab] || []
  const categoryIndicators = INDICATOR_OPTIONS.filter((ind) => ind.category === activeTab)

  // Calculate KPI metrics for the active category
  const kpiMetrics = categoryIndicators.map((indicator) => {
    const dataPoints = categoryData.filter((d) => d[indicator.value] !== null)

    let startYear: number | null = null
    let startValue: number | null = null
    let endYear: number | null = null
    let endValue: number | null = null
    let growthPercentage: number | null = null
    let growthDirection: "up" | "down" | "neutral" = "neutral"

    if (dataPoints.length > 0) {
      const sortedPoints = dataPoints.sort((a, b) => a.year - b.year)
      const firstPoint = sortedPoints[0]
      const lastPoint = sortedPoints[sortedPoints.length - 1]

      startYear = firstPoint.year
      startValue = firstPoint[indicator.value] as number
      endYear = lastPoint.year
      endValue = lastPoint[indicator.value] as number

      if (startValue !== null && endValue !== null && startValue !== 0) {
        growthPercentage = ((endValue - startValue) / startValue) * 100
        growthDirection = growthPercentage > 0 ? "up" : growthPercentage < 0 ? "down" : "neutral"
      }
    }

    return {
      ...indicator,
      startYear,
      startValue,
      endYear,
      endValue,
      growthPercentage,
      growthDirection,
    }
  })

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl country-flag">{getCountryFlag(countryCode)}</span>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{countryName} Trends</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing the change from the first to the last year in the selected time period.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {["emissions", "agriculture", "livestock", "nutrients"].map((tab) => {
            const Icon = getTabIcon(tab)
            return (
              <TabsTrigger key={tab} value={tab} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {getTabLabel(tab)}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {["emissions", "agriculture", "livestock", "nutrients"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {kpiMetrics.map((metric) => (
                <Card
                  key={metric.value}
                  className="flex flex-col justify-between p-4 min-h-[88px] h-[88px]"
                  style={{ backgroundColor: metric.bgColor }}
                >
                  <CardContent className="p-0 flex justify-between items-center h-full">
                    <div className="flex flex-col flex-1 justify-center">
                      <CardTitle
                        className="text-base font-semibold flex items-center gap-1"
                        style={{ color: metric.color }}
                      >
                        <metric.icon className="w-4 h-4" />
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

                    {metric.growthPercentage !== null && (
                      <div className="flex items-center justify-end ml-4">
                        <span className="text-2xl font-bold flex items-center gap-1" style={{ color: metric.color }}>
                          {metric.growthDirection === "up" && <TrendingUp className="w-6 h-6" />}
                          {metric.growthDirection === "down" && <TrendingDown className="w-6 h-6" />}
                          {`${Math.abs(metric.growthPercentage).toFixed(1)}%`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Line Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categoryIndicators.map((indicator) => {
                const chartData = categoryData
                  .filter((d) => d[indicator.value] !== null)
                  .map((d) => ({
                    year: d.year,
                    value: d[indicator.value] as number,
                  }))

                return (
                  <Card key={indicator.value} className="p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold flex items-center gap-2" style={{ color: indicator.color }}>
                        <indicator.icon className="w-4 h-4" />
                        {indicator.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">Measured in {indicator.unit}</p>
                    </div>

                    {chartData.length === 0 ? (
                      <div className="flex items-center justify-center h-48">
                        <div className="text-sm text-muted-foreground">No data available</div>
                      </div>
                    ) : (
                      <ChartContainer
                        config={{
                          value: {
                            label: indicator.unit,
                            color: indicator.color,
                          },
                        }}
                        className="h-48 w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => formatCompactNumber(value).compact} />
                            <ChartTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const value = payload[0].value as number
                                  return (
                                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                                      <p className="font-medium">{`Year: ${label}`}</p>
                                      <p className="font-mono text-sm" style={{ color: indicator.color }}>
                                        {value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">{indicator.unit}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={indicator.color}
                              strokeWidth={2}
                              dot={{ fill: indicator.color, strokeWidth: 2, r: 4 }}
                              connectNulls={false}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function CountryTrendsSkeleton({ countryName }: { countryName: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-8 rounded" />
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">{countryName} Trends</h3>
      </div>

      <div className="space-y-6">
        <Skeleton className="w-full h-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px]" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  )
}
