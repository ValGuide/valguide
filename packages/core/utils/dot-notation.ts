import type { Dictionary, FlatDictionary } from './types'

export const convertToDotNotation = (json: Dictionary, parentKey = ''): FlatDictionary => {
  const result: FlatDictionary = {}
  for (const key of Object.keys(json)) {
    const combinedKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof json[key] === 'object') {
      Object.assign(result, convertToDotNotation(json[key] as Dictionary, combinedKey))
    } else {
      result[combinedKey] = json[key] as string
    }
  }
  return result
}

export const revertFromDotNotation = (dotNotationObject: FlatDictionary): Dictionary => {
  const result: Dictionary = {}
  for (const [key, value] of Object.entries(dotNotationObject)) {
    const keys = key.split('.')
    const isArray = keys.some((k) => !Number.isNaN(Number(k)))
    let temp: Record<string, unknown> = result
    for (let index = 0; index < keys.length; index++) {
      const innerKey = keys[index]
      if (index === keys.length - 1) {
        temp[innerKey] = value
      } else {
        if (!temp[innerKey]) {
          temp[innerKey] = isArray ? [] : {}
        }
        temp = temp[innerKey] as Record<string, unknown>
      }
    }
  }
  return result
}
