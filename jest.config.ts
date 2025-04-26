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
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/apps/web/$1',
    'demo/core/(.*)': '<rootDir>/packages/core/src/$1',
    'demo/logger': '<rootDir>/packages/logger/index.ts',
    'demo/logger/(.*)': '<rootDir>/packages/logger/src/$1',
    'demo/icons/(.*)': '<rootDir>/packages/icons/dist/$1',
    'demo/ui/(.*)': '<rootDir>/packages/ui/src/$1',
  },
}

export default config
