export function formatCompactNumber(num: number): { compact: string; full: string } {
  const absNum = Math.abs(num) // Use absolute value for compact display
  const sign = num < 0 ? "-" : "+" // Keep sign for full display if needed elsewhere

  let compact: string
  let full: string

  if (absNum >= 1e12) {
    compact = `${(absNum / 1e12).toFixed(1)}T`
  } else if (absNum >= 1e9) {
    compact = `${(absNum / 1e9).toFixed(1)}B`
  } else if (absNum >= 1e6) {
    compact = `${(absNum / 1e6).toFixed(1)}M`
  } else if (absNum >= 1e3) {
    compact = `${(absNum / 1e3).toFixed(1)}K`
  } else {
    compact = `${absNum.toFixed(0)}`
  }

  // Ensure full format still includes sign if original number was negative
  full = new Intl.NumberFormat("en-US", { signDisplay: "auto" }).format(num) // Use "auto" to show sign only for negative numbers

  return { compact, full }
}
