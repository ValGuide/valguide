import { convertToDotNotation, revertFromDotNotation } from './dot-notation'
import type { Dictionary, FlatDictionary } from '@/utils/types'

describe('dot-notation', () => {
  const testData: {
    given: FlatDictionary
    expected: Dictionary
  }[] = [
    {
      given: {
        'test.value': 'test value',
        'test.list.0': 'list-value-0',
        'test.list.1': 'list-value-1',
        'test.list.2': 'list-value-2',
      },
      expected: {
        test: {
          value: 'test value',
          list: ['list-value-0', 'list-value-1', 'list-value-2'],
        },
      },
    },
    {
      given: {},
      expected: {},
    },
  ]

  testData.forEach(({ given, expected }) => {
    it('should transform from and to dot notation', () => {
      expect(revertFromDotNotation(given)).toEqual(expected)
      expect(convertToDotNotation(expected)).toEqual(given)
    })
  })
})
