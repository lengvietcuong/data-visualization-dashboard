"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardSkeleton } from "./components/loading-skeleton";
import { DashboardStatsComponent } from "./components/dashboard-stats";
import { useDashboardData } from "./hooks/use-dashboard-data";
import type { RegionValue } from "./utils/regions";
import { INDICATOR_OPTIONS } from "./hooks/use-dashboard-data";
import { useCountries } from "./hooks/use-countries";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardMainContent } from "./components/dashboard-main-content";
import { LeaderboardSection } from "./components/leaderboard-section";

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

export default function OECDDashboard() {
  const [yearRange, setYearRange] = useState<[number, number]>([2012, 2023]);
  const [selectedView, setSelectedView] = useState<
    Record<string, "up" | "down">
  >({});
  const [globalRegion, setGlobalRegion] = useState<RegionValue>("all");
  // Default normalization set to agricultural land
  const [normalization, setNormalization] =
    useState<NormalizationType>("agricultural-land");
  const [leaderboardType, setLeaderboardType] =
    useState<LeaderboardType>("raw-value");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const {
    stats,
    leaderboardData,
    loading,
    leaderboardLoading,
    error,
    fetchDashboardStats,
    fetchLeaderboardData,
    fetchCountryData,
    fetchFilteredStats,
    countryData,
  } = useDashboardData();

  const { countries } = useCountries();
  const selectedCountryName = selectedCountry
    ? countries.find((c) => c.code === selectedCountry)?.name || selectedCountry
    : null;

  const [filteredStats, setFilteredStats] = useState<{
    totalCountries: number;
    totalRecords: number;
    totalIndicators: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchCountryData();
  }, []);

  useEffect(() => {
    if (stats) {
      setYearRange([stats.minYear, stats.maxYear]);
      const promises = INDICATOR_OPTIONS.map((indicator) =>
        fetchLeaderboardData(
          indicator.value,
          yearRange,
          normalization,
          leaderboardType
        )
      );
      Promise.all(promises);
    }
  }, [stats, leaderboardType]);

  useEffect(() => {
    if (stats) {
      const promises = INDICATOR_OPTIONS.map((indicator) =>
        fetchLeaderboardData(
          indicator.value,
          yearRange,
          normalization,
          leaderboardType
        )
      );
      Promise.all(promises);
    }
  }, [yearRange, normalization, leaderboardType]);

  useEffect(() => {
    if (stats) {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const filtered = await fetchFilteredStats(yearRange);
          setFilteredStats(filtered);
        } catch (err) {
          console.error("Error fetching filtered stats:", err);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [yearRange, stats]);

  useEffect(() => {
    const initialView: Record<string, "up" | "down"> = {};
    INDICATOR_OPTIONS.forEach((indicator) => {
      initialView[indicator.value] = "up";
    });
    setSelectedView(initialView);
  }, []);

  const handleViewChange = (indicatorValue: string, view: "up" | "down") => {
    setSelectedView((prev) => ({ ...prev, [indicatorValue]: view }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 font-mono">
            OECD Environmental & Agricultural Indicators
          </h1>
          <div className="flex justify-center items-center py-12">
            <Card className="p-6">
              <CardContent>
                <div className="text-center text-red-600">
                  <p className="text-lg font-semibold mb-2">
                    Error Loading Data
                  </p>
                  <p className="text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        minYear={stats?.minYear || 2012}
        maxYear={stats?.maxYear || 2023}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
      />
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-foreground font-mono mb-0">
            OECD Environmental & Agricultural Indicators
          </h1>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Statistics Badges */}
              <DashboardStatsComponent
                stats={filteredStats || stats!}
                loading={statsLoading}
              />

              {/* Main Content Area */}
              <DashboardMainContent
                selectedCountry={selectedCountry}
                selectedCountryName={selectedCountryName}
                yearRange={yearRange}
              />

              {/* Leaderboard Section - Only show when no country is selected */}
              {!selectedCountry && (
                <LeaderboardSection
                  leaderboardData={leaderboardData}
                  leaderboardLoading={leaderboardLoading}
                  selectedView={selectedView}
                  onViewChange={handleViewChange}
                  globalRegion={globalRegion}
                  onRegionChange={setGlobalRegion}
                  normalization={normalization}
                  onNormalizationChange={setNormalization}
                  leaderboardType={leaderboardType}
                  onLeaderboardTypeChange={setLeaderboardType}
                  yearRange={yearRange}
                  countryData={countryData} // Add this line
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
