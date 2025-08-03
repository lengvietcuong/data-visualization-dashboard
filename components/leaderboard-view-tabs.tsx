"use client";

import {
  BarChart,
  LayoutGrid,
  ScatterChartIcon as Scatter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type LeaderboardViewTab = "bar-chart" | "treemap" | "scatterplot";

interface LeaderboardViewTabsProps {
  activeTab: LeaderboardViewTab;
  onTabChange: (tab: LeaderboardViewTab) => void;
}

const tabConfig = {
  scatterplot: {
    icon: Scatter,
    label: "Scatterplot",
    activeGradient: "from-slate-500/15 to-slate-500/5",
    activeTextColor: "text-slate-600 dark:text-slate-400",
    activeIconColor: "text-slate-600 dark:text-slate-400",
    defaultTextColor: "text-slate-700/40 dark:text-slate-300/40",
    defaultIconColor: "text-slate-700/40 dark:text-slate-300/40",
    hoverTextColor: "text-slate-600 dark:text-slate-400",
    hoverIconColor: "text-slate-600 dark:text-slate-400",
  },
  "bar-chart": {
    icon: BarChart,
    label: "Bar Chart",
    activeGradient: "from-slate-500/15 to-slate-500/5",
    activeTextColor: "text-slate-600 dark:text-slate-400",
    activeIconColor: "text-slate-600 dark:text-slate-400",
    defaultTextColor: "text-slate-700/40 dark:text-slate-300/40",
    defaultIconColor: "text-slate-700/40 dark:text-slate-300/40",
    hoverTextColor: "text-slate-600 dark:text-slate-400",
    hoverIconColor: "text-slate-600 dark:text-slate-400",
  },
  treemap: {
    icon: LayoutGrid,
    label: "Treemap",
    activeGradient: "from-slate-500/15 to-slate-500/5",
    activeTextColor: "text-slate-600 dark:text-slate-400",
    activeIconColor: "text-slate-600 dark:text-slate-400",
    defaultTextColor: "text-slate-700/40 dark:text-slate-300/40",
    defaultIconColor: "text-slate-700/40 dark:text-slate-300/40",
    hoverTextColor: "text-slate-600 dark:text-slate-400",
    hoverIconColor: "text-slate-600 dark:text-slate-400",
  },
};

export function LeaderboardViewTabs({
  activeTab,
  onTabChange,
}: LeaderboardViewTabsProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 w-fit">
      {Object.entries(tabConfig).map(([key, config]) => {
        const isActive = activeTab === key;
        const Icon = config.icon;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key as LeaderboardViewTab)}
            className={cn(
              "relative flex items-center gap-1 px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 group",
              isActive
                ? `bg-gradient-to-r ${config.activeGradient}`
                : `border border-muted-foreground/10`
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 transition-colors duration-200",
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
