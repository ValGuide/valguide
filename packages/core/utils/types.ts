export type Nullable<T> = { [K in keyof T]: T[K] | null }

export type Nullish<T> = Nullable<Partial<T>>

export type PartialRecord<K extends PropertyKey, T> = {
  [P in K]?: T
}

export type DictionaryValues = Record<string, string>

export type PropsWithLocale<P = unknown> = {
  locale: string
} & P

export type PageParamsWithLocale<P = unknown> = {
  params: Promise<{ locale: string }>
} & P

export type PropsWithTranslator<P = unknown> = Translators & {
  locale: string
} & P

export type Dictionary<T = string | string[]> = {
  [field: string]: T | Dictionary<T>
}
export type FlatDictionary<T = string> = Record<string, T>
export type Translator = (key: string, options?: DictionaryValues) => string
export type ArrayTranslator = (key: string, options?: DictionaryValues) => string[]
export type ScopedTranslator = (scope: string) => Translator
export type Translators = {
  t: Translator
  scoped: ScopedTranslator
  array: ArrayTranslator
}

export type StringifyValues<T> = {
  [K in keyof T]: undefined extends T[K] ? string | undefined : string
}
