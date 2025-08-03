"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Earth,
  Cloud,
  CloudRain,
  CloudFog,
  CloudLightning,
  CloudDrizzle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "../lib/supabase";
import { formatCompactNumber } from "../utils/number-format";
import { INDICATOR_OPTIONS } from "../hooks/use-dashboard-data";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface WorldMapProps {
  yearRange: [number, number];
}

interface CountryData {
  countryCode: string;
  countryName: string;
  totalValue: number;
}

function hexToRgba(hex: string, alpha: number): string {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 7) {
    r = Number.parseInt(hex.substring(1, 3), 16);
    g = Number.parseInt(hex.substring(3, 5), 16);
    b = Number.parseInt(hex.substring(5, 7), 16);
  } else if (hex.length === 4) {
    r = Number.parseInt(hex[1] + hex[1], 16);
    g = Number.parseInt(hex[2] + hex[2], 16);
    b = Number.parseInt(hex[3] + hex[3], 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const emissionTabConfig = {
  "co2-emissions": {
    label: "Carbon Dioxide (CO₂)",
    icon: Cloud,
    color: "#2563eb", // Blue
  },
  "ghg-emissions": {
    label: "Agriculture Greenhouse Gas",
    icon: CloudRain,
    color: "#059669", // Green
  },
  "methane-emissions": {
    label: "Methane (CH₄)",
    icon: CloudFog,
    color: "#d97706", // Orange-yellow
  },
  "nitrous-oxide-emissions": {
    label: "Nitrous Oxide (N₂O)",
    icon: CloudLightning,
    color: "#7c3aed", // Purple
  },
  "ammonia-emissions": {
    label: "Ammonia (NH₃)",
    icon: CloudDrizzle,
    color: "#db2777", // Pink/Red
  },
} as const;

export function WorldMap({ yearRange }: WorldMapProps) {
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmissionType, setSelectedEmissionType] =
    useState("co2-emissions");
  // New state to track if initial data has been fetched successfully
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  const { theme } = useTheme();

  const emissionIndicatorsForMap = INDICATOR_OPTIONS.filter(
    (i) => i.category === "emissions"
  );

  const fetchMapData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const currentIndicator = emissionIndicatorsForMap.find(
        (i) => i.value === selectedEmissionType
      );
      if (!currentIndicator) {
        setError("Selected emission type not found.");
        setCountriesData([]);
        return;
      }

      let query = supabase
        .from("oecd")
        .select(
          `
          ref_area,
          measure,
          unit_of_measure,
          time_period,
          obs_value,
          nutrients,
          countries!inner(reference_area)
        `
        )
        .gte("time_period", yearRange[0])
        .lte("time_period", yearRange[1])
        .not("ref_area", "is", null)
        .not("obs_value", "is", null);

      // Apply measure filter using exact match for enum
      query = query.eq("measure", currentIndicator.measure);

      // Apply nutrient filter if specified
      if (currentIndicator.nutrient) {
        query = query.eq("nutrients", currentIndicator.nutrient);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter for relevant units (Tonnes, CO₂, CO2, Kilogramme)
      const filteredData =
        data?.filter((row) => {
          const unit = row.unit_of_measure;
          return (
            unit?.includes("Tonnes") ||
            unit?.includes("CO₂") ||
            unit?.includes("CO2") ||
            unit?.includes("Kilogramme")
          );
        }) || [];

      // Aggregate data by country
      const countryTotals = new Map<string, { total: number; name: string }>();

      filteredData.forEach((row) => {
        const countryCode = row.ref_area;
        const countryName = row.countries.reference_area;
        const obsValue = Number.parseFloat(row.obs_value) || 0;

        let value = obsValue;

        // Convert kilogrammes to tonnes for consistency if applicable
        if (row.unit_of_measure?.includes("Kilogramme")) {
          value = value / 1000; // Convert kg to tonnes
        }

        if (countryTotals.has(countryCode)) {
          countryTotals.get(countryCode)!.total += value;
        } else {
          countryTotals.set(countryCode, { total: value, name: countryName });
        }
      });

      // Convert to array format
      const countryDataArray: CountryData[] = Array.from(
        countryTotals.entries()
      ).map(([countryCode, data]) => ({
        countryCode,
        countryName: data.name,
        totalValue: data.total,
      }));

      // Sort by total value (highest first)
      countryDataArray.sort((a, b) => b.totalValue - a.totalValue);

      setCountriesData(countryDataArray);
    } catch (error) {
      console.error("Error fetching map data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setCountriesData([]);
    } finally {
      setLoading(false);
      // Set to true after the first fetch, whether successful or not,
      // to prevent tab skeletons from reappearing on subsequent loads.
      setHasFetchedInitialData(true);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [yearRange, selectedEmissionType]);

  const currentIndicator = emissionIndicatorsForMap.find(
    (i) => i.value === selectedEmissionType
  );

  // Removed the top-level `if (loading)` block that returned the full WorldMapSkeleton,
  // as skeletons are now handled internally based on specific elements.

  const locations = countriesData.map((d) => d.countryCode);
  const values = countriesData.map((d) => d.totalValue);
  const hoverText = countriesData.map((d) => {
    const formatted = formatCompactNumber(d.totalValue);
    return `<b>${d.countryName}</b><br>${
      currentIndicator?.label || "Emissions"
    }: ${formatted.full} ${currentIndicator?.unit || "Tonnes"}<extra></extra>`;
  });

  const mapColorscale =
    theme === "dark"
      ? [
          [0, "#1a0000"],
          [0.2, "#4d0000"],
          [0.4, "#800000"],
          [0.6, "#b30000"],
          [0.8, "#e60000"],
          [1, "#ff3333"],
        ]
      : [
          [0, "#fef3c7"],
          [0.2, "#fbbf24"],
          [0.4, "#f59e0b"],
          [0.6, "#ea580c"],
          [0.8, "#dc2626"],
          [1, "#7f1d1d"],
        ];

  const landColor = theme === "dark" ? "#374151" : "#f3f4f6";
  const oceanColor = theme === "dark" ? "#1f2937" : "#f0f9ff";
  const coastlineColor = theme === "dark" ? "#4b5563" : "#e5e7eb";
  const textColor = theme === "dark" ? "#e5e7eb" : "#1f2937";

  const mapData = {
    type: "choropleth" as const,
    locations: locations,
    z: values,
    locationmode: "ISO-3",
    colorscale: mapColorscale,
    showscale: true,
    colorbar: {
      title: {
        text: `${currentIndicator?.label || "Emissions"} (${
          currentIndicator?.unit || "Tonnes"
        })`,
        font: { size: 12, color: textColor },
        side: "bottom" as const,
      },
      tickformat: ".2s",
      orientation: "h" as const,
      len: 0.6, // Reduced from 0.9 to make the heat scale narrower
      thickness: 20,
      tickfont: { color: textColor },
      x: 0.2, // Adjusted to center the narrower scale
      xanchor: "left" as const,
      y: -0.05,
      yanchor: "top" as const,
    },
    hovertemplate: hoverText,
    marker: {
      line: {
        color: coastlineColor,
        width: 0.5,
      },
    },
    zmid: 0,
    zauto: false,
    zmin: Math.min(...values),
    zmax: Math.max(...values),
  };

  const layout = {
    geo: {
      showframe: false,
      showcoastlines: true,
      coastlinecolor: coastlineColor,
      projection: {
        type: "natural earth" as const,
        scale: 1,
      },
      bgcolor: "rgba(0,0,0,0)",
      showland: true,
      landcolor: landColor,
      showocean: true,
      oceancolor: oceanColor,
      dragmode: false,
      fixedrange: true,
      center: {
        lat: 0,
        lon: 0,
      },
      lonaxis: {
        range: [-180, 180],
        fixedrange: true,
      },
      lataxis: {
        range: [-90, 90],
        fixedrange: true,
      },
      domain: {
        x: [0, 1],
        y: [0.05, 1],
      },
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { t: 0, b: 50, l: 0, r: 0 },
    height: 450,
    autosize: true,
  };

  const config = {
    displayModeBar: false,
    responsive: true,
    scrollZoom: false,
    doubleClick: false,
    showTips: false,
    staticPlot: false,
    dragmode: false,
    editable: false,
    autosizable: true,
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Earth className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          Global Emissions
          <span className="ml-1 text-muted-foreground text-base font-normal">
            (Sum)
          </span>
        </h3>
      </div>
      <p className="text-sm text-muted-foreground mt-1 mb-2">
        Showing the total accumulated emissions over the selected time period.
      </p>
      <div className="mt-4">
        {/* Custom Emission Type Tabs */}
        {/* Show tab skeletons only on initial load (when loading and no data has been fetched yet) */}
        {loading && !hasFetchedInitialData ? (
          <div className="flex items-center gap-2 p-1.5 rounded-lg mb-4 flex-wrap w-fit">
            {emissionIndicatorsForMap.map((_, i) => (
              <Skeleton key={i} className="w-28 h-8 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-4 flex-wrap w-fit">
            {emissionIndicatorsForMap.map((indicator) => {
              const isActive = selectedEmissionType === indicator.value;
              const config =
                emissionTabConfig[
                  indicator.value as keyof typeof emissionTabConfig
                ];

              if (!config) return null;

              const IconComponent = config.icon;
              const hexColor = config.color;

              return (
                <button
                  key={indicator.value}
                  onClick={() => setSelectedEmissionType(indicator.value)}
                  className={cn(
                    "relative flex items-center gap-1 px-2 py-1.5 rounded-md font-semibold text-[10px] transition-all duration-300 ease-in-out group",
                    isActive ? "" : "border border-muted-foreground/10"
                  )}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(to right, ${hexToRgba(
                            hexColor,
                            0.15
                          )}, ${hexToRgba(hexColor, 0.05)})`,
                        }
                      : {}
                  }
                >
                  <IconComponent
                    className={cn(
                      "w-3.5 h-3.5 transition-all duration-300 ease-in-out",
                      !isActive && "opacity-40 group-hover:opacity-100"
                    )}
                    style={{ color: hexColor }}
                  />
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out text-xs",
                      !isActive && "opacity-40 group-hover:opacity-100"
                    )}
                    style={{ color: hexColor }}
                  >
                    {indicator.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Map Content */}
        <div className="w-full">
          {loading ? ( // Show map skeleton for any loading
            <Skeleton className="w-full h-96 rounded-lg mt-4" />
          ) : error ? (
            <div className="text-center text-red-600 p-6 border border-red-200 rounded-lg mt-4">
              <p className="text-lg font-semibold mb-2">Error Loading Map</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : countriesData.length === 0 ? (
            <div className="text-center text-muted-foreground p-6 border border-gray-200 rounded-lg mt-4">
              <p className="text-lg font-semibold mb-2">No Data Available</p>
              <p className="text-sm">
                No {currentIndicator?.label || "emission"} data found for the
                selected year range.
              </p>
            </div>
          ) : (
            <Plot
              data={[mapData]}
              layout={layout}
              config={config}
              style={{ width: "100%", height: "450px" }}
              useResizeHandler={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
