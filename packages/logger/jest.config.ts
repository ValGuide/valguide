import baseConfig from '../../jest.config'

const config = {
  ...baseConfig,
  rootDir: `${__dirname}/../../`,
  displayName: 'logger',
}

export default config
