"use client"

import { Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCountryFlag } from "../utils/country-flags"
import { useCountries } from "../hooks/use-countries"
import { Skeleton } from "@/components/ui/skeleton"

interface CountrySelectorProps {
  selectedCountry: string | null
  onCountryChange: (countryCode: string | null) => void
}

export function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  const { countries, loading } = useCountries()

  if (loading) {
    return <Skeleton className="w-full md:w-40 h-10" />
  }

  return (
    <Select value={selectedCountry || "all"} onValueChange={(value) => onCountryChange(value === "all" ? null : value)}>
      <SelectTrigger className="w-full md:w-40 h-10 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
        <SelectValue>
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <span className="text-base country-flag">{getCountryFlag(selectedCountry)}</span>
              <span className="truncate">
                {countries.find((c) => c.code === selectedCountry)?.name || selectedCountry}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>All Countries</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-0 shadow-lg max-h-60 w-48">
        <SelectItem
          value="all"
          className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>All Countries</span>
          </div>
        </SelectItem>
        {countries.map((country) => (
          <SelectItem
            key={country.code}
            value={country.code}
            className="text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          >
            <div className="flex items-center gap-2">
              <span className="text-base country-flag">{getCountryFlag(country.code)}</span>
              <span className="truncate">{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
