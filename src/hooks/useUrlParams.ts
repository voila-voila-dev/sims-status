import { useCallback, useEffect, useRef } from "react"

/**
 * Generic hook for deferred URL param syncing via history.replaceState().
 *
 * Accepts a serialize function that converts current state into URL search
 * params. URL updates are batched: call flush() to write immediately (e.g. on
 * pointer release), otherwise a fallback debounce writes after `debounceMs`.
 */
export function useUrlParams(
	serialize: () => Record<string, string>,
	deps: readonly unknown[],
	debounceMs = 800,
) {
	const serializeRef = useRef(serialize)
	serializeRef.current = serialize

	const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

	const writeToUrl = useCallback(() => {
		const params = new URLSearchParams(serializeRef.current())
		const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
		window.history.replaceState(null, "", url)
	}, [])

	const flush = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current)
		writeToUrl()
	}, [writeToUrl])

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(writeToUrl, debounceMs)
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps)

	const buildUrl = useCallback(() => {
		const params = new URLSearchParams(serializeRef.current())
		return `${window.location.origin}${window.location.pathname}?${params.toString()}`
	}, [])

	return { flush, buildUrl }
}

/** Read a single param from the current URL. */
export function getParam(key: string): string | null {
	return new URLSearchParams(window.location.search).get(key)
}

/** Read all current URL search params. */
export function getParams(): URLSearchParams {
	return new URLSearchParams(window.location.search)
}
