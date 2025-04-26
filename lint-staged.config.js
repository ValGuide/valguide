module.exports = {
  // '**/*.ts?(x)': 'tsc --noEmit',

  // NOTICE: patterns are the same, but in different order, to fix
  // https://github.com/lint-staged/lint-staged/issues/934
  '*.{html,js,jsx,ts,tsx}': 'prettier --write',
  '*.{js,jsx,ts,tsx}': 'pnpm dlx madge --circular',
  '*.{js,jsx,tsx,ts}': 'pnpm dlx lint',
  // '*.{js,jsx,ts,tsx,html}': 'eslint',
}
