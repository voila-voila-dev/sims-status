import { useCallback } from "react"
import { useUrlParams, getParams } from "./useUrlParams"
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

export function parseStateFromURL(): UrlState {
	const params = getParams()
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

/**
 * Sims-specific URL sync. Serializes statuses, title, and locale into URL
 * params. Defers writes via useUrlParams; call flushUrlSync on interaction end.
 */
export function useUrlSync(
	statuses: StatusEntry[],
	customTitle: string | null,
	locale: Locale,
) {
	const serialize = useCallback(() => {
		const params: Record<string, string> = {}

		for (const st of statuses) {
			params[st.id] = `${st.level}.${DIR_SHORT[st.direction]}`
		}

		if (customTitle) params.t = customTitle
		if (locale !== "en") params.l = locale

		return params
	}, [statuses, customTitle, locale])

	const { flush, buildUrl } = useUrlParams(
		serialize,
		[statuses, customTitle, locale],
	)

	return { flushUrlSync: flush, getShareUrl: buildUrl }
}
