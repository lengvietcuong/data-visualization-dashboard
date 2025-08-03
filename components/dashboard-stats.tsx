import { Globe, Database, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalCountries: number
  totalRecords: number
  totalIndicators: number
}

interface DashboardStatsProps {
  stats: DashboardStats
  loading?: boolean
}

export function DashboardStatsComponent({ stats, loading = false }: DashboardStatsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center gap-3 flex-wrap mt-3">
        <Skeleton className="w-36 h-5 rounded-full" />
        <Skeleton className="w-36 h-5 rounded-full" />
        <Skeleton className="w-36 h-5 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center gap-3 flex-wrap mt-3">
      <Badge variant="secondary" className="flex items-center gap-2">
        <Globe className="w-4 h-4" style={{ color: "#3b82f6" }} />
        {formatNumber(stats.totalCountries)} Countries
      </Badge>

      <Badge variant="secondary" className="flex items-center gap-2">
        <Database className="w-4 h-4" style={{ color: "#10b981" }} />
        {formatNumber(stats.totalRecords)} Records
      </Badge>

      <Badge variant="secondary" className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4" style={{ color: "#f59e0b" }} />
        {formatNumber(stats.totalIndicators)} Indicators
      </Badge>
    </div>
  )
}
