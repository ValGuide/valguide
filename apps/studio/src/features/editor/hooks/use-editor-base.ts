import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter, useSearch } from '@tanstack/react-router'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { useCallback, useEffect, useRef, useState } from 'react'

export type FormValueGetter = () => Record<string, unknown>

type FormRegistry = Map<string, { getValues: FormValueGetter; isDirty: boolean }>

const LOCALE_PARAM = 'locale'

function parseLocale(locale: string | undefined, availableLocales: string[]): string {
  if (locale && availableLocales.includes(locale)) {
    return locale
  }
  return availableLocales[0] ?? defaultLocale
}

export interface EntityDetail {
  id: string
  availableLocales: string[]
  existingLocales?: string[]
}

export interface UseEditorBaseOptions {
  nanoId: string
  initialLocale?: string
  /**
   * Override available locales for initial locale validation.
   * When editing a stop in tour context, pass tour's availableLocales here
   * to ensure the initial locale is validated against the tour's locales,
   * not the stop's existing locales.
   */
  availableLocalesOverride?: string[]
  // biome-ignore lint/suspicious/noExplicitAny: Query options return types vary by entity
  detailQueryOptions: (nanoId: string) => any
  // biome-ignore lint/suspicious/noExplicitAny: Query options return types vary by entity
  localeDraftQueryOptions: (nanoId: string, locale: string) => any
  // biome-ignore lint/suspicious/noExplicitAny: Query options return types vary by entity
  localePublishedQueryOptions: (nanoId: string, locale: string) => any
  enablePublishedQuery?: boolean
  prefetchOtherLocales?: boolean
}

export interface EditorBaseResult<TDetail extends EntityDetail, TLocaleDraft, TLocalePublished> {
  nanoId: string
  entityId: string
  detail: TDetail
  activeLocale: string
  availableLocales: string[]
  existingLocales: string[]
  setActiveLocale: (locale: string) => void
  localeDraft: TLocaleDraft | null
  isLoadingLocale: boolean
  localePublished: TLocalePublished | null
  isLoadingLocalePublished: boolean
  isDirty: boolean
  isSaving: boolean
  lastSaved: Date | null
  setIsSaving: (saving: boolean) => void
  setLastSaved: (date: Date | null) => void
  registerFormDirty: (formId: string, formIsDirty: boolean, getValues?: FormValueGetter) => void
  unregisterForm: (formId: string) => void
  registerFormReset: (formId: string, resetFn: () => void) => void
  resetAllForms: () => void
  resetAllFormsAfterSave: () => void
  getFormValues: () => FormRegistry
  queryClient: ReturnType<typeof useQueryClient>
}

export function useEditorBase<TDetail extends EntityDetail, TLocaleDraft, TLocalePublished>({
  nanoId,
  initialLocale,
  availableLocalesOverride,
  detailQueryOptions,
  localeDraftQueryOptions,
  localePublishedQueryOptions,
  enablePublishedQuery = true,
  prefetchOtherLocales = true,
}: UseEditorBaseOptions): EditorBaseResult<TDetail, TLocaleDraft, TLocalePublished> {
  const router = useRouter()
  const searchParams = useSearch({ strict: false })
  const queryClient = useQueryClient()

  const detailQuery = useSuspenseQuery(detailQueryOptions(nanoId))
  const detail = detailQuery.data as TDetail
  const entityId = detail.id
  // Use override if provided (e.g., tour's locales when editing stop in tour context)
  const availableLocales = availableLocalesOverride ?? detail.availableLocales
  const existingLocales = detail.existingLocales ?? detail.availableLocales

  const [activeLocale, setActiveLocaleState] = useState<string>(() => parseLocale(initialLocale, availableLocales))

  useEffect(() => {
    if (initialLocale && availableLocales.includes(initialLocale) && activeLocale !== initialLocale) {
      setActiveLocaleState(initialLocale)
    }
  }, [initialLocale, availableLocales, activeLocale])

  const localeDraftQuery = useQuery({
    ...localeDraftQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId,
  })
  const localeDraft = (localeDraftQuery.data ?? null) as TLocaleDraft | null
  const isLoadingLocale = localeDraftQuery.isLoading

  const localePublishedQuery = useQuery({
    ...localePublishedQueryOptions(nanoId, activeLocale),
    enabled: !!nanoId && enablePublishedQuery,
  })
  const localePublished = (localePublishedQuery.data ?? null) as TLocalePublished | null
  const isLoadingLocalePublished = localePublishedQuery.isLoading

  useEffect(() => {
    if (!nanoId || !prefetchOtherLocales || availableLocales.length <= 1) return

    const otherLocales = availableLocales.filter((l: string) => l !== activeLocale)
    for (const locale of otherLocales) {
      queryClient.prefetchQuery(localeDraftQueryOptions(nanoId, locale))
      if (enablePublishedQuery) {
        queryClient.prefetchQuery(localePublishedQueryOptions(nanoId, locale))
      }
    }
  }, [
    nanoId,
    activeLocale,
    availableLocales,
    enablePublishedQuery,
    prefetchOtherLocales,
    queryClient,
    localeDraftQueryOptions,
    localePublishedQueryOptions,
  ])

  const [dirtyForms, setDirtyForms] = useState<Set<string>>(new Set())
  const formResetFnsRef = useRef<Map<string, () => void>>(new Map())
  const formValueGettersRef = useRef<FormRegistry>(new Map())

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const isDirty = dirtyForms.size > 0

  const setActiveLocale = useCallback(
    (locale: string) => {
      if (!availableLocales.includes(locale)) {
        console.warn(`Locale ${locale} not in available locales`)
        return
      }
      setActiveLocaleState(locale)
      router.navigate({ to: '.', search: { ...searchParams, [LOCALE_PARAM]: locale }, replace: true })
    },
    [router, searchParams, availableLocales],
  )

  const registerFormDirty = useCallback((formId: string, formIsDirty: boolean, getValues?: FormValueGetter) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      if (formIsDirty) next.add(formId)
      else next.delete(formId)
      return next
    })
    if (getValues) {
      formValueGettersRef.current.set(formId, { getValues, isDirty: formIsDirty })
    }
  }, [])

  const unregisterForm = useCallback((formId: string) => {
    setDirtyForms((prev) => {
      const next = new Set(prev)
      next.delete(formId)
      return next
    })
    formResetFnsRef.current.delete(formId)
    formValueGettersRef.current.delete(formId)
  }, [])

  const registerFormReset = useCallback((formId: string, resetFn: () => void) => {
    formResetFnsRef.current.set(formId, resetFn)
  }, [])

  const resetAllForms = useCallback(() => {
    for (const resetFn of formResetFnsRef.current.values()) {
      resetFn()
    }
    setDirtyForms(new Set())
  }, [])

  const resetAllFormsAfterSave = useCallback(() => {
    setDirtyForms(new Set())
    for (const [formId, registration] of formValueGettersRef.current.entries()) {
      formValueGettersRef.current.set(formId, { ...registration, isDirty: false })
    }
  }, [])

  const getFormValues = useCallback(() => formValueGettersRef.current, [])

  return {
    nanoId,
    entityId,
    detail,
    activeLocale,
    availableLocales,
    existingLocales,
    setActiveLocale,
    localeDraft,
    isLoadingLocale,
    localePublished,
    isLoadingLocalePublished,
    isDirty,
    isSaving,
    lastSaved,
    setIsSaving,
    setLastSaved,
    registerFormDirty,
    unregisterForm,
    registerFormReset,
    resetAllForms,
    resetAllFormsAfterSave,
    getFormValues,
    queryClient,
  }
}
