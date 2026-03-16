import { useState, useCallback } from "react"
import { EditableTitle } from "./EditableTitle"
import { Plumbob } from "./Plumbob"
import { SettingsModal } from "./SettingsModal"
import { StatusPanel } from "./StatusPanel"
import { useStatusStore } from "#/hooks/useStatusStore"
import { t, getDateLocale, type Locale } from "#/hooks/useLocale"
import { parseStateFromURL, useUrlSync } from "#/hooks/useUrlSync"

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

	const { flushUrlSync, getShareUrl } = useUrlSync(statuses, customTitle, locale)

	const handleShare = useCallback(() => {
		navigator.clipboard.writeText(getShareUrl()).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}, [getShareUrl])

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
						onInteractionEnd={flushUrlSync}
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
