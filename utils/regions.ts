export const REGIONS = {
  "All Regions": "all",
  "European Union": "eu",
  "Europe (Non-EU)": "europe-non-eu",
  "North America": "north-america",
  "Asia Pacific": "asia-pacific",
  "Latin America": "latin-america",
  Other: "other",
} as const

export type RegionKey = keyof typeof REGIONS
export type RegionValue = (typeof REGIONS)[RegionKey]

const COUNTRY_REGIONS: Record<string, RegionValue> = {
  // European Union - Keep all EU variants separate but in same region
  AUT: "eu", // Austria
  BEL: "eu", // Belgium
  BGR: "eu", // Bulgaria
  HRV: "eu", // Croatia
  CYP: "eu", // Cyprus
  CZE: "eu", // Czechia
  DNK: "eu", // Denmark
  EST: "eu", // Estonia
  FIN: "eu", // Finland
  FRA: "eu", // France
  DEU: "eu", // Germany
  GRC: "eu", // Greece
  HUN: "eu", // Hungary
  IRL: "eu", // Ireland
  ITA: "eu", // Italy
  LVA: "eu", // Latvia
  LTU: "eu", // Lithuania
  LUX: "eu", // Luxembourg
  MLT: "eu", // Malta
  NLD: "eu", // Netherlands
  POL: "eu", // Poland
  PRT: "eu", // Portugal
  ROU: "eu", // Romania
  SVK: "eu", // Slovak Republic
  SVN: "eu", // Slovenia
  ESP: "eu", // Spain
  SWE: "eu", // Sweden

  // EU aggregates - all should be treated as separate entities but in EU region
  EU: "eu", // European Union
  EU27: "eu", // European Union (27 countries)
  EU28: "eu", // European Union (28 countries)
  EU27_2020: "eu", // European Union (27 countries from 01/02/2020)
  BE2: "eu", // Flemish Region
  BE3: "eu", // Wallonia

  // Europe (Non-EU)
  CHE: "europe-non-eu", // Switzerland
  GBR: "europe-non-eu", // United Kingdom
  ISL: "europe-non-eu", // Iceland
  NOR: "europe-non-eu", // Norway
  RUS: "europe-non-eu", // Russia
  UKR: "europe-non-eu", // Ukraine
  TUR: "europe-non-eu", // Türkiye

  // North America
  USA: "north-america", // United States
  CAN: "north-america", // Canada
  MEX: "north-america", // Mexico

  // Asia Pacific
  AUS: "asia-pacific", // Australia
  CHN: "asia-pacific", // China
  IDN: "asia-pacific", // Indonesia
  IND: "asia-pacific", // India
  JPN: "asia-pacific", // Japan
  KAZ: "asia-pacific", // Kazakhstan
  KOR: "asia-pacific", // Korea
  NZL: "asia-pacific", // New Zealand
  PHL: "asia-pacific", // Philippines
  VNM: "asia-pacific", // Viet Nam

  // Latin America
  ARG: "latin-america", // Argentina
  BRA: "latin-america", // Brazil
  CHL: "latin-america", // Chile
  COL: "latin-america", // Colombia
  CRI: "latin-america", // Costa Rica
  PER: "latin-america", // Peru

  // Other
  ISR: "other", // Israel
  ZAF: "other", // South Africa
}

export function getCountryRegion(countryCode: string): RegionValue {
  return COUNTRY_REGIONS[countryCode] || "other"
}

export function filterCountriesByRegion(countries: any[], region: RegionValue): any[] {
  if (region === "all") return countries

  // Filter countries by region, ensuring all EU variants are preserved when region is "eu"
  const filtered = countries.filter((country) => {
    const countryRegion = getCountryRegion(country.countryCode)
    return countryRegion === region
  })

  // Debug logging for EU region to ensure all variants are included
  if (region === "eu") {
    const euEntries = filtered.filter((c) => c.countryCode.startsWith("EU"))
    if (euEntries.length > 0) {
      console.log(
        `Filtered EU entries:`,
        euEntries.map((e) => `${e.countryCode}: ${e.country}`),
      )
    }
  }

  return filtered
}
