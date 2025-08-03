// Country code to ISO 3166-1 alpha-2 mapping for flag icons
export const COUNTRY_CODE_TO_ISO2: Record<string, string> = {
  // European Union variants
  EU: "EU",
  EU27: "EU",
  EU28: "EU", 
  EU27_2020: "EU",
  BE2: "BE", // Flemish Region
  BE3: "BE", // Wallonia
  // Standard country codes (ISO 3166-1 alpha-3 to alpha-2)
  AUT: "AT",
  BEL: "BE",
  BGR: "BG",
  HRV: "HR",
  CYP: "CY",
  CZE: "CZ",
  DNK: "DK",
  EST: "EE",
  FIN: "FI",
  FRA: "FR",
  DEU: "DE",
  GRC: "GR",
  HUN: "HU",
  IRL: "IE",
  ITA: "IT",
  LVA: "LV",
  LTU: "LT",
  LUX: "LU",
  MLT: "MT",
  NLD: "NL",
  POL: "PL",
  PRT: "PT",
  ROU: "RO",
  SVK: "SK",
  SVN: "SI",
  ESP: "ES",
  SWE: "SE",
  CHE: "CH",
  GBR: "GB",
  ISL: "IS",
  NOR: "NO",
  RUS: "RU",
  UKR: "UA",
  TUR: "TR",
  USA: "US",
  CAN: "CA",
  MEX: "MX",
  AUS: "AU",
  CHN: "CN",
  IDN: "ID",
  IND: "IN",
  JPN: "JP",
  KAZ: "KZ",
  KOR: "KR",
  NZL: "NZ",
  PHL: "PH",
  VNM: "VN",
  ARG: "AR",
  BRA: "BR",
  CHL: "CL",
  COL: "CO",
  CRI: "CR",
  PER: "PE",
  ISR: "IL",
  ZAF: "ZA",
}

// Fallback flag emojis for Unicode support (as backup)
const FLAG_EMOJI_FALLBACK: Record<string, string> = {
  EU: "🇪🇺",
  EU27: "🇪🇺",
  EU28: "🇪🇺",
  EU27_2020: "🇪🇺",
  BE2: "🇧🇪",
  BE3: "🇧🇪",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BGR: "🇧🇬",
  HRV: "🇭🇷",
  CYP: "🇨🇾",
  CZE: "🇨🇿",
  DNK: "🇩🇰",
  EST: "🇪🇪",
  FIN: "🇫🇮",
  FRA: "🇫🇷",
  DEU: "🇩🇪",
  GRC: "🇬🇷",
  HUN: "🇭🇺",
  IRL: "🇮🇪",
  ITA: "🇮🇹",
  LVA: "🇱🇻",
  LTU: "🇱🇹",
  LUX: "🇱🇺",
  MLT: "🇲🇹",
  NLD: "🇳🇱",
  POL: "🇵🇱",
  PRT: "🇵🇹",
  ROU: "🇷🇴",
  SVK: "🇸🇰",
  SVN: "🇸🇮",
  ESP: "🇪🇸",
  SWE: "🇸🇪",
  CHE: "🇨🇭",
  GBR: "🇬🇧",
  ISL: "🇮🇸",
  NOR: "🇳🇴",
  RUS: "🇷🇺",
  UKR: "🇺🇦",
  TUR: "🇹🇷",
  USA: "🇺🇸",
  CAN: "🇨🇦",
  MEX: "🇲🇽",
  AUS: "🇦🇺",
  CHN: "🇨🇳",
  IDN: "🇮🇩",
  IND: "🇮🇳",
  JPN: "🇯🇵",
  KAZ: "🇰🇿",
  KOR: "🇰🇷",
  NZL: "🇳🇿",
  PHL: "🇵🇭",
  VNM: "🇻🇳",
  ARG: "🇦🇷",
  BRA: "🇧🇷",
  CHL: "🇨🇱",
  COL: "🇨🇴",
  CRI: "🇨🇷",
  PER: "🇵🇪",
  ISR: "🇮🇱",
  ZAF: "🇿🇦",
}

// Updated flag functions with proper cross-platform emoji support
export function getCountryFlag(countryCode: string): string {
  // Always use emoji flags with proper font CSS classes
  const flagEmoji = FLAG_EMOJI_FALLBACK[countryCode]
  if (flagEmoji) {
    return flagEmoji
  }

  // For any unmapped codes, return just a generic flag
  return "🏳️"
}

export function getCountryFlagWithName(countryCode: string): string {
  const countryName = getCountryName(countryCode)
  
  // Always use emoji flags with names
  const flagEmoji = FLAG_EMOJI_FALLBACK[countryCode]
  if (flagEmoji) {
    return `${flagEmoji} ${countryName}`
  }

  // For any unmapped codes, return the code itself with a generic flag
  return `🏳️ ${countryName || countryCode}`
}

// Helper function to get flag display for React components with proper CSS classes
export function getFlagDisplay(countryCode: string, options: {
  showText?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
} = {}) {
  const { showText = false, size = "md", className = "" } = options
  const countryName = getCountryName(countryCode)
  const emoji = FLAG_EMOJI_FALLBACK[countryCode] || "🏳️"
  
  // Always return emoji flag with proper CSS classes for font fallback
  return {
    element: "emoji",
    content: emoji,
    title: countryName,
    className: `country-flag inline-block ${className}`,
    isText: false
  }
}

export function getCountryName(countryCode: string): string {
  const NAME_OVERRIDES: Record<string, string> = {
    EU: "European Union",
    EU27: "European Union (27 countries)",
    EU28: "European Union (28 countries)",
    EU27_2020: "European Union (27 countries from 2020)",
    BE2: "Flemish Region",
    BE3: "Wallonia",
    AUT: "Austria",
    BEL: "Belgium",
    BGR: "Bulgaria",
    HRV: "Croatia",
    CYP: "Cyprus",
    CZE: "Czechia",
    DNK: "Denmark",
    EST: "Estonia",
    FIN: "Finland",
    FRA: "France",
    DEU: "Germany",
    GRC: "Greece",
    HUN: "Hungary",
    IRL: "Ireland",
    ITA: "Italy",
    LVA: "Latvia",
    LTU: "Lithuania",
    LUX: "Luxembourg",
    MLT: "Malta",
    NLD: "Netherlands",
    POL: "Poland",
    PRT: "Portugal",
    ROU: "Romania",
    SVK: "Slovak Republic",
    SVN: "Slovenia",
    ESP: "Spain",
    SWE: "Sweden",
    CHE: "Switzerland",
    GBR: "United Kingdom",
    ISL: "Iceland",
    NOR: "Norway",
    RUS: "Russia",
    UKR: "Ukraine",
    TUR: "Türkiye",
    USA: "United States",
    CAN: "Canada",
    MEX: "Mexico",
    AUS: "Australia",
    CHN: "China",
    IDN: "Indonesia",
    IND: "India",
    JPN: "Japan",
    KAZ: "Kazakhstan",
    KOR: "Korea",
    NZL: "New Zealand",
    PHL: "Philippines",
    VNM: "Viet Nam",
    ARG: "Argentina",
    BRA: "Brazil",
    CHL: "Chile",
    COL: "Colombia",
    CRI: "Costa Rica",
    PER: "Peru",
    ISR: "Israel",
    ZAF: "South Africa",
  }

  return NAME_OVERRIDES[countryCode] || countryCode
}

export function getCountryCodeFromName(countryName: string): string {
  // Map some common country names to codes for flag lookup
  const nameToCode: Record<string, string> = {
    Belgium: "BEL",
    "South Africa": "ZAF",
    Russia: "RUS",
    Malta: "MLT",
    Spain: "ESP",
    Ukraine: "UKR",
    Greece: "GRC",
    Luxembourg: "LUX",
    Czechia: "CZE",
    Germany: "DEU",
    Portugal: "PRT",
    Korea: "KOR",
    India: "IND",
    "European Union": "EU",
    "Viet Nam": "VNM",
    Norway: "NOR",
    Bulgaria: "BGR",
    Iceland: "ISL",
    "European Union (27 countries)": "EU27",
    Philippines: "PHL",
    "New Zealand": "NZL",
    Austria: "AUT",
    France: "FRA",
    Chile: "CHL",
    Poland: "POL",
    Mexico: "MEX",
    Denmark: "DNK",
    Israel: "ISR",
    "Costa Rica": "CRI",
    "China (People's Republic of)": "CHN",
    Kazakhstan: "KAZ",
    "European Union (28 countries)": "EU28",
    Latvia: "LVA",
    Lithuania: "LTU",
    Türkiye: "TUR",
    Netherlands: "NLD",
    Canada: "CAN",
    Colombia: "COL",
    Croatia: "HRV",
    Sweden: "SWE",
    Japan: "JPN",
    Argentina: "ARG",
    "European Union (27 countries from 01/02/2020)": "EU27_2020",
    Finland: "FIN",
    Ireland: "IRL",
    Indonesia: "IDN",
    "United Kingdom": "GBR",
    Switzerland: "CHE",
    Brazil: "BRA",
    Cyprus: "CYP",
    Italy: "ITA",
    Romania: "ROU",
    "United States": "USA",
    "Slovak Republic": "SVK",
    Australia: "AUS",
    Peru: "PER",
    Hungary: "HUN",
    Estonia: "EST",
    Slovenia: "SVN",
  }

  return nameToCode[countryName] || ""
}
