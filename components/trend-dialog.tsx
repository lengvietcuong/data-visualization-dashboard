"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "../lib/supabase"
import { getCountryFlag } from "../utils/country-flags"
import { formatCompactNumber } from "../utils/number-format"

interface TrendData {
  year: number
  value: number | null
}

interface TrendDialogProps {
  isOpen: boolean
  onClose: () => void
  country: string
  countryCode: string
  indicator: {
    measure: string
    label: string
    unit: string
    color: string
  }
  yearRange: [number, number]
  normalization?: "none" | "population" | "area" | "population-density"
}

export function TrendDialog({
  isOpen,
  onClose,
  country,
  countryCode,
  indicator,
  yearRange,
  normalization = "none",
}: TrendDialogProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && country && indicator) {
      fetchTrendData()
    }
  }, [isOpen, country, indicator, yearRange, normalization])

  const fetchTrendData = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from("oecd")
        .select("measure, unit_of_measure, time_period, obs_value, nutrients")
        .eq("ref_area", countryCode)
        .gte("time_period", yearRange[0])
        .lte("time_period", yearRange[1])
        .not("obs_value", "is", null)
        .order("time_period", { ascending: true })

      if (indicator.measure === "Balance (inputs minus outputs)") {
        const nutrient = indicator.label.includes("Nitrogen") ? "Nitrogen" : "Phosphorus"
        query = query.eq("measure", indicator.measure).eq("nutrients", nutrient)
      } else {
        query = query.eq("measure", indicator.measure)
      }

      const { data, error } = await query

      if (error) throw error

      const filteredData =
        data?.filter((row) => {
          if (indicator.measure === "Balance (inputs minus outputs)") {
            const unitMatch = row.unit_of_measure?.includes("Tonnes") || row.unit_of_measure?.includes("Kilogramme")
            return unitMatch
          } else {
            const unitMatch =
              row.unit_of_measure?.includes("Tonnes") ||
              row.unit_of_measure?.includes("CO₂") ||
              row.unit_of_measure?.includes("CO2")
            return unitMatch
          }
        }) || []

      const { data: countryInfo } = await supabase
        .from("countries")
        .select("population, area_km2")
        .eq("ref_area", countryCode)
        .single()

      const chartData: TrendData[] = filteredData.map((row) => {
        let value = Number.parseFloat(row.obs_value)

        if (row.unit_of_measure?.includes("Kilogramme")) {
          value = value / 1000 // Convert kg to tonnes
        }

        if (normalization !== "none" && countryInfo) {
          switch (normalization) {
            case "population":
              if (countryInfo.population && countryInfo.population > 0) {
                value = (value / countryInfo.population) * 1000000
              }
              break
            case "area":
              if (countryInfo.area_km2 && countryInfo.area_km2 > 0) {
                value = (value / countryInfo.area_km2) * 1000
              }
              break
            case "population-density":
              if (
                countryInfo.population &&
                countryInfo.area_km2 &&
                countryInfo.population > 0 &&
                countryInfo.area_km2 > 0
              ) {
                const density = countryInfo.population / countryInfo.area_km2
                if (density > 0) {
                  value = (value / density) * 100
                }
              }
              break
          }
        }

        return {
          year: row.time_period,
          value: value,
        }
      })

      setTrendData(chartData)
    } catch (err) {
      console.error("Error fetching trend data:", err)
      setTrendData([])
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    value: {
      label: indicator.unit,
      color: indicator.color,
    },
  } satisfies ChartConfig

  const formatYAxisTick = (value: number) => {
    return formatCompactNumber(value).compact
  }

  const customTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      if (value !== null && value !== undefined) {
        const formattedValue = value.toLocaleString("en-US", {
          signDisplay: "always",
          maximumFractionDigits: 0,
        })
        return (
          <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
            <p className="font-medium">{`Year: ${label}`}</p>
            <p className="font-mono text-sm" style={{ color: indicator.color }}>
              {formattedValue}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{indicator.unit}</p>
          </div>
        )
      }
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg country-flag">{getCountryFlag(countryCode)}</span>
            {country} - {indicator.label} Growth Trend
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Measured in {indicator.unit}</p>
        </DialogHeader>
        <div className="w-full">
          {loading ? (
            <div className="w-full h-64">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-muted-foreground">No trend data available</div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart
                accessibilityLayer
                data={trendData}
                margin={{
                  left: 5,
                  right: 20,
                  top: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatYAxisTick} />
                <ChartTooltip content={customTooltipContent} />
                <Line
                  dataKey="value"
                  type="linear"
                  stroke={indicator.color}
                  strokeWidth={2}
                  dot={{ fill: indicator.color, strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
