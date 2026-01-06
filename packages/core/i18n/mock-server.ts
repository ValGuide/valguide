import type { TranslationFunction, RichTranslationValues } from './mock'
import type { ReactNode } from 'react'

export async function getTranslations(
	_namespaceOrOptions?: string | { locale?: string; namespace?: string }
): Promise<TranslationFunction> {
	const t = (key: string, _values?: Record<string, unknown>) => key
	t.rich = (key: string, _values?: RichTranslationValues): ReactNode => key
	return t as TranslationFunction
}

export function setRequestLocale(_locale: string): void {
	// no-op
}

type RequestConfigParams = {
	requestLocale: Promise<string | undefined>
}

export function getRequestConfig(
	callback: (params: RequestConfigParams) => Promise<{
		locale: string
		messages: Record<string, unknown>
		timeZone?: string
	}>
) {
	return callback
}
