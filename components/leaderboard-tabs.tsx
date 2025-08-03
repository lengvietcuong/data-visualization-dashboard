"use client";

import { Cloud, Mountain, Zap } from "lucide-react";
import { MilkIcon as GiCow } from "lucide-react";
import { cn } from "@/lib/utils";

type LeaderboardTab = "emissions" | "land" | "livestock" | "nutrients";

interface LeaderboardTabsProps {
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
}

const tabConfig = {
  emissions: {
    icon: Cloud,
    label: "Emissions",
    activeGradient: "from-blue-500/15 to-blue-500/5",
    activeTextColor: "text-blue-600 dark:text-blue-400",
    activeIconColor: "text-blue-600 dark:text-blue-400",
    defaultTextColor: "text-blue-700/40 dark:text-blue-300/40",
    defaultIconColor: "text-blue-700/40 dark:text-blue-300/40",
    hoverTextColor: "text-blue-600 dark:text-blue-400",
    hoverIconColor: "text-blue-600 dark:text-blue-400",
  },
  land: {
    icon: Mountain,
    label: "Land",
    activeGradient: "from-green-500/15 to-green-500/5",
    activeTextColor: "text-green-600 dark:text-green-400",
    activeIconColor: "text-green-600 dark:text-green-400",
    defaultTextColor: "text-green-700/40 dark:text-green-300/40",
    defaultIconColor: "text-green-700/40 dark:text-green-300/40",
    hoverTextColor: "text-green-600 dark:text-green-400",
    hoverIconColor: "text-green-600 dark:text-green-400",
  },
  livestock: {
    icon: GiCow,
    label: "Livestock",
    activeGradient: "from-amber-500/15 to-amber-500/5",
    activeTextColor: "text-amber-600 dark:text-amber-400",
    activeIconColor: "text-amber-600 dark:text-amber-400",
    defaultTextColor: "text-amber-700/40 dark:text-amber-300/40",
    defaultIconColor: "text-amber-700/40 dark:text-amber-300/40",
    hoverTextColor: "text-amber-600 dark:text-amber-400",
    hoverIconColor: "text-amber-600 dark:text-amber-400",
  },
  nutrients: {
    icon: Zap,
    label: "Nutrients",
    activeGradient: "from-purple-500/15 to-purple-500/5",
    activeTextColor: "text-purple-600 dark:text-purple-400",
    activeIconColor: "text-purple-600 dark:text-purple-400",
    defaultTextColor: "text-purple-700/40 dark:text-purple-300/40",
    defaultIconColor: "text-purple-700/40 dark:text-purple-300/40",
    hoverTextColor: "text-purple-600 dark:text-purple-400",
    hoverIconColor: "text-purple-600 dark:text-purple-400",
  },
};

export function LeaderboardTabs({
  activeTab,
  onTabChange,
}: LeaderboardTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 sm:p-1.5 px-1 py-1 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 w-fit">
      {Object.entries(tabConfig).map(([key, config]) => {
        const isActive = activeTab === key;
        const Icon = config.icon;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key as LeaderboardTab)}
            className={cn(
              // Reduce padding, font, and gap on mobile
              "relative flex items-center gap-0.5 px-2 py-1 rounded-md font-semibold text-xs sm:gap-1 sm:px-4 sm:py-2 sm:text-sm transition-all duration-200 group",
              isActive
                ? `bg-gradient-to-r ${config.activeGradient}`
                : `border border-muted-foreground/10`
            )}
          >
            <Icon
              className={cn(
                // Smaller icon on mobile
                "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200",
                isActive
                  ? config.activeIconColor
                  : `${config.defaultIconColor} group-hover:${config.hoverIconColor}`
              )}
            />
            <span
              className={cn(
                "transition-colors duration-200",
                isActive
                  ? config.activeTextColor
                  : `${config.defaultTextColor} group-hover:${config.hoverTextColor}`
              )}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
