"use client"

import { YearRangeSliderComponent } from "./year-range-slider"
import { CountrySelector } from "./country-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Bot } from "lucide-react"

interface DashboardHeaderProps {
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  minYear: number
  maxYear: number
  selectedCountry: string | null
  onCountryChange: (countryCode: string | null) => void
}

function handleAiAgentClick(): void {
  window.open(
    "https://data-science-agent.vercel.app?template=sys-oecd-analysis",
    "_blank"
  )
}

export function DashboardHeader({
  yearRange,
  onYearRangeChange,
  minYear,
  maxYear,
  selectedCountry,
  onCountryChange,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* Top row on mobile: Year Range Slider and Theme Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex-1 md:w-64 lg:w-80">
              <YearRangeSliderComponent
                yearRange={yearRange}
                onYearRangeChange={onYearRangeChange}
                minYear={minYear}
                maxYear={maxYear}
              />
            </div>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>

          {/* Bottom row on mobile: Country Selector, Desktop: Country Selector, Theme Toggle, and AI Agent Button */}
          <div className="flex items-center gap-3 w-full md:w-auto md:justify-end">
            <div className="w-full md:w-auto">
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountryChange={onCountryChange}
              />
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAiAgentClick}
                    className="shrink-0 transition-colors duration-300 hover:bg-gradient-to-br hover:from-blue-400 hover:to-pink-400 hover:text-white"
                  >
                    <Bot className="h-4 w-4" />
                    <span className="sr-only">AI Agent</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Need a custom analysis? Click to chat with our AI agent!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
