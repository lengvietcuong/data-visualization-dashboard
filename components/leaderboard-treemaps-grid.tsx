"use client"

import type React from "react"
import { LeaderboardTreemap } from "./leaderboard-treemap"
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

type NormalizationType = "none" | "population" | "area" | "population-density" | "agricultural-land"
type LeaderboardType = "raw-value" | "total-growth" | "avg-yearly-growth" | "total-growth-rate" | "annual-growth-rate"

interface LeaderboardTreemapsGridProps {
  indicators: IndicatorOption[]
  leaderboardData: Record<string, LeaderboardEntry[]>
  leaderboardLoading: Record<string, boolean>
  selectedView: Record<string, "up" | "down">
  onViewChange: (indicatorValue: string, view: "up" | "down") => void
  globalRegion: RegionValue
  yearRange: [number, number]
  normalization: NormalizationType
  leaderboardType: LeaderboardType
  getUnitWithNormalization: (baseUnit: string, normalization: NormalizationType, type: LeaderboardType) => string
}

export function LeaderboardTreemapsGrid({
  indicators,
  leaderboardData,
  leaderboardLoading,
  selectedView,
  onViewChange,
  globalRegion,
  yearRange,
  normalization,
  leaderboardType,
  getUnitWithNormalization,
}: LeaderboardTreemapsGridProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {indicators.map((indicator) => {
        const isLoading = leaderboardLoading[indicator.value]
        const allData = leaderboardData[indicator.value] || []
        const currentView = selectedView[indicator.value] || "up"

        if (isLoading) {
          return <LeaderboardSkeleton key={indicator.value} />
        }

        return (
          <LeaderboardTreemap
            key={`treemap-${indicator.value}`}
            indicator={indicator}
            allData={allData}
            currentView={currentView}
            globalRegion={globalRegion}
            onViewChange={(view) => onViewChange(indicator.value, view)}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
          />
        )
      })}
    </div>
  )
}
