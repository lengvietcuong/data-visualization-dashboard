"use client";

import type React from "react";
import { useState } from "react";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCountryFlag } from "../utils/country-flags";
import { filterCountriesByRegion, type RegionValue } from "../utils/regions";
import { TrendDialog } from "./trend-dialog";

interface LeaderboardEntry {
  rank: number;
  country: string;
  countryCode: string;
  value: number;
  exactValue: { compact: string; full: string };
  rawValue: number;
}

interface IndicatorOption {
  value: string;
  label: string;
  measure: string;
  unit: string;
  category: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
  bgColor: string;
}

interface LeaderboardCardProps {
  indicator: IndicatorOption;
  allData: LeaderboardEntry[];
  currentView: "up" | "down";
  globalRegion: RegionValue;
  onViewChange: (view: "up" | "down") => void;
  yearRange: [number, number];
  normalization:
    | "none"
    | "population"
    | "area"
    | "population-density"
    | "agricultural-land";
  leaderboardType:
    | "raw-value"
    | "total-growth"
    | "avg-yearly-growth"
    | "total-growth-rate"
    | "annual-growth-rate";
  enableTrendFilters?: boolean; // New prop
}

export function LeaderboardCard({
  indicator,
  allData,
  currentView,
  globalRegion,
  onViewChange,
  yearRange,
  normalization,
  leaderboardType,
  enableTrendFilters = true, // Default to true if not provided
}: LeaderboardCardProps) {
  const [selectedCountry, setSelectedCountry] = useState<{
    country: string;
    countryCode: string;
  } | null>(null);

  const IconComponent = indicator.icon;

  // Filter data by region for correct scaling
  const regionFiltered = filterCountriesByRegion(allData, globalRegion);
  const increasingCount = regionFiltered.filter(
    (entry) => entry.rawValue >= 0
  ).length;
  const decreasingCount = regionFiltered.filter(
    (entry) => entry.rawValue < 0
  ).length;

  const regionPositive = regionFiltered.filter((entry) => entry.rawValue >= 0);
  const regionNegative = regionFiltered
    .filter((entry) => entry.rawValue < 0)
    .sort((a, b) => a.rawValue - b.rawValue);

  const maxRegionPositive = Math.max(
    ...regionPositive.map((item) => item.rawValue),
    0
  );
  const maxRegionNegative = Math.abs(
    Math.min(...regionNegative.map((item) => item.rawValue), 0)
  );

  // Map to percent values based on region-specific max
  const viewData: LeaderboardEntry[] =
    currentView === "up"
      ? regionPositive.map((entry) => ({
          ...entry,
          value:
            maxRegionPositive > 0
              ? (entry.rawValue / maxRegionPositive) * 100
              : 0,
        }))
      : regionNegative.map((entry) => ({
          ...entry,
          value:
            maxRegionNegative > 0
              ? (Math.abs(entry.rawValue) / maxRegionNegative) * 100
              : 0,
        }));

  const finalData = viewData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const handleRowClick = (entry: LeaderboardEntry) => {
    if (leaderboardType !== "raw-value") {
      setSelectedCountry(null);
      return;
    }
    setSelectedCountry({
      country: entry.country,
      countryCode: entry.countryCode,
    });
  };

  return (
    <>
      <Card
        className="flex flex-col"
        style={{ backgroundColor: indicator.bgColor }}
      >
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="hidden sm:flex items-start justify-between">
            <div className="flex flex-col">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: indicator.color }}
                />
                {indicator.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Measured in {indicator.unit}
              </p>
            </div>
            {enableTrendFilters && (
              <div className="flex flex-nowrap items-start gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs flex-shrink-0"
                  onClick={() => onViewChange("up")}
                  style={{
                    backgroundColor:
                      currentView === "up" ? indicator.color : "transparent",
                    color: currentView === "up" ? "white" : "inherit",
                    borderColor:
                      currentView === "up" ? indicator.color : undefined,
                  }}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Up ({increasingCount})
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs flex-shrink-0"
                  onClick={() => onViewChange("down")}
                  style={{
                    backgroundColor:
                      currentView === "down" ? indicator.color : "transparent",
                    color: currentView === "down" ? "white" : "inherit",
                    borderColor:
                      currentView === "down" ? indicator.color : undefined,
                  }}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Down ({decreasingCount})
                </Badge>
              </div>
            )}
          </div>

          <div className="sm:hidden">
            <div className="flex flex-col">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: indicator.color }}
                />
                {indicator.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Measured in {indicator.unit}
              </p>
            </div>
            {enableTrendFilters && (
              <div className="flex flex-nowrap items-center gap-2 mt-3">
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs flex-shrink-0"
                  onClick={() => onViewChange("up")}
                  style={{
                    backgroundColor:
                      currentView === "up" ? indicator.color : "transparent",
                    color: currentView === "up" ? "white" : "inherit",
                    borderColor:
                      currentView === "up" ? indicator.color : undefined,
                  }}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Up ({increasingCount})
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs flex-shrink-0"
                  onClick={() => onViewChange("down")}
                  style={{
                    backgroundColor:
                      currentView === "down" ? indicator.color : "transparent",
                    color: currentView === "down" ? "white" : "inherit",
                    borderColor:
                      currentView === "down" ? indicator.color : undefined,
                  }}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Down ({decreasingCount})
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 max-w-12 text-xs">Rank</TableHead>
                  <TableHead className="w-28 max-w-28 text-xs">
                    Country
                  </TableHead>
                  <TableHead className="flex-1 text-xs">Value</TableHead>
                  <TableHead className="w-24 text-right text-xs">
                    Exact
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-xs">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  finalData.map((entry) => (
                    <TableRow
                      key={`${entry.countryCode}-${entry.rank}`}
                      className="h-8 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(entry)}
                    >
                      <TableCell className="font-medium py-1 text-xs w-12 max-w-12">
                        {entry.rank}
                      </TableCell>
                      <TableCell
                        className="py-1 text-xs w-28 max-w-28"
                        title={entry.country}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-sm country-flag">
                            {getCountryFlag(entry.countryCode)}
                          </span>
                          <span className="truncate text-xs">
                            {entry.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 flex-1">
                        <div className="w-full">
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${entry.value}%`,
                                backgroundColor: indicator.color,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right py-1 font-mono text-xs w-24"
                        title={entry.exactValue.full}
                      >
                        {entry.exactValue.compact}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCountry && (
        <TrendDialog
          isOpen={!!selectedCountry}
          onClose={() => setSelectedCountry(null)}
          country={selectedCountry.country}
          countryCode={selectedCountry.countryCode}
          indicator={{
            measure: indicator.measure,
            label: indicator.label,
            unit: indicator.unit,
            color: indicator.color,
          }}
          yearRange={yearRange}
          normalization={normalization}
        />
      )}
    </>
  );
}
