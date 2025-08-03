"use client"

import { Trophy, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LeaderboardSectionHeaderProps {
  description: string
}

export function LeaderboardSectionHeader({ description }: LeaderboardSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Trophy className="w-6 h-6 text-yellow-500" />
      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Leaderboard</h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Compare countries based on different environmental indicators. Use the filters to customize the view:</p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>
                <strong>Type</strong>: Choose between raw values, growth metrics, or growth rates
              </li>
              <li>
                <strong>Normalization</strong>: Adjust values relative to population, area, or other factors
              </li>
              <li>
                <strong>Region</strong>: Filter countries by geographic region
              </li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
