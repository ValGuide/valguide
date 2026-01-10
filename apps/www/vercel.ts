import { posthogRewrites } from '@valguide/core/posthog/rewrites'
import type { VercelConfig } from '@vercel/config/v1/types'

const config: VercelConfig = {
  rewrites: [...posthogRewrites],
}

export default config
