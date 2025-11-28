module.exports = {
  '*.{html,js,jsx,ts,tsx,json}': 'biome check --write --no-errors-on-unmatched',
  '*.{js,jsx,ts,tsx}': 'pnpm dlx madge --circular',
}
