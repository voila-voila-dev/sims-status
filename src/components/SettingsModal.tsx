import { useEffect, useRef } from "react"
import { LOCALES, LOCALE_LABELS, type Locale } from "#/hooks/useLocale"

const LOCALE_NAMES: Record<Locale, string> = {
	en: "English",
	fr: "Français",
	de: "Deutsch",
	es: "Español",
}

export function SettingsModal({
	open,
	locale,
	onLocaleChange,
	onClose,
}: {
	open: boolean
	locale: Locale
	onLocaleChange: (locale: Locale) => void
	onClose: () => void
}) {
	const overlayRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", handleKey)
		return () => window.removeEventListener("keydown", handleKey)
	}, [open, onClose])

	if (!open) return null

	return (
		<div
			ref={overlayRef}
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose()
			}}
			className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl"
		>
			<div className="bg-surface-card border border-border-subtle rounded-xl p-4 w-56 shadow-xl">
				<div className="flex items-center justify-between mb-3">
					<span className="text-xs font-semibold text-text-primary tracking-wide uppercase">
						Language
					</span>
					<button
						onClick={onClose}
						className="text-text-hint hover:text-text-muted transition-colors cursor-pointer text-sm leading-none"
					>
						✕
					</button>
				</div>
				<div className="flex flex-col gap-1">
					{LOCALES.map((loc) => (
						<button
							key={loc}
							onClick={() => {
								onLocaleChange(loc)
								onClose()
							}}
							className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
								loc === locale
									? "bg-surface-btn text-text-primary"
									: "text-text-muted hover:bg-surface-btn hover:text-text-primary"
							}`}
						>
							<span className="font-medium w-5">{LOCALE_LABELS[loc]}</span>
							<span>{LOCALE_NAMES[loc]}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}
