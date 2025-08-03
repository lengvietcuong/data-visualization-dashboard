"use client"

import type React from "react"
import { LeaderboardScatterplot } from "./leaderboard-scatterplot"
import { LeaderboardSkeleton } from "./loading-skeleton"
import type { RegionValue } from "../utils/regions"

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

type NormalizationType = "none" | "population" | "area" | "population-density" | "agricultural-land"

interface LeaderboardScatterplotsGridProps {
  indicators: IndicatorOption[]
  leaderboardData: Record<string, LeaderboardEntry[]>
  leaderboardLoading: Record<string, boolean>
  globalRegion: RegionValue
  yearRange: [number, number]
  xAxisType: NormalizationType
  countryData: Record<string, CountryData>
}

export function LeaderboardScatterplotsGrid({
  indicators,
  leaderboardData,
  leaderboardLoading,
  globalRegion,
  yearRange,
  xAxisType,
  countryData,
}: LeaderboardScatterplotsGridProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {indicators.map((indicator) => {
        const isLoading = leaderboardLoading[indicator.value]
        const allData = leaderboardData[indicator.value] || []

        if (isLoading) {
          return <LeaderboardSkeleton key={indicator.value} />
        }

        return (
          <LeaderboardScatterplot
            key={`scatterplot-${indicator.value}`}
            indicator={indicator}
            allData={allData}
            globalRegion={globalRegion}
            yearRange={yearRange}
            xAxisType={xAxisType}
            countryData={countryData}
          />
        )
      })}
    </div>
  )
}
