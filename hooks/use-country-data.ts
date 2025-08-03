"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { INDICATOR_OPTIONS } from "./use-dashboard-data"

interface CountryDataRow {
  year: number
  [key: string]: number | null
}

interface CountryData {
  emissions: CountryDataRow[]
  agriculture: CountryDataRow[]
  livestock: CountryDataRow[]
  nutrients: CountryDataRow[]
}

export function useCountryData(countryCode: string, yearRange: [number, number]) {
  const [data, setData] = useState<CountryData>({
    emissions: [],
    agriculture: [],
    livestock: [],
    nutrients: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!countryCode) return

    const fetchCountryData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch OECD data
        const { data: oecdData, error: oecdError } = await supabase
          .from("oecd")
          .select("measure, unit_of_measure, time_period, obs_value, nutrients")
          .eq("ref_area", countryCode)
          .gte("time_period", yearRange[0])
          .lte("time_period", yearRange[1])
          .not("obs_value", "is", null)

        if (oecdError) throw oecdError

        // Fetch agricultural land data
        const { data: landData, error: landError } = await supabase
          .from("oecd_agricultural_land_area")
          .select("time_period, obs_value")
          .eq("ref_area", countryCode)
          .gte("time_period", yearRange[0])
          .lte("time_period", yearRange[1])
          .not("obs_value", "is", null)

        if (landError) throw landError

        // Process data by category
        const processedData: CountryData = {
          emissions: [],
          agriculture: [],
          livestock: [],
          nutrients: [],
        }

        // Create year-based data structure
        const yearData: { [year: number]: CountryDataRow } = {}

        // Initialize years
        for (let year = yearRange[0]; year <= yearRange[1]; year++) {
          yearData[year] = { year }
          INDICATOR_OPTIONS.forEach((indicator) => {
            yearData[year][indicator.value] = null
          })
        }

        // Process OECD data
        oecdData?.forEach((row) => {
          const year = row.time_period
          if (!yearData[year]) return

          let value = Number.parseFloat(row.obs_value) || 0

          // Convert kg to tonnes if needed
          if (row.unit_of_measure?.includes("Kilogramme")) {
            value = value / 1000
          }

          // Map to indicators based on measure and nutrients
          INDICATOR_OPTIONS.forEach((indicator) => {
            let matches = false

            if (indicator.measure === "Balance (inputs minus outputs)") {
              const nutrient = indicator.label.includes("Nitrogen") ? "Nitrogen" : "Phosphorus"
              matches = row.measure === indicator.measure && row.nutrients === nutrient
            } else {
              matches = row.measure?.includes(indicator.measure) || false
            }

            if (matches) {
              yearData[year][indicator.value] = value
            }
          })
        })

        // Process agricultural land data
        landData?.forEach((row) => {
          const year = row.time_period
          if (yearData[year]) {
            yearData[year]["agricultural_land_area"] = Number.parseFloat(row.obs_value) || 0
          }
        })

        // Group by category
        Object.values(yearData).forEach((yearRow) => {
          INDICATOR_OPTIONS.forEach((indicator) => {
            const categoryData = processedData[indicator.category as keyof CountryData]
            let existingYear = categoryData.find((item) => item.year === yearRow.year)

            if (!existingYear) {
              existingYear = { year: yearRow.year }
              categoryData.push(existingYear)
            }

            existingYear[indicator.value] = yearRow[indicator.value]
          })
        })

        // Sort all categories by year
        Object.keys(processedData).forEach((category) => {
          processedData[category as keyof CountryData].sort((a, b) => a.year - b.year)
        })

        setData(processedData)
      } catch (err) {
        console.error("Error fetching country data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCountryData()
  }, [countryCode, yearRange])

  return { data, loading, error }
}
