'use client'

import type { ReactNode } from 'react'

export type RichTranslationValues = Record<
	string,
	((chunks: ReactNode) => ReactNode) | string | number | boolean | Date | null | undefined
>

export interface TranslationFunction {
	(key: string, values?: Record<string, unknown>): string
	rich(key: string, values?: RichTranslationValues): ReactNode
}

export function useTranslations(_namespace?: string): TranslationFunction {
	const t = (key: string, _values?: Record<string, unknown>) => key
	t.rich = (key: string, _values?: RichTranslationValues): ReactNode => key
	return t as TranslationFunction
}

export function useLocale(): string {
	return 'en'
}
