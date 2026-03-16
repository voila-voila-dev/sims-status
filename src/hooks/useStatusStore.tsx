import { useState, useCallback } from "react"

export type Direction = "increasing" | "decreasing" | "stable"

export type CategoryId = "bladder" | "fun" | "hunger" | "social" | "energy" | "hygiene"

export interface StatusEntry {
	id: CategoryId
	level: number
	direction: Direction
	emoji: string
}

const INITIAL: StatusEntry[] = [
	{ id: "bladder", level: 72, direction: "stable", emoji: "🚽" },
	{ id: "fun", level: 85, direction: "increasing", emoji: "🎮" },
	{ id: "hunger", level: 40, direction: "decreasing", emoji: "🍔" },
	{ id: "social", level: 65, direction: "stable", emoji: "💬" },
	{ id: "energy", level: 55, direction: "decreasing", emoji: "⚡" },
	{ id: "hygiene", level: 90, direction: "increasing", emoji: "🧼" },
]

const DIRECTIONS: Direction[] = ["stable", "increasing", "decreasing"]

export { INITIAL as DEFAULT_STATUSES }

export function useStatusStore(initial?: StatusEntry[]) {
	const [statuses, setStatuses] = useState<StatusEntry[]>(initial ?? INITIAL)

	const setLevel = useCallback((id: CategoryId, level: number) => {
		setStatuses((prev) =>
			prev.map((s) => {
				if (s.id !== id) return s
				const clamped = Math.max(0, Math.min(100, level))
				const direction: Direction =
					clamped > s.level ? "increasing" : clamped < s.level ? "decreasing" : s.direction
				return { ...s, level: clamped, direction }
			}),
		)
	}, [])

	const cycleDirection = useCallback((id: CategoryId) => {
		setStatuses((prev) =>
			prev.map((s) => {
				if (s.id !== id) return s
				const idx = DIRECTIONS.indexOf(s.direction)
				return { ...s, direction: DIRECTIONS[(idx + 1) % DIRECTIONS.length] }
			}),
		)
	}, [])

	return { statuses, setLevel, cycleDirection }
}
