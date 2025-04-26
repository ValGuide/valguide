import baseConfig from '../../jest.config'

const config = {
  ...baseConfig,
  rootDir: `${__dirname}/../../`,
  displayName: 'core',
}

export default config
