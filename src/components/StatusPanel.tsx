import { StatusBar } from "./StatusBar"
import type { StatusEntry, CategoryId } from "./useStatusStore"
import type { TranslationKey } from "#/hooks/useLocale"

export function StatusPanel({
	statuses,
	t,
	onLevelChange,
	onDirectionCycle,
}: {
	statuses: StatusEntry[]
	t: (key: TranslationKey) => string
	onLevelChange: (id: CategoryId, level: number) => void
	onDirectionCycle: (id: CategoryId) => void
}) {
	return (
		<div className="grid grid-cols-2 gap-x-4 gap-y-3">
			{statuses.map((entry) => (
				<StatusBar
					key={entry.id}
					entry={entry}
					label={t(entry.id)}
					onLevelChange={onLevelChange}
					onDirectionCycle={onDirectionCycle}
				/>
			))}
		</div>
	)
}
