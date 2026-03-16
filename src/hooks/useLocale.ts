export const LOCALES = ["en", "fr", "de", "es"] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
	en: "EN",
	fr: "FR",
	de: "DE",
	es: "ES",
}

const translations = {
	en: {
		defaultTitle: "My Status",
		bladder: "Bladder",
		fun: "Fun",
		hunger: "Hunger",
		social: "Social",
		energy: "Energy",
		hygiene: "Hygiene",
	},
	fr: {
		defaultTitle: "Mon Statut",
		bladder: "Vessie",
		fun: "Amusement",
		hunger: "Faim",
		social: "Social",
		energy: "Énergie",
		hygiene: "Hygiène",
	},
	de: {
		defaultTitle: "Mein Status",
		bladder: "Blase",
		fun: "Spaß",
		hunger: "Hunger",
		social: "Sozial",
		energy: "Energie",
		hygiene: "Hygiene",
	},
	es: {
		defaultTitle: "Mi Estado",
		bladder: "Vejiga",
		fun: "Diversión",
		hunger: "Hambre",
		social: "Social",
		energy: "Energía",
		hygiene: "Higiene",
	},
} as const satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof (typeof translations)["en"]

export function t(locale: Locale, key: TranslationKey): string {
	return translations[locale][key]
}

export function getDateLocale(locale: Locale): string {
	return { en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES" }[locale]
}
