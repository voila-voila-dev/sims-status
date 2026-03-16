import type { Direction } from "./useStatusStore"

const config: Record<Direction, { symbol: string; color: string; label: string }> = {
	increasing: { symbol: "▲", color: "text-dir-up", label: "Increasing" },
	decreasing: { symbol: "▼", color: "text-dir-down", label: "Decreasing" },
	stable: { symbol: "■", color: "text-dir-stable", label: "Stable" },
}

export function DirectionIndicator({
	direction,
	onCycle,
}: {
	direction: Direction
	onCycle: () => void
}) {
	const { symbol, color, label } = config[direction]

	return (
		<button
			type="button"
			onClick={onCycle}
			className={`${color} text-[10px] leading-none px-1.5 py-1 rounded-md bg-surface-btn hover:bg-surface-btn-hover active:scale-95 transition-all cursor-pointer select-none`}
			aria-label={`Direction: ${label}. Click to cycle.`}
		>
			{symbol}
		</button>
	)
}
