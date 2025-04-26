import baseConfig from '../../jest.config'

const config = {
  ...baseConfig,
  rootDir: `${__dirname}/../../`,
  displayName: 'ui',
}

export default config
