import { useRef, useCallback, memo } from "react"
import { DirectionIndicator } from "./DirectionIndicator"
import type { CategoryId, StatusEntry } from "#/hooks/useStatusStore"

function barColorClass(level: number): string {
	if (level >= 70) return "bg-bar-high shadow-bar-high/40"
	if (level >= 40) return "bg-bar-mid shadow-bar-mid/40"
	if (level >= 20) return "bg-bar-low shadow-bar-low/40"
	return "bg-bar-critical shadow-bar-critical/40"
}

export const StatusBar = memo(function StatusBar({
	entry,
	label,
	onLevelChange,
	onDirectionCycle,
	onInteractionEnd,
}: {
	entry: StatusEntry
	label: string
	onLevelChange: (id: CategoryId, level: number) => void
	onDirectionCycle: (id: CategoryId) => void
	onInteractionEnd?: () => void
}) {
	const barRef = useRef<HTMLDivElement>(null)
	const isDragging = useRef(false)

	const handleInteraction = useCallback(
		(clientX: number) => {
			const el = barRef.current
			if (!el) return
			const rect = el.getBoundingClientRect()
			const pct = Math.round(((clientX - rect.left) / rect.width) * 100)
			onLevelChange(entry.id, pct)
		},
		[entry.id, onLevelChange],
	)

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault()
			const el = barRef.current
			if (!el) return
			isDragging.current = true
			el.setPointerCapture(e.pointerId)
			handleInteraction(e.clientX)
		},
		[handleInteraction],
	)

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!barRef.current?.hasPointerCapture(e.pointerId)) return
			handleInteraction(e.clientX)
		},
		[handleInteraction],
	)

	const handlePointerUp = useCallback(() => {
		isDragging.current = false
		onInteractionEnd?.()
	}, [onInteractionEnd])

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<span className="text-base leading-none">{entry.emoji}</span>
					<span className="text-xs font-semibold text-text-primary tracking-wide uppercase">
						{label}
					</span>
				</div>
				<DirectionIndicator
					direction={entry.direction}
					onCycle={() => onDirectionCycle(entry.id)}
				/>
			</div>

			<div
				ref={barRef}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onLostPointerCapture={handlePointerUp}
				className="relative h-5 rounded-full bg-surface-bar cursor-pointer overflow-hidden touch-none"
			>
				<div
					className={`absolute inset-y-0 left-0 rounded-full shadow-md overflow-hidden ${isDragging.current ? "" : "transition-all duration-150 ease-out"} ${barColorClass(entry.level)}`}
					style={{ width: `${Math.max(entry.level, 6)}%` }}
				>
					{entry.direction !== "stable" && (
						<div
							className={`absolute inset-0 ${entry.direction === "increasing" ? "animate-shimmer-right" : "animate-shimmer-left"}`}
							style={{
								background:
									"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
								width: "50%",
							}}
						/>
					)}
				</div>
				<div className="absolute inset-0 rounded-full bg-linear-to-b from-white/15 to-transparent pointer-events-none" />
			</div>
		</div>
	)
})
