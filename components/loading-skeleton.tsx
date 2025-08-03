import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 pt-4 px-4">
        {/* Desktop and Tablet Layout */}
        <div className="hidden sm:flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-24 h-5" />
            </div>
            <Skeleton className="w-40 h-3 mt-1" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-36 h-5 rounded" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-24 h-5" />
            </div>
            <Skeleton className="w-40 h-3 mt-1" />
          </div>
          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-full" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <Skeleton className="w-32 h-5 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="max-h-80 overflow-y-auto">
          {/* Increased spacing between description and table header */}
          <div className="h-3"></div>

          {/* Table Header Skeleton */}
          <div className="px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-20 h-3" />
              <Skeleton className="flex-1 h-3" />
              <Skeleton className="w-12 h-3" />
            </div>
          </div>

          {/* Table Rows Skeleton with separators */}
          <div className="px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 h-6 py-1">
                  <Skeleton className="w-8 h-4" />
                  <Skeleton className="w-6 h-4" />
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="flex-1 h-2 rounded-full" />
                  <Skeleton className="w-12 h-4" />
                </div>
                {i < 7 && <div className="h-px bg-border my-1"></div>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WorldMapSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="w-full h-96 rounded-lg mt-4" />
    </div>
  )
}

export function GlobalEmissionsChartSkeleton({ count = 5 }: { count?: number }) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"] // Matching colors from chartConfig

  // Helper to convert hex to rgba with opacity
  function hexToRgba(hex: string, alpha: number) {
    let r = 0,
      g = 0,
      b = 0
    // Handle #RRGGBB or #RGB
    if (hex.length === 7) {
      // #RRGGBB
      r = Number.parseInt(hex.substring(1, 3), 16)
      g = Number.parseInt(hex.substring(3, 5), 16)
      b = Number.parseInt(hex.substring(5, 7), 16)
    } else if (hex.length === 4) {
      // #RGB
      r = Number.parseInt(hex[1] + hex[1], 16)
      g = Number.parseInt(hex[2] + hex[2], 16)
      b = Number.parseInt(hex[3] + hex[3], 16)
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 xl:gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="flex flex-col justify-between p-4 min-h-[88px] h-[88px]"
          style={{
            backgroundColor: hexToRgba(colors[i % colors.length], 0.03),
          }}
        >
          <CardContent className="p-0 flex justify-between items-center h-full">
            {/* Left column: Title and Year/Values */}
            <div className="flex flex-col flex-1 justify-center">
              <div className="text-base font-semibold flex items-center gap-1">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="w-24 h-4" />
              </div>
              <div className="text-sm flex items-center gap-2 mt-1">
                <Skeleton className="w-10 h-3" />
                <Skeleton className="w-16 h-3" />
                <div className="h-4 w-px bg-muted-foreground" />
                <Skeleton className="w-10 h-3" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>

            {/* Right column: Percentage */}
            <div className="flex items-center justify-end ml-4">
              <Skeleton className="w-20 h-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      {/* Statistics Badges Skeleton */}
      <div className="flex justify-center items-center gap-3 flex-wrap mt-3">
        <Skeleton className="w-36 h-5 rounded-full" />
        <Skeleton className="w-36 h-5 rounded-full" />
        <Skeleton className="w-36 h-5 rounded-full" />
      </div>

      {/* World Map Section and Global Emissions Chart (KPI Cards) */}
      <div className="mt-10 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
        <WorldMapSkeleton />
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-6 w-48" />
          </div>
          <GlobalEmissionsChartSkeleton />
        </div>
      </div>

      {/* Leaderboard Title Skeleton */}
      <div className="flex items-center gap-2 mt-12 mb-3">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-24 sm:w-32 h-6 sm:h-7" />
      </div>

      {/* Leaderboards Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LeaderboardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}
