"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"

interface EmissionData {
  year: number
  co2: number | null
  ghg: number | null
  ch4: number | null // Methane
  n2o: number | null // Nitrous oxide
  nh3: number | null // Ammonia
}

const MEASURES_TO_FETCH = [
  "Carbon dioxide (CO2)",
  "Total greenhouse gas emissions from agriculture",
  "Methane (CH4)",
  "Nitrous oxide (N2O)",
  "Ammonia (NH3)",
]

export function useGlobalEmissionsData(yearRange: [number, number]) {
  const [emissionsData, setEmissionsData] = useState<EmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("oecd")
        .select("measure, time_period, obs_value, unit_of_measure")
        .in("measure", MEASURES_TO_FETCH)
        .gte("time_period", yearRange[0])
        .lte("time_period", yearRange[1])
        .not("obs_value", "is", null)
        .order("time_period", { ascending: true })

      if (error) throw error

      // Use a Map to aggregate values by year and measure
      const annualEmissionsMap = new Map<number, { [key: string]: number }>()

      data?.forEach((row) => {
        const year = row.time_period
        const measure = row.measure
        const obsValue = Number.parseFloat(row.obs_value) || 0

        let value = obsValue

        // Convert kilogrammes to tonnes for consistency if applicable
        if (row.unit_of_measure?.includes("Kilogramme")) {
          value = value / 1000 // Convert kg to tonnes
        }

        if (!annualEmissionsMap.has(year)) {
          annualEmissionsMap.set(year, {})
        }
        const yearData = annualEmissionsMap.get(year)!

        // Map measure names to shorter keys for the chart data
        if (measure === "Carbon dioxide (CO2)") {
          yearData.co2 = (yearData.co2 || 0) + value
        } else if (measure === "Total greenhouse gas emissions from agriculture") {
          yearData.ghg = (yearData.ghg || 0) + value
        } else if (measure === "Methane (CH4)") {
          yearData.ch4 = (yearData.ch4 || 0) + value
        } else if (measure === "Nitrous oxide (N2O)") {
          yearData.n2o = (yearData.n2o || 0) + value
        } else if (measure === "Ammonia (NH3)") {
          yearData.nh3 = (yearData.nh3 || 0) + value
        }
      })

      // Create the final sorted array, ensuring all years in range are present
      // and missing values are null
      const sortedEmissions: EmissionData[] = []
      for (let year = yearRange[0]; year <= yearRange[1]; year++) {
        const yearData = annualEmissionsMap.get(year) || {}
        sortedEmissions.push({
          year,
          co2: yearData.co2 !== undefined ? yearData.co2 : null,
          ghg: yearData.ghg !== undefined ? yearData.ghg : null,
          ch4: yearData.ch4 !== undefined ? yearData.ch4 : null,
          n2o: yearData.n2o !== undefined ? yearData.n2o : null,
          nh3: yearData.nh3 !== undefined ? yearData.nh3 : null,
        })
      }

      setEmissionsData(sortedEmissions)
    } catch (err) {
      console.error("Error fetching global emissions data:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setEmissionsData([])
    } finally {
      setLoading(false)
    }
  }, [yearRange])

  useEffect(() => {
    fetchEmissions()
  }, [fetchEmissions])

  return { emissionsData, loading, error }
}
