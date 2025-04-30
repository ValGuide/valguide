import baseConfig from '../jest.config'

const config = {
  ...baseConfig,
  rootDir: `${__dirname}/../../`,
  displayName: 'supabase',
}

export default config
