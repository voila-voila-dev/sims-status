import { useCallback, useEffect, useRef } from "react"
import {
	DEFAULT_STATUSES,
	type StatusEntry,
	type Direction,
} from "./useStatusStore"
import { type Locale, LOCALES } from "./useLocale"

const DIR_SHORT: Record<Direction, string> = {
	increasing: "i",
	decreasing: "d",
	stable: "s",
}
const DIR_FROM_SHORT: Record<string, Direction> = {
	i: "increasing",
	d: "decreasing",
	s: "stable",
}

export interface UrlState {
	statuses?: StatusEntry[]
	title?: string
	locale?: Locale
}

function parseStateFromURL(): UrlState {
	const params = new URLSearchParams(window.location.search)
	const result: UrlState = {}

	const parsed: StatusEntry[] = []
	for (const base of DEFAULT_STATUSES) {
		const val = params.get(base.id)
		if (!val) continue
		const [levelStr, dirShort] = val.split(".")
		if (!dirShort || !DIR_FROM_SHORT[dirShort]) continue
		const level = Number(levelStr)
		if (isNaN(level) || level < 0 || level > 100) continue
		parsed.push({
			id: base.id,
			level,
			direction: DIR_FROM_SHORT[dirShort],
			emoji: base.emoji,
		})
	}
	if (parsed.length === DEFAULT_STATUSES.length) {
		result.statuses = parsed
	}

	const title = params.get("t")
	if (title) result.title = title

	const l = params.get("l")
	if (l && (LOCALES as readonly string[]).includes(l)) {
		result.locale = l as Locale
	}

	return result
}

function encodeStateToURL(
	statuses: StatusEntry[],
	customTitle: string | null,
	locale: Locale,
): string {
	const params = new URLSearchParams()

	for (const st of statuses) {
		params.set(st.id, `${st.level}.${DIR_SHORT[st.direction]}`)
	}

	if (customTitle) params.set("t", customTitle)
	if (locale !== "en") params.set("l", locale)

	return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

/**
 * Reads initial state from URL params and provides deferred URL sync.
 * State updates are instant; URL only updates on flushUrlSync() or after
 * an 800ms fallback debounce.
 */
export function useUrlSync(
	statuses: StatusEntry[],
	customTitle: string | null,
	locale: Locale,
) {
	const latestStateRef = useRef({ statuses, customTitle, locale })
	latestStateRef.current = { statuses, customTitle, locale }

	const replaceTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

	const flushUrlSync = useCallback(() => {
		if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current)
		const { statuses: s, customTitle: ct, locale: l } = latestStateRef.current
		const url = encodeStateToURL(s, ct, l)
		window.history.replaceState(null, "", url)
	}, [])

	// Fallback debounce for non-slider state changes (title, locale, direction)
	useEffect(() => {
		if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current)
		replaceTimerRef.current = setTimeout(flushUrlSync, 800)
		return () => {
			if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current)
		}
	}, [statuses, customTitle, locale, flushUrlSync])

	const getShareUrl = useCallback(() => {
		return encodeStateToURL(statuses, customTitle, locale)
	}, [statuses, customTitle, locale])

	return { flushUrlSync, getShareUrl }
}

export { parseStateFromURL }
