"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

interface Country {
  code: string
  name: string
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("countries")
          .select("ref_area, reference_area")
          .not("reference_area", "is", null)
          .order("reference_area", { ascending: true })

        if (error) throw error

        const countryList: Country[] = (data || []).map((row) => ({
          code: row.ref_area,
          name: row.reference_area,
        }))

        setCountries(countryList)
      } catch (err) {
        console.error("Error fetching countries:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  return { countries, loading, error }
}
