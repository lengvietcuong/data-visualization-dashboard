"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCountryFlag, getCountryFlagWithName, getCountryName } from "../utils/country-flags"
import { filterCountriesByRegion, type RegionValue } from "../utils/regions"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

type NormalizationType = "none" | "population" | "area" | "population-density" | "agricultural-land"
type LeaderboardType = "raw-value" | "total-growth" | "avg-yearly-growth" | "total-growth-rate" | "annual-growth-rate"

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

interface LeaderboardTreemapProps {
  indicator: IndicatorOption
  allData: LeaderboardEntry[]
  currentView: "up" | "down"
  globalRegion: RegionValue
  yearRange: [number, number]
  normalization: NormalizationType
  leaderboardType: LeaderboardType
  onViewChange: (view: "up" | "down") => void
}

export function LeaderboardTreemap({
  indicator,
  allData,
  currentView,
  globalRegion,
  yearRange,
  normalization,
  leaderboardType,
  onViewChange,
}: LeaderboardTreemapProps) {
  const [loading, setLoading] = useState(true)
  const [treemapData, setTreemapData] = useState<LeaderboardEntry[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    setLoading(true)
    let dataToProcess = allData

    // Apply view filter (up/down) - should work for all leaderboard types
    const positiveData = allData.filter((entry) => entry.rawValue >= 0)
    const negativeData = allData.filter((entry) => entry.rawValue < 0)

    // Choose data based on current view
    if (currentView === "up") {
      dataToProcess = positiveData
    } else {
      dataToProcess = negativeData
    }

    // Apply region filter
    const filteredData = filterCountriesByRegion(dataToProcess, globalRegion)

    // Sort data for treemap (largest values first)
    const sortedData = filteredData.sort((a, b) => b.rawValue - a.rawValue)

    // Debug logging to check if EU types are present
    const euTypes = sortedData.filter((d) => d.countryCode.startsWith("EU"))
    if (euTypes.length > 0) {
      console.log(
        `Found ${euTypes.length} EU types for ${indicator.label}:`,
        euTypes.map((d) => `${d.countryCode}: ${d.country}`),
      )
    }

    setTreemapData(sortedData)
    setLoading(false)
  }, [allData, currentView, globalRegion, leaderboardType, indicator.label])

  const IconComponent = indicator.icon

  const increasingCount = allData.filter((entry) => entry.rawValue >= 0).length
  const decreasingCount = allData.filter((entry) => entry.rawValue < 0).length

  const getUnitWithNormalization = (
    baseUnit: string,
    normalization: NormalizationType,
    type: LeaderboardType,
  ): string => {
    let unit = baseUnit
    if (type === "total-growth" || type === "avg-yearly-growth") {
      unit = `${baseUnit} change`
    } else if (type === "total-growth-rate" || type === "annual-growth-rate") {
      unit = "%"
    }

    switch (normalization) {
      case "population":
        return `${unit} per million people`
      case "area":
        return `${unit} per 1000 km²`
      case "population-density":
        return `${unit} per 100 people per km²`
      case "agricultural-land":
        return `${unit} per 1000 hectares of agricultural land`
      default:
        return unit
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
          <Skeleton className="w-40 h-3 mt-1" />
        </CardHeader>
        <CardContent className="p-4 flex-1 min-h-0">
          <Skeleton className="w-full h-80 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (treemapData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="pb-2 pt-4 px-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
            {indicator.label} Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {getUnitWithNormalization(indicator.unit, normalization, leaderboardType)}
          </p>
        </CardHeader>
        <CardContent className="p-4 flex-1 min-h-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No data available for this view.</div>
        </CardContent>
      </Card>
    )
  }

  // Create labels - use just flag emojis (no text labels for EU types)
  const labels = treemapData.map((d) => {
    const flag = getCountryFlag(d.countryCode)
    // For EU types, we want to hide the text but still show separate rectangles
    // We'll use invisible characters or empty strings to make them unique but invisible
    if (d.countryCode.startsWith("EU")) {
      // Use zero-width characters to make each EU type unique but invisible
      const zeroWidthChars = {
        EU: "",
        EU27: "\u200B", // Zero-width space
        EU28: "\u200C", // Zero-width non-joiner
        EU27_2020: "\u200D", // Zero-width joiner
      }
      return flag + (zeroWidthChars[d.countryCode as keyof typeof zeroWidthChars] || "")
    }
    return flag
  })

  const values = treemapData.map((d) => Math.abs(d.rawValue)) // Use absolute value for treemap size
  const parents = Array(labels.length).fill("") // All countries are top-level for now

  const totalValue = values.reduce((sum, val) => sum + val, 0)
  const hoverText = treemapData.map((d, index) => {
    const percentage = totalValue > 0 ? ((Math.abs(d.rawValue) / totalValue) * 100).toFixed(1) : "0.0"
    const countryDisplayName = d.country || getCountryName(d.countryCode)
    // Use the full name with flag for hover text
    const flagWithName = getCountryFlagWithName(d.countryCode)
    return `<b>${flagWithName}</b><br>${indicator.label}: ${d.exactValue.full} ${getUnitWithNormalization(indicator.unit, normalization, leaderboardType)}<br>Share: ${percentage}%<extra></extra>`
  })

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgb = hexToRgb(indicator.color)
  const baseColor = rgb ? `${rgb.r},${rgb.g},${rgb.b}` : "0,0,0"

  // Instead of using colorscale, we'll create individual colors for each rectangle
  const colors = values.map((value, index) => {
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 1

    // Create opacity based on normalized value (0.2 to 1.0 range)
    const opacity = 0.2 + normalizedValue * 0.8

    return `rgba(${baseColor},${opacity})`
  })

  const data = [
    {
      type: "treemap" as const,
      labels: labels,
      values: values,
      parents: parents,
      hovertemplate: hoverText,
      marker: {
        colors: colors, // Use our custom colors array instead of colorscale
        line: {
          width: 0.5,
          color: theme === "dark" ? "#374151" : "#e5e7eb",
        },
        pad: {
          t: 0,
          l: 0,
          r: 0,
          b: 0,
        },
      },
      textinfo: "label",
      textfont: {
        size: 16, // Increased font size since we're showing fewer labels
      },
      pathbar: {
        visible: false,
      },
      tiling: {
        packing: "squarify",
        pad: 1,
      },
    },
  ]

  const layout = {
    margin: { l: 0, r: 0, b: 0, t: 0 }, // No margins - let the card handle spacing
    paper_bgcolor: "rgba(0,0,0,0)", // Fully transparent
    plot_bgcolor: "rgba(0,0,0,0)", // Fully transparent
    font: {
      color: theme === "dark" ? "#e5e7eb" : "#1f2937",
    },
    autosize: true, // Let it auto-size to container
    hoverlabel: {
      bgcolor: theme === "dark" ? "#1f2937" : "#ffffff",
      font: {
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
      },
    },
    // Remove fixed dimensions to prevent overflow
    xaxis: {
      visible: false,
    },
    yaxis: {
      visible: false,
    },
  }

  const config = {
    displayModeBar: false,
    responsive: true,
    scrollZoom: false,
    doubleClick: false,
    showTips: false,
    staticPlot: false,
    dragmode: false,
    editable: false,
    autosizable: true,
  }

  return (
    <Card className="flex flex-col" style={{ backgroundColor: indicator.bgColor }}>
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="hidden sm:flex items-start justify-between">
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
              {indicator.label}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Measured in {getUnitWithNormalization(indicator.unit, normalization, leaderboardType)}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => onViewChange("up")}
              style={{
                backgroundColor: currentView === "up" ? indicator.color : "transparent",
                color: currentView === "up" ? "white" : "inherit",
                borderColor: currentView === "up" ? indicator.color : undefined,
              }}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Up ({increasingCount})
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => onViewChange("down")}
              style={{
                backgroundColor: currentView === "down" ? indicator.color : "transparent",
                color: currentView === "down" ? "white" : "inherit",
                borderColor: currentView === "down" ? indicator.color : undefined,
              }}
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Down ({decreasingCount})
            </Badge>
          </div>
        </div>

        <div className="sm:hidden">
          <div className="flex flex-col">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconComponent className="w-5 h-5" style={{ color: indicator.color }} />
              {indicator.label}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Measured in {getUnitWithNormalization(indicator.unit, normalization, leaderboardType)}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => onViewChange("up")}
              style={{
                backgroundColor: currentView === "up" ? indicator.color : "transparent",
                color: currentView === "up" ? "white" : "inherit",
                borderColor: currentView === "up" ? indicator.color : undefined,
              }}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Up ({increasingCount})
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer text-xs"
              onClick={() => onViewChange("down")}
              style={{
                backgroundColor: currentView === "down" ? indicator.color : "transparent",
                color: currentView === "down" ? "white" : "inherit",
                borderColor: currentView === "down" ? indicator.color : undefined,
              }}
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Down ({decreasingCount})
            </Badge>
          </div>
        </div>
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
