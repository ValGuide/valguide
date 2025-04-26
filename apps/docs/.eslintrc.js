/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@valguide/eslint-config/react.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
}
