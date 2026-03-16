import { useState, useCallback, useEffect, useRef } from "react"
import { EditableTitle } from "./EditableTitle"
import { Plumbob } from "./Plumbob"
import { SettingsModal } from "./SettingsModal"
import { StatusPanel } from "./StatusPanel"
import {
	useStatusStore,
	DEFAULT_STATUSES,
	type StatusEntry,
	type Direction,
} from "./useStatusStore"
import { t, getDateLocale, type Locale, LOCALES } from "#/hooks/useLocale"

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

function parseStateFromURL(): {
	statuses?: StatusEntry[]
	title?: string
	locale?: Locale
} {
	const params = new URLSearchParams(window.location.search)
	const result: { statuses?: StatusEntry[]; title?: string; locale?: Locale } = {}

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

export function SimsCard() {
	const [urlState] = useState(parseStateFromURL)
	const { statuses, setLevel, cycleDirection } = useStatusStore(urlState.statuses)
	const [locale, setLocale] = useState<Locale>(urlState.locale ?? "en")
	const [settingsOpen, setSettingsOpen] = useState(false)
	const [customTitle, setCustomTitle] = useState<string | null>(urlState.title ?? null)
	const [copied, setCopied] = useState(false)

	const dateLocale = getDateLocale(locale)
	const today = new Date().toLocaleDateString(dateLocale, {
		month: "short",
		day: "numeric",
		year: "numeric",
	})

	// Keep URL in sync with current state (debounced to avoid browser rate limit)
	const replaceTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
	useEffect(() => {
		if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current)
		replaceTimerRef.current = setTimeout(() => {
			const url = encodeStateToURL(statuses, customTitle, locale)
			window.history.replaceState(null, "", url)
		}, 150)
		return () => {
			if (replaceTimerRef.current) clearTimeout(replaceTimerRef.current)
		}
	}, [statuses, customTitle, locale])

	const handleShare = useCallback(() => {
		const url = encodeStateToURL(statuses, customTitle, locale)
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [statuses, customTitle, locale])

	return (
		<div className="w-full max-w-sm mx-auto">
			<div className="relative rounded-2xl bg-surface-card border border-border-subtle shadow-2xl shadow-accent-shadow overflow-hidden backdrop-blur-sm">
				<div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-border-subtle">
					<Plumbob />
					<div className="flex-1 min-w-0">
						<EditableTitle
							defaultTitle={t(locale, "defaultTitle")}
							customTitle={customTitle}
							onTitleChange={setCustomTitle}
						/>
						<p className="text-[11px] text-text-hint">{today} · sims.voila.dev</p>
					</div>
					<button
						onClick={handleShare}
						className="text-text-hint hover:text-text-muted transition-colors cursor-pointer p-1"
						title="Share"
					>
						{copied ? (
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						) : (
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
								<polyline points="16 6 12 2 8 6" />
								<line x1="12" y1="2" x2="12" y2="15" />
							</svg>
						)}
					</button>
					<button
						onClick={() => setSettingsOpen(true)}
						className="text-text-hint hover:text-text-muted transition-colors cursor-pointer p-1"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="3" />
							<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
						</svg>
					</button>
				</div>

				<div className="p-4">
					<StatusPanel
						statuses={statuses}
						t={(key) => t(locale, key)}
						onLevelChange={setLevel}
						onDirectionCycle={cycleDirection}
					/>
				</div>

				<SettingsModal
					open={settingsOpen}
					locale={locale}
					onLocaleChange={setLocale}
					onClose={() => setSettingsOpen(false)}
				/>
			</div>
		</div>
	)
}
