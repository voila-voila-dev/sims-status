import { createFileRoute } from "@tanstack/react-router"
import { SimsCard } from "#/components/SimsCard"

export const Route = createFileRoute("/")({ component: App })

function App() {
	return (
		<main className="min-h-dvh bg-surface flex items-center justify-center p-4">
			<SimsCard />
		</main>
	)
}
