import { Dictionary, FlatDictionary } from './types'

export const convertToDotNotation = (json: Dictionary, parentKey = ''): FlatDictionary =>
  Object.keys(json).reduce((result, key) => {
    const combinedKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof json[key] === 'object') {
      return {
        ...result,
        ...convertToDotNotation(json[key] as Dictionary, combinedKey),
      }
    }
    return { ...result, [combinedKey]: json[key] }
  }, {})

export const revertFromDotNotation = (dotNotationObject: FlatDictionary): Dictionary =>
  Object.entries(dotNotationObject).reduce((result, [key, value]) => {
    const keys = key.split('.')
    const isArray = keys.some((k) => !isNaN(Number(k)))
    keys.reduce((temp: any, innerKey, index) => {
      if (index === keys.length - 1) {
        temp[innerKey] = value
      } else {
        if (!temp[innerKey]) {
          temp[innerKey] = isArray ? [] : {}
        }
        return temp[innerKey]
      }
      return temp
    }, result)
    return result
  }, {})
