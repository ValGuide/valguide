import baseConfig from '../../jest.config'

const config = {
  ...baseConfig,
  rootDir: `${__dirname}/../../`,
  displayName: 'transactional',
}

export default config
