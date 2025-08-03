"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCountryFlag, getCountryFlagWithName } from "../utils/country-flags"
import { filterCountriesByRegion, type RegionValue } from "../utils/regions"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

type NormalizationType = "none" | "population" | "area" | "population-density" | "agricultural-land"

interface LeaderboardEntry {
  rank: number
  country: string
  countryCode: string
  value: number
  exactValue: { compact: string; full: string }
  rawValue: number
}

interface IndicatorOption {
  value: string
  label: string
  measure: string
  unit: string
  category: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  bgColor: string
}

interface CountryData {
  ref_area: string
  population: number | null
  area_km2: number | null
  agricultural_land_area: number | null
}

interface LeaderboardScatterplotProps {
  indicator: IndicatorOption
  allData: LeaderboardEntry[]
  globalRegion: RegionValue
  yearRange: [number, number]
  xAxisType: NormalizationType
  countryData: Record<string, CountryData>
}

export function LeaderboardScatterplot({
  indicator,
  allData,
  globalRegion,
  yearRange,
  xAxisType,
  countryData,
}: LeaderboardScatterplotProps) {
  const [loading, setLoading] = useState(true)
  const [scatterplotData, setScatterplotData] = useState<{
    x: number[]
    y: number[]
    text: string[]
    hoverText: string[]
    countries: string[]
  }>({ x: [], y: [], text: [], hoverText: [], countries: [] })
  const { theme } = useTheme()

  useEffect(() => {
    setLoading(true)

    // Filter data by region
    const filteredData = filterCountriesByRegion(allData, globalRegion)

    // Prepare scatterplot data
    const x: number[] = []
    const y: number[] = []
    const text: string[] = []
    const hoverText: string[] = []
    const countries: string[] = []

    filteredData.forEach((entry) => {
      const countryInfo = countryData[entry.countryCode]
      if (!countryInfo) return

      let xValue: number | null = null
      let xLabel = ""
      let xUnit = ""

      // Determine x-axis value based on xAxisType
      switch (xAxisType) {
        case "none":
          xValue = entry.rawValue
          xLabel = indicator.label
          xUnit = indicator.unit
          break
        case "population":
          xValue = countryInfo.population
          xLabel = "Population"
          xUnit = "people"
          break
        case "area":
          xValue = countryInfo.area_km2
          xLabel = "Area"
          xUnit = "km²"
          break
        case "population-density":
          if (countryInfo.population && countryInfo.area_km2 && countryInfo.area_km2 > 0) {
            xValue = countryInfo.population / countryInfo.area_km2
            xLabel = "Population Density"
            xUnit = "people/km²"
          }
          break
        case "agricultural-land":
          xValue = countryInfo.agricultural_land_area
          xLabel = "Agricultural Land Area"
          xUnit = "hectares"
          break
      }

      // Only include countries with valid x and y values
      if (xValue !== null && xValue > 0 && !isNaN(entry.rawValue)) {
        x.push(xValue)
        y.push(entry.rawValue)

        const flag = getCountryFlag(entry.countryCode)
        text.push(flag)
        countries.push(entry.country)

        const flagWithName = getCountryFlagWithName(entry.countryCode)
        const hoverTemplate = `<b>${flagWithName}</b><br>${xLabel}: ${xValue.toLocaleString()} ${xUnit}<br>${indicator.label}: ${entry.exactValue.full} ${indicator.unit}<extra></extra>`
        hoverText.push(hoverTemplate)
      }
    })

    setScatterplotData({ x, y, text, hoverText, countries })
    setLoading(false)
  }, [allData, globalRegion, xAxisType, countryData, indicator])

  const IconComponent = indicator.icon

  const getXAxisLabelWithUnit = (): string => {
    switch (xAxisType) {
      case "none":
        return `${indicator.label} (${indicator.unit})`
      case "population":
        return "Population (people)"
      case "area":
        return "Area (km²)"
      case "population-density":
        return "Population Density (people/km²)"
      case "agricultural-land":
        return "Agricultural Land Area (hectares)"
      default:
        return "X-axis"
    }
  }

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
            <Skeleton className="w-32 h-5" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 min-h-0">
          <Skeleton className="w-full h-80 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (scatterplotData.x.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
            {indicator.label} vs {getXAxisLabelWithUnit()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 min-h-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No data available for this combination.</div>
        </CardContent>
      </Card>
    )
  }

  const data = [
    {
      x: scatterplotData.x,
      y: scatterplotData.y,
      mode: "markers+text" as const,
      type: "scatter" as const,
      text: scatterplotData.text,
      textposition: "middle center" as const,
      textfont: {
        size: 12,
      },
      hovertemplate: scatterplotData.hoverText,
      marker: {
        size: 8,
        color: indicator.color,
        opacity: 0.7,
        line: {
          width: 1,
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
      },
      showlegend: false,
    },
  ]

  const layout = {
    margin: { l: 60, r: 20, b: 60, t: 20 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      size: 12,
    },
    // Disable all interactions except hover
    dragmode: false,
    xaxis: {
      title: {
        text: getXAxisLabelWithUnit(),
        font: {
          size: 12,
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        },
      },
      gridcolor: theme === "dark" ? "#374151" : "#e5e7eb",
      tickfont: {
        size: 10,
        color: theme === "dark" ? "#9ca3af" : "#6b7280",
      },
      type: xAxisType === "none" ? "linear" : "log",
      tickmode: xAxisType === "none" ? "auto" : "array",
      tickvals: xAxisType === "none" ? undefined : [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000],
      ticktext: xAxisType === "none" ? undefined : ["1K", "10K", "100K", "1M", "10M", "100M", "1B"],
      showticklabels: true,
      dtick: undefined,
      fixedrange: true, // Disable zoom/pan on x-axis
    },
    yaxis: {
      title: {
        text: `${indicator.label} (${indicator.unit})`,
        font: {
          size: 12,
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        },
      },
      gridcolor: theme === "dark" ? "#374151" : "#e5e7eb",
      tickfont: {
        size: 10,
        color: theme === "dark" ? "#9ca3af" : "#6b7280",
      },
      fixedrange: true, // Disable zoom/pan on y-axis
    },
    hoverlabel: {
      bgcolor: theme === "dark" ? "#1f2937" : "#ffffff",
      font: {
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      },
    },
    hovermode: "closest", // Enable hover tooltips
    autosize: true,
  }

  const config = {
    displayModeBar: false,
    responsive: true,
    scrollZoom: false,
    doubleClick: false,
    showTips: false,
    staticPlot: false, // Allow hover interactions for tooltips
    dragmode: false,
    editable: false,
    autosizable: true,
    // Disable all pan/zoom interactions while keeping hover
    modeBarButtonsToRemove: ['pan2d', 'zoom2d', 'select2d', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'],
  }

  return (
    <Card className="flex flex-col" style={{ backgroundColor: indicator.bgColor }}>
      <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
          {indicator.label} vs {getXAxisLabelWithUnit().split('(')[0].trim()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 min-h-0">
        <div className="w-full h-80 min-h-80">
          <Plot
            data={data as any}
            layout={layout as any}
            config={config}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}
