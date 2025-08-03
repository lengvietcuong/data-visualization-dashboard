"use client"

import { DualRangeSlider } from "./dual-range-slider"

interface YearRangeSliderProps {
  yearRange: [number, number]
  onYearRangeChange: (range: [number, number]) => void
  minYear: number
  maxYear: number
}

export function YearRangeSliderComponent({ yearRange, onYearRangeChange, minYear, maxYear }: YearRangeSliderProps) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-sm">
        <DualRangeSlider
          value={yearRange}
          onValueChange={(value) => onYearRangeChange(value as [number, number])}
          min={minYear}
          max={maxYear}
          step={1}
          className="w-full"
          label={(value) => <span className="text-xs font-medium text-foreground">{value}</span>}
          labelPosition="bottom"
        />
      </div>
    </div>
  )
}
