import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom', // Matches your current config
  transform: {
    '^.+\\.(t|j)sx?$': [
      'babel-jest',
      {
        presets: ['next/babel'],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/(nanoid|uuidv7)@|(nanoid|uuidv7)/))',
  ],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/apps/app/$1',
    '@valguide/core/(.*)': '<rootDir>/packages/core/$1',
    '@valguide/features/(.*)': '<rootDir>/packages/core/features/$1',
    '@valguide/ui/(.*)': '<rootDir>/packages/core/ui/$1',
    '@valguide/i18n/(.*)': '<rootDir>/packages/core/i18n/$1',
    '@valguide/logger': '<rootDir>/packages/logger/index.ts',
    '@valguide/logger/(.*)': '<rootDir>/packages/logger/src/$1',
    '@valguide/icons/(.*)': '<rootDir>/packages/icons/dist/$1',
  },
}

export default config
