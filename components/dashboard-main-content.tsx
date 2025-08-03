"use client"

import { WorldMap } from "./world-map"
import { GlobalEmissionsChart } from "./global-emissions-chart"
import { CountryTrends } from "./country-trends"

interface DashboardMainContentProps {
  selectedCountry: string | null
  selectedCountryName: string | null
  yearRange: [number, number]
}

export function DashboardMainContent({ selectedCountry, selectedCountryName, yearRange }: DashboardMainContentProps) {
  if (selectedCountry && selectedCountryName) {
    return (
      <div className="mt-12">
        <CountryTrends countryCode={selectedCountry} countryName={selectedCountryName} yearRange={yearRange} />
      </div>
    )
  }

  return (
    <div className="mt-12 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
      <WorldMap yearRange={yearRange} />
      <GlobalEmissionsChart yearRange={yearRange} />
    </div>
  )
}
