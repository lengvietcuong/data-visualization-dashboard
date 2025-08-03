"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { formatCompactNumber } from "../utils/number-format"
import {
  Droplets,
  Zap,
  Trees,
  Mountain,
  Wheat,
  Truck,
  Cloud,
  CloudRain,
  CloudFog,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react"
import type React from "react"
import { GiPig, GiCow, GiSheep, GiChicken, GiSeaCreature } from "react-icons/gi"

interface DashboardStats {
  totalCountries: number
  totalRecords: number
  totalIndicators: number
  minYear: number
  maxYear: number
}

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
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  bgColor: string
  category: "emissions" | "agriculture" | "livestock" | "nutrients"
  nutrient?: string // Optional for nutrient-specific measures
}

export const INDICATOR_OPTIONS: IndicatorOption[] = [
  // Emissions Tab Indicators - Updated to match exact enum values
  {
    value: "co2-emissions",
    label: "Carbon Dioxide (CO₂)",
    measure: "Carbon dioxide (CO2)",
    unit: "Tonnes of CO₂-equivalent",
    icon: Cloud,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.025)",
    category: "emissions",
  },
  {
    value: "ghg-emissions",
    label: "Agriculture Greenhouse Gas",
    measure: "Total greenhouse gas emissions from agriculture",
    unit: "Tonnes of CO₂-equivalent",
    icon: CloudRain,
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.025)",
    category: "emissions",
  },
  {
    value: "methane-emissions",
    label: "Methane (CH₄)",
    measure: "Methane (CH4)",
    unit: "Tonnes of CO₂-equivalent",
    icon: CloudFog,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.025)",
    category: "emissions",
  },
  {
    value: "nitrous-oxide-emissions",
    label: "Nitrous Oxide (N₂O)",
    measure: "Nitrous oxide (N2O)",
    unit: "Tonnes of CO₂-equivalent",
    icon: CloudLightning,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.025)",
    category: "emissions",
  },
  {
    value: "ammonia-emissions",
    label: "Ammonia (NH₃)",
    measure: "Ammonia (NH3)",
    unit: "Tonnes",
    icon: CloudDrizzle,
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.025)",
    category: "emissions",
  },
  // Agriculture Tab Indicators - Updated to match exact enum values
  {
    value: "forest-land",
    label: "Forest Land",
    measure: "Forest land",
    unit: "Tonnes of CO₂-equivalent",
    icon: Trees,
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.025)",
    category: "agriculture",
  },
  {
    value: "grassland",
    label: "Grassland",
    measure: "Grassland",
    unit: "Tonnes of CO₂-equivalent",
    icon: Mountain,
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.025)",
    category: "agriculture",
  },
  {
    value: "cropland",
    label: "Cropland",
    measure: "Cropland",
    unit: "Tonnes of CO₂-equivalent",
    icon: Wheat,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.025)",
    category: "agriculture",
  },
  {
    value: "wetlands",
    label: "Wetlands",
    measure: "Wetlands",
    unit: "Tonnes of CO₂-equivalent",
    icon: Droplets,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.025)",
    category: "agriculture",
  },
  {
    value: "nitrogen-balance",
    label: "Nitrogen Balance",
    measure: "Balance (inputs minus outputs)",
    nutrient: "Nitrogen",
    unit: "Tonnes",
    icon: Zap,
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.025)",
    category: "nutrients",
  },
  {
    value: "phosphorus-balance",
    label: "Phosphorus Balance",
    measure: "Balance (inputs minus outputs)",
    nutrient: "Phosphorus",
    unit: "Tonnes",
    icon: Truck,
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.025)",
    category: "nutrients",
  },
  // Livestock Tab Indicators - Updated to match exact enum values
  {
    value: "cattle",
    label: "Cattle",
    measure: "Cattle",
    unit: "Tonnes",
    icon: GiCow,
    color: "#8b4513",
    bgColor: "rgba(139, 69, 19, 0.025)",
    category: "livestock",
  },
  {
    value: "pigs",
    label: "Pigs",
    measure: "Pigs",
    unit: "Tonnes",
    icon: GiPig,
    color: "#ff69b4",
    bgColor: "rgba(255, 105, 180, 0.025)",
    category: "livestock",
  },
  {
    value: "sheep-goats",
    label: "Sheep and goats",
    measure: "Sheep and goats",
    unit: "Tonnes",
    icon: GiSheep,
    color: "#4a5568",
    bgColor: "rgba(74, 85, 104, 0.025)",
    category: "livestock",
  },
  {
    value: "poultry",
    label: "Poultry",
    measure: "Poultry",
    unit: "Tonnes",
    icon: GiChicken,
    color: "#ffd700",
    bgColor: "rgba(255, 215, 0, 0.025)",
    category: "livestock",
  },
  {
    value: "other-livestock",
    label: "Other livestock",
    measure: "Other livestock",
    unit: "Tonnes",
    icon: GiSeaCreature,
    color: "#7c3aed",
    bgColor: "rgba(124, 58, 237, 0.025)",
    category: "livestock",
  },
]

interface CountryData {
  ref_area: string
  population: number | null
  area_km2: number | null
  agricultural_land_area: number | null
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<Record<string, LeaderboardEntry[]>>({})
  const [loading, setLoading] = useState(true)
  const [leaderboardLoading, setLeaderboardLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [countryData, setCountryData] = useState<Record<string, CountryData>>({})

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        { count: totalRecords, error: countError },
        { data: countriesData, error: countriesError },
        { data: indicatorsData, error: indicatorsError },
        { data: yearData, error: yearError },
      ] = await Promise.all([
        supabase.from("oecd").select("*", { count: "exact", head: true }),
        supabase.from("oecd").select("ref_area").not("ref_area", "is", null),
        supabase.from("oecd").select("measure").not("measure", "is", null),
        supabase.from("oecd").select("time_period").not("time_period", "is", null),
      ])

      if (countError) throw countError
      if (countriesError) throw countriesError
      if (indicatorsError) throw indicatorsError
      if (yearError) throw yearError

      const uniqueCountries = new Set(countriesData?.map((row) => row.ref_area))
      const totalCountries = uniqueCountries.size

      const uniqueIndicators = new Set(indicatorsData?.map((row) => row.measure))
      const totalIndicators = uniqueIndicators.size

      const years = yearData?.map((row) => row.time_period).filter((year) => year !== null) || []
      const minYear = Math.min(...years)
      const maxYear = Math.max(...years)

      setStats({
        totalCountries,
        totalRecords: totalRecords || 0,
        totalIndicators,
        minYear,
        maxYear,
      })
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchFilteredStats = async (yearRange: [number, number]) => {
    try {
      const [
        { count: totalRecords, error: countError },
        { data: countriesData, error: countriesError },
        { data: indicatorsData, error: indicatorsError },
      ] = await Promise.all([
        supabase
          .from("oecd")
          .select("*", { count: "exact", head: true })
          .gte("time_period", yearRange[0])
          .lte("time_period", yearRange[1]),
        supabase
          .from("oecd")
          .select("ref_area")
          .not("ref_area", "is", null)
          .gte("time_period", yearRange[0])
          .lte("time_period", yearRange[1]),
        supabase
          .from("oecd")
          .select("measure")
          .not("measure", "is", null)
          .gte("time_period", yearRange[0])
          .lte("time_period", yearRange[1]),
      ])

      if (countError) throw countError
      if (countriesError) throw countriesError
      if (indicatorsError) throw indicatorsError

      const uniqueCountries = new Set(countriesData?.map((row) => row.ref_area))
      const totalCountries = uniqueCountries.size

      const uniqueIndicators = new Set(indicatorsData?.map((row) => row.measure))
      const totalIndicators = uniqueIndicators.size

      return {
        totalCountries,
        totalRecords: totalRecords || 0,
        totalIndicators,
      }
    } catch (err) {
      console.error("Error fetching filtered stats:", err)
      throw err
    }
  }

  const fetchCountryData = async () => {
    try {
      const [{ data: countriesData, error: countriesError }, { data: landAreaData, error: landAreaError }] =
        await Promise.all([
          supabase.from("countries").select("ref_area, population, area_km2"),
          supabase.from("oecd_agricultural_land_area").select("ref_area, obs_value"),
        ])

      if (countriesError) throw countriesError
      if (landAreaError) throw landAreaError

      const countryMap: Record<string, CountryData> = {}

      // Process countries data
      countriesData?.forEach((country) => {
        countryMap[country.ref_area] = {
          ...country,
          agricultural_land_area: null,
        }
      })

      // Process agricultural land area data
      landAreaData?.forEach((land) => {
        if (countryMap[land.ref_area]) {
          const obsValue = Number.parseFloat(land.obs_value) || 0
          // obs_value already includes unit multiplication
          countryMap[land.ref_area].agricultural_land_area = obsValue
        }
      })

      setCountryData(countryMap)
    } catch (err) {
      console.error("Error fetching country data:", err)
    }
  }

  const fetchLeaderboardData = async (
    indicatorValue: string,
    yearRange: [number, number],
    normalization: "none" | "population" | "area" | "population-density" | "agricultural-land" = "none",
    leaderboardType:
      | "raw-value"
      | "total-growth"
      | "avg-yearly-growth"
      | "total-growth-rate"
      | "annual-growth-rate" = "raw-value",
  ) => {
    try {
      setLeaderboardLoading((prev) => ({ ...prev, [indicatorValue]: true }))

      const selectedOption = INDICATOR_OPTIONS.find((opt) => opt.value === indicatorValue)
      if (!selectedOption) return

      let query = supabase
        .from("oecd")
        .select(`
          ref_area,
          measure,
          unit_of_measure,
          time_period,
          obs_value,
          nutrients,
          countries!inner(reference_area)
        `)
        .gte("time_period", yearRange[0])
        .lte("time_period", yearRange[1])
        .not("obs_value", "is", null)
        .not("ref_area", "is", null)

      // Use exact match for enum values
      query = query.eq("measure", selectedOption.measure)

      if (selectedOption.nutrient) {
        query = query.eq("nutrients", selectedOption.nutrient)
      }

      const { data, error } = await query

      if (error) throw error

      const rawData = data || []

      if (rawData.length === 0) {
        setLeaderboardData((prev) => ({ ...prev, [indicatorValue]: [] }))
        return
      }

      // Group data by country and year
      const countryYearValues = new Map<string, Map<number, number>>() // Map<ref_area, Map<Year, Value>>

      rawData.forEach((row) => {
        const refArea = row.ref_area
        const year = row.time_period
        const obsValue = Number.parseFloat(row.obs_value) || 0

        let value = obsValue
        if (row.unit_of_measure?.includes("Kilogramme")) {
          value = value / 1000 // Convert kg to tonnes
        }

        if (!countryYearValues.has(refArea)) {
          countryYearValues.set(refArea, new Map())
        }
        const yearMap = countryYearValues.get(refArea)!
        yearMap.set(year, (yearMap.get(year) || 0) + value)
      })

      const processedData: {
        country: string
        refArea: string
        calculatedValue: number
        rawValueForSorting: number
      }[] = []

      // Iterate through each country that has data
      for (const [refArea, yearMap] of countryYearValues.entries()) {
        const countryName = rawData.find((d) => d.ref_area === refArea)?.countries?.reference_area || refArea

        let valueToNormalize = 0
        let rawValueForSorting = 0

        if (leaderboardType === "raw-value") {
          // Sum all values for the country within the year range
          for (let year = yearRange[0]; year <= yearRange[1]; year++) {
            valueToNormalize += yearMap.get(year) || 0
          }
          rawValueForSorting = valueToNormalize
        } else {
          // For growth calculations, find the earliest and latest available data points within the range
          const availableYears = Array.from(yearMap.keys())
            .filter((year) => year >= yearRange[0] && year <= yearRange[1])
            .sort((a, b) => a - b)

          let startValue = 0
          let endValue = 0
          let actualStartYear = yearRange[0]
          let actualEndYear = yearRange[1]

          if (availableYears.length > 0) {
            actualStartYear = availableYears[0]
            actualEndYear = availableYears[availableYears.length - 1]
            startValue = yearMap.get(actualStartYear) || 0
            endValue = yearMap.get(actualEndYear) || 0
          }

          if (leaderboardType === "total-growth") {
            valueToNormalize = endValue - startValue
            rawValueForSorting = valueToNormalize
          } else if (leaderboardType === "avg-yearly-growth") {
            const numYears = actualEndYear - actualStartYear
            if (numYears > 0) {
              valueToNormalize = (endValue - startValue) / numYears
            } else {
              valueToNormalize = 0
            }
            rawValueForSorting = valueToNormalize
          } else if (leaderboardType === "total-growth-rate") {
            if (startValue !== 0) {
              valueToNormalize = ((endValue - startValue) / startValue) * 100
            } else {
              valueToNormalize = 0
            }
            rawValueForSorting = valueToNormalize
          } else if (leaderboardType === "annual-growth-rate") {
            const numYears = actualEndYear - actualStartYear
            if (startValue > 0 && numYears > 0) {
              valueToNormalize = (Math.pow(endValue / startValue, 1 / numYears) - 1) * 100
            } else {
              valueToNormalize = 0
            }
            rawValueForSorting = valueToNormalize
          }
        }

        // Apply normalization
        const countryInfo = countryData[refArea]
        let finalNormalizedValue = valueToNormalize

        if (normalization !== "none" && countryInfo) {
          switch (normalization) {
            case "population":
              if (countryInfo.population && countryInfo.population > 0) {
                finalNormalizedValue = (valueToNormalize / countryInfo.population) * 1000000
              } else {
                finalNormalizedValue = 0
              }
              break
            case "area":
              if (countryInfo.area_km2 && countryInfo.area_km2 > 0) {
                finalNormalizedValue = (valueToNormalize / countryInfo.area_km2) * 1000
              } else {
                finalNormalizedValue = 0
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
                  finalNormalizedValue = (valueToNormalize / density) * 100
                } else {
                  finalNormalizedValue = 0
                }
              } else {
                finalNormalizedValue = 0
              }
              break
            case "agricultural-land":
              if (countryInfo.agricultural_land_area && countryInfo.agricultural_land_area > 0) {
                finalNormalizedValue = (valueToNormalize / countryInfo.agricultural_land_area) * 1000
              } else {
                finalNormalizedValue = 0
              }
              break
          }
        }

        processedData.push({
          country: countryName,
          refArea: refArea,
          calculatedValue: finalNormalizedValue,
          rawValueForSorting: rawValueForSorting,
        })
      }

      const sortedData = processedData.sort((a, b) => b.calculatedValue - a.calculatedValue)

      const leaderboard: LeaderboardEntry[] = sortedData.map((item, index) => {
        let compactValue: string
        let fullValue: string

        if (leaderboardType === "total-growth-rate" || leaderboardType === "annual-growth-rate") {
          compactValue = `${item.calculatedValue.toFixed(2)}%`
          fullValue = `${item.calculatedValue.toFixed(2)}%`
        } else {
          const formatted = formatCompactNumber(item.calculatedValue)
          compactValue = formatted.compact
          fullValue = formatted.full
        }

        return {
          rank: index + 1,
          country: item.country,
          countryCode: item.refArea,
          value: 0, // This will be set in LeaderboardCard for progress bar
          exactValue: { compact: compactValue, full: fullValue },
          rawValue: item.calculatedValue,
        }
      })

      setLeaderboardData((prev) => ({ ...prev, [indicatorValue]: leaderboard }))
    } catch (err) {
      console.error(`Error fetching leaderboard data for ${indicatorValue}:`, err)
      setLeaderboardData((prev) => ({ ...prev, [indicatorValue]: [] }))
    } finally {
      setLeaderboardLoading((prev) => ({ ...prev, [indicatorValue]: false }))
    }
  }

  return {
    stats,
    leaderboardData,
    loading,
    leaderboardLoading,
    error,
    fetchDashboardStats,
    fetchLeaderboardData,
    fetchCountryData,
    fetchFilteredStats,
    INDICATOR_OPTIONS,
    countryData
  }
}
