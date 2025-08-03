"use client"

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { REGIONS } from "../utils/regions"
import type { RegionValue } from "../utils/regions"

type NormalizationType = "none" | "population" | "area" | "population-density" | "agricultural-land"
type LeaderboardType = "raw-value" | "total-growth" | "avg-yearly-growth" | "total-growth-rate" | "annual-growth-rate"
type LeaderboardViewTab = "bar-chart" | "treemap" | "scatterplot"

interface DashboardFiltersProps {
  globalRegion: RegionValue
  onRegionChange: (region: RegionValue) => void
  normalization: NormalizationType
  onNormalizationChange: (normalization: NormalizationType) => void
  leaderboardType: LeaderboardType
  onLeaderboardTypeChange: (type: LeaderboardType) => void
  viewType?: LeaderboardViewTab
}

export function DashboardFilters({
  globalRegion,
  onRegionChange,
  normalization,
  onNormalizationChange,
  leaderboardType,
  onLeaderboardTypeChange,
  viewType = "bar-chart",
}: DashboardFiltersProps) {
  const isScatterplot = viewType === "scatterplot"
  
  // Auto-switch normalization based on view type
  React.useEffect(() => {
    if (isScatterplot && normalization === "none") {
      // Switch to population when entering scatterplot view from "none"
      onNormalizationChange("population")
    }
  }, [isScatterplot, normalization, onNormalizationChange])

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">Region:</label>
        <Select value={globalRegion} onValueChange={onRegionChange}>
          <SelectTrigger className="w-40 h-8 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-0 shadow-lg">
            {Object.entries(REGIONS).map(([label, value]) => (
              <SelectItem
                key={value}
                value={value}
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">{isScatterplot ? "X-axis:" : "Normalization:"}</label>
        <Select value={normalization} onValueChange={(value: NormalizationType) => onNormalizationChange(value)}>
          <SelectTrigger className="w-44 h-8 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-0 shadow-lg">
            {!isScatterplot && (
              <SelectItem
                value="none"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                None
              </SelectItem>
            )}
            <SelectItem
              value="population"
              className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            >
              Population
            </SelectItem>
            <SelectItem
              value="area"
              className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            >
              Area
            </SelectItem>
            <SelectItem
              value="population-density"
              className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            >
              Population Density
            </SelectItem>
            <SelectItem
              value="agricultural-land"
              className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            >
              Agricultural Land
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isScatterplot && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Type:</label>
          <Select value={leaderboardType} onValueChange={(value: LeaderboardType) => onLeaderboardTypeChange(value)}>
            <SelectTrigger className="w-40 h-8 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-0 shadow-lg">
              <SelectItem
                value="raw-value"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                Raw Value
              </SelectItem>
              <SelectItem
                value="total-growth"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                Total Growth
              </SelectItem>
              <SelectItem
                value="avg-yearly-growth"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                Annual Growth
              </SelectItem>
              <SelectItem
                value="total-growth-rate"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                Total Growth Rate
              </SelectItem>
              <SelectItem
                value="annual-growth-rate"
                className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              >
                Annual Growth Rate
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
