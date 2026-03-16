import { useRef, useEffect, useState } from "react"

export function EditableTitle({
	defaultTitle,
	customTitle,
	onTitleChange,
}: {
	defaultTitle: string
	customTitle: string | null
	onTitleChange: (title: string | null) => void
}) {
	const [editing, setEditing] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const title = customTitle ?? defaultTitle

	useEffect(() => {
		if (editing) inputRef.current?.focus()
	}, [editing])

	const commit = (value: string) => {
		const trimmed = value.trim()
		onTitleChange(trimmed === "" ? null : trimmed)
		setEditing(false)
	}

	if (editing) {
		return (
			<input
				ref={inputRef}
				value={title}
				onChange={(e) => onTitleChange(e.target.value)}
				onBlur={() => commit(title)}
				onKeyDown={(e) => {
					if (e.key === "Enter") commit(title)
				}}
				className="text-base font-bold text-text-primary tracking-tight bg-transparent border-b border-accent outline-none w-full"
				maxLength={40}
			/>
		)
	}

	return (
		<button
			type="button"
			onClick={() => setEditing(true)}
			className="text-base font-bold text-text-primary tracking-tight text-left cursor-text border-b border-transparent hover:border-text-hint transition-colors"
		>
			{title}
		</button>
	)
}
