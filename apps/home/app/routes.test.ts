import { unlocalizedPathname } from '@/routes/routes'

describe('routes', () => {
  const data: { given: string; expected: string }[] = [
    {
      given: '/en',
      expected: '/',
    },
    {
      given: '/en/',
      expected: '/',
    },
    {
      given: '/en/home',
      expected: '/home',
    },
    {
      given: '/de',
      expected: '/',
    },
    {
      given: '/de/',
      expected: '/',
    },
    {
      given: '/de/home',
      expected: '/home',
    },
    {
      given: '/',
      expected: '/',
    },
    {
      given: '/home',
      expected: '/home',
    },
    {
      given: 'https://app.demo.com/en/home',
      expected: '/home',
    },
  ]

  data.forEach(({ given, expected }) => {
    it(`should unlocalize ${given} to ${expected}`, async () => {
      expect(unlocalizedPathname(given)).toEqual(expected)
    })
  })
})
