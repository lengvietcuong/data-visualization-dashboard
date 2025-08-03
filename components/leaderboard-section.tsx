"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LeaderboardSectionHeader } from "./leaderboard-section-header";
import { LeaderboardTabs } from "./leaderboard-tabs";
import { DashboardFilters } from "./dashboard-filters";
import { LeaderboardCardsGrid } from "./leaderboard-cards-grid";
import { LeaderboardTreemapsGrid } from "./leaderboard-treemaps-grid";
import { LeaderboardScatterplotsGrid } from "./leaderboard-scatterplots-grid";
import { LeaderboardViewTabs } from "./leaderboard-view-tabs";
import { INDICATOR_OPTIONS } from "../hooks/use-dashboard-data";
import type { RegionValue } from "../utils/regions";

interface LeaderboardEntry {
  rank: number;
  country: string;
  countryCode: string;
  value: number;
  exactValue: { compact: string; full: string };
  rawValue: number;
}

interface CountryData {
  ref_area: string;
  population: number | null;
  area_km2: number | null;
  agricultural_land_area: number | null;
}

type NormalizationType =
  | "none"
  | "population"
  | "area"
  | "population-density"
  | "agricultural-land";
type LeaderboardType =
  | "raw-value"
  | "total-growth"
  | "avg-yearly-growth"
  | "total-growth-rate"
  | "annual-growth-rate";
type LeaderboardTab = "emissions" | "land" | "livestock" | "nutrients";
type LeaderboardViewTab = "bar-chart" | "treemap" | "scatterplot";

interface LeaderboardSectionProps {
  leaderboardData: Record<string, LeaderboardEntry[]>;
  leaderboardLoading: Record<string, boolean>;
  selectedView: Record<string, "up" | "down">;
  onViewChange: (indicatorValue: string, view: "up" | "down") => void;
  globalRegion: RegionValue;
  onRegionChange: (region: RegionValue) => void;
  normalization: NormalizationType;
  onNormalizationChange: (normalization: NormalizationType) => void;
  leaderboardType: LeaderboardType;
  onLeaderboardTypeChange: (type: LeaderboardType) => void;
  yearRange: [number, number];
  countryData: Record<string, CountryData>;
}

export function LeaderboardSection({
  leaderboardData,
  leaderboardLoading,
  selectedView,
  onViewChange,
  globalRegion,
  onRegionChange,
  normalization,
  onNormalizationChange,
  leaderboardType,
  onLeaderboardTypeChange,
  yearRange,
  countryData,
}: LeaderboardSectionProps) {
  const [activeLeaderboardTab, setActiveLeaderboardTab] =
    useState<LeaderboardTab>("emissions");
  // Default view set to scatterplot
  const [activeViewTab, setActiveViewTab] =
    useState<LeaderboardViewTab>("scatterplot");

  const getLeaderboardDescription = () => {
    if (activeViewTab === "scatterplot") {
      let xAxisDescription = "";
      switch (normalization) {
        case "none":
          xAxisDescription = "raw indicator values";
          break;
        case "population":
          xAxisDescription = "population";
          break;
        case "area":
          xAxisDescription = "total area";
          break;
        case "population-density":
          xAxisDescription = "population density";
          break;
        case "agricultural-land":
          xAxisDescription = "agricultural land area";
          break;
      }
      return `Showing the relationship between ${xAxisDescription} (X-axis) and indicator values (Y-axis) for each country.`;
    }

    let description = "";

    switch (leaderboardType) {
      case "raw-value":
        description =
          "Showing the total accumulated value for each country over the selected time period.";
        break;
      case "total-growth":
        description =
          "Showing the absolute change in value from the first to the last year in the selected time range.";
        break;
      case "avg-yearly-growth":
        description =
          "Showing the average yearly change in value over the selected time period.";
        break;
      case "total-growth-rate":
        description =
          "Showing the percentage change from the first to the last year in the selected time range.";
        break;
      case "annual-growth-rate":
        description =
          "Showing the compound annual growth rate (CAGR) over the selected time period.";
        break;
      default:
        description = "";
    }

    if (normalization !== "none") {
      const normalizationText =
        normalization === "population"
          ? "population (per million people)"
          : normalization === "area"
          ? "area (per 1000 km²)"
          : normalization === "population-density"
          ? "population density (per 100 people per km²)"
          : "agricultural land area (per 1000 hectares)";

      description += ` Values are normalized by ${normalizationText}.`;
    }

    if (leaderboardType === "raw-value") {
      description += " Click on a country to see its trend over time.";
    }

    return description;
  };

  const getUnitWithNormalization = (
    baseUnit: string,
    normalization: NormalizationType,
    type: LeaderboardType
  ): string => {
    let unit = baseUnit;
    if (type === "total-growth" || type === "avg-yearly-growth") {
      unit = `${baseUnit} change`;
    } else if (type === "total-growth-rate" || type === "annual-growth-rate") {
      unit = "%";
    }

    switch (normalization) {
      case "population":
        return `${unit} per million people`;
      case "area":
        return `${unit} per 1000 km²`;
      case "population-density":
        return `${unit} per 100 people per km²`;
      case "agricultural-land":
        return `${unit} per 1000 hectares of agricultural land`;
      default:
        return unit;
    }
  };

  const emissionsIndicators = INDICATOR_OPTIONS.filter(
    (i) => i.category === "emissions"
  );
  const landIndicators = INDICATOR_OPTIONS.filter(
    (i) => i.category === "agriculture"
  );
  const livestockIndicators = INDICATOR_OPTIONS.filter(
    (i) => i.category === "livestock"
  );
  const nutrientsIndicators = INDICATOR_OPTIONS.filter(
    (i) => i.category === "nutrients"
  );

  return (
    <Tabs
      value={activeLeaderboardTab}
      onValueChange={(value) =>
        setActiveLeaderboardTab(value as LeaderboardTab)
      }
      className="mt-12"
    >
      <LeaderboardSectionHeader description={getLeaderboardDescription()} />

      <p className="text-sm text-muted-foreground mb-3 max-w-4xl">
        {getLeaderboardDescription()}
      </p>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-2 lg:gap-3">
        <div className="mb-2 sm:mb-0 sm:mr-2">
          <LeaderboardTabs
            activeTab={activeLeaderboardTab}
            onTabChange={setActiveLeaderboardTab}
          />
        </div>
        <div>
          <LeaderboardViewTabs
            activeTab={activeViewTab}
            onTabChange={setActiveViewTab}
          />
        </div>
      </div>
      <div className="flex justify-start sm:justify-end mb-4">
        <DashboardFilters
          globalRegion={globalRegion}
          onRegionChange={onRegionChange}
          normalization={normalization}
          onNormalizationChange={onNormalizationChange}
          leaderboardType={leaderboardType}
          onLeaderboardTypeChange={onLeaderboardTypeChange}
          viewType={activeViewTab}
        />
      </div>

      <TabsContent value="emissions">
        {activeViewTab === "bar-chart" && (
          <LeaderboardCardsGrid
            indicators={emissionsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "treemap" && (
          <LeaderboardTreemapsGrid
            indicators={emissionsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "scatterplot" && (
          <LeaderboardScatterplotsGrid
            indicators={emissionsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            globalRegion={globalRegion}
            yearRange={yearRange}
            xAxisType={normalization}
            countryData={countryData}
          />
        )}
      </TabsContent>

      <TabsContent value="land">
        {activeViewTab === "bar-chart" && (
          <LeaderboardCardsGrid
            indicators={landIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "treemap" && (
          <LeaderboardTreemapsGrid
            indicators={landIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "scatterplot" && (
          <LeaderboardScatterplotsGrid
            indicators={landIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            globalRegion={globalRegion}
            yearRange={yearRange}
            xAxisType={normalization}
            countryData={countryData}
          />
        )}
      </TabsContent>

      <TabsContent value="livestock">
        {activeViewTab === "bar-chart" && (
          <LeaderboardCardsGrid
            indicators={livestockIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "treemap" && (
          <LeaderboardTreemapsGrid
            indicators={livestockIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "scatterplot" && (
          <LeaderboardScatterplotsGrid
            indicators={livestockIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            globalRegion={globalRegion}
            yearRange={yearRange}
            xAxisType={normalization}
            countryData={countryData}
          />
        )}
      </TabsContent>

      <TabsContent value="nutrients">
        {activeViewTab === "bar-chart" && (
          <LeaderboardCardsGrid
            indicators={nutrientsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "treemap" && (
          <LeaderboardTreemapsGrid
            indicators={nutrientsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            selectedView={selectedView}
            onViewChange={onViewChange}
            globalRegion={globalRegion}
            yearRange={yearRange}
            normalization={normalization}
            leaderboardType={leaderboardType}
            getUnitWithNormalization={getUnitWithNormalization}
          />
        )}
        {activeViewTab === "scatterplot" && (
          <LeaderboardScatterplotsGrid
            indicators={nutrientsIndicators}
            leaderboardData={leaderboardData}
            leaderboardLoading={leaderboardLoading}
            globalRegion={globalRegion}
            yearRange={yearRange}
            xAxisType={normalization}
            countryData={countryData}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
