export type Nullable<T> = { [K in keyof T]: T[K] | null }

export type Nullish<T> = Nullable<Partial<T>>

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T
}
