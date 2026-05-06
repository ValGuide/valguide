const reactStartMain = '@tanstack/react-start/server-entry'
const reactStartDeployMain = 'dist/server/index.js'
const reactStartDeployAssets = { directory: 'dist/client' }
const reactStartDeployRules = [{ type: 'ESModule', globs: ['**/*.js', '**/*.mjs'] }]
const euPlacement = { region: 'aws:eu-central-1' }
const observability = { logs: { enabled: true, invocation_logs: true } }

const appSecrets = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'RESEND_SENDING_API_KEY']
const appOptionalSecrets = ['VALBOT_SLACK_TOKEN']

const authVars = [
  { name: 'BETTER_AUTH_URL', required: true },
  { name: 'BETTER_AUTH_TRUSTED_ORIGINS', required: true },
  { name: 'BETTER_AUTH_COOKIE_DOMAIN', required: true },
  { name: 'BETTER_AUTH_COOKIE_PREFIX', required: true },
]

const policyVars = [
  { name: 'VITE_PRIVACY_POLICY_URL', required: true },
  { name: 'VITE_TERMS_OF_SERVICE_URL', required: true },
]

const appCommonVars = [
  { name: 'NODE_ENV', defaultValue: 'production' },
  { name: 'VITE_ENV', fromTargetEnv: true },
  { name: 'USERS_SLACK_CHANNEL', defaultValue: 'users' },
  ...authVars,
]

const sharedKvBindings = [
  { binding: 'AUTH_KV', envVar: 'CF_AUTH_KV_ID' },
  { binding: 'TOUR_DATA', envVar: 'CF_TOUR_DATA_KV_ID' },
  { binding: 'MAINTENANCE', envVar: 'CF_MAINTENANCE_KV_ID' },
]

const r2Bucket = {
  binding: 'R2_BUCKET',
  envVar: 'CF_R2_BUCKET_NAME',
  jurisdictionEnvVar: 'CF_R2_JURISDICTION',
  defaultJurisdiction: 'eu',
}

export const targets = {
  admin: {
    root: 'apps/admin',
    nameEnvVar: 'ADMIN_WORKER_NAME',
    routesEnvVar: 'ADMIN_ROUTES',
    main: reactStartMain,
    compatibilityFlags: ['nodejs_compat'],
    placement: euPlacement,
    observability,
    r2Buckets: [r2Bucket],
    kvNamespaces: sharedKvBindings,
    vars: [
      ...appCommonVars,
      { name: 'MAINTENANCE_SLACK_CHANNEL', defaultValue: 'maintenance' },
      { name: 'STUDIO_EVENTS_SLACK_CHANNEL', defaultValue: 'studio-events' },
      { name: 'ADMIN_AUTH_MODE', optional: true },
      { name: 'ADMIN_COOKIE_DOMAIN', required: true },
      { name: 'ADMIN_BASE_URL', required: true },
      ...policyVars,
    ],
    requiredSecrets: [...appSecrets, 'ADMIN_ALLOWED_EMAILS'],
    optionalSecrets: [...appOptionalSecrets, 'SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET', 'SLACK_TEAM_ID'],
  },
  app: {
    root: 'apps/app',
    nameEnvVar: 'APP_WORKER_NAME',
    routesEnvVar: 'APP_ROUTES',
    main: reactStartMain,
    compatibilityFlags: ['nodejs_compat'],
    placement: euPlacement,
    observability,
    kvNamespaces: sharedKvBindings,
    vars: [
      { name: 'NODE_ENV', defaultValue: 'production' },
      { name: 'USERS_SLACK_CHANNEL', defaultValue: 'users' },
      { name: 'APP_BASE_URL', required: true },
      ...authVars,
      ...policyVars,
    ],
    requiredSecrets: appSecrets,
    optionalSecrets: appOptionalSecrets,
  },
  docs: {
    root: 'apps/docs',
    nameEnvVar: 'DOCS_WORKER_NAME',
    routesEnvVar: 'DOCS_ROUTES',
    main: reactStartDeployMain,
    compatibilityFlags: ['nodejs_compat'],
    rules: reactStartDeployRules,
    placement: euPlacement,
    observability,
    assets: reactStartDeployAssets,
    noBundle: true,
    vars: [
      { name: 'NODE_ENV', defaultValue: 'production' },
      { name: 'BLOCK_ROBOTS', optional: true },
    ],
    requiredSecrets: [],
  },
  links: {
    root: 'apps/links',
    nameEnvVar: 'LINKS_WORKER_NAME',
    routesEnvVar: 'LINKS_ROUTES',
    main: reactStartMain,
    compatibilityFlags: ['nodejs_compat'],
    placement: euPlacement,
    observability,
    kvNamespaces: [{ binding: 'LINKS_KV', envVar: 'CF_LINKS_KV_ID' }],
    vars: [
      { name: 'NODE_ENV', defaultValue: 'production' },
      { name: 'USERS_SLACK_CHANNEL', defaultValue: 'users' },
      { name: 'APP_BASE_URL', required: true },
      ...authVars,
      { name: 'BLOCK_ROBOTS', optional: true },
    ],
    requiredSecrets: appSecrets,
    optionalSecrets: appOptionalSecrets,
  },
  storybook: {
    root: 'apps/storybook',
    nameEnvVar: 'STORYBOOK_WORKER_NAME',
    routesEnvVar: 'STORYBOOK_ROUTES',
    main: 'src/index.ts',
    placement: euPlacement,
    assets: { directory: 'storybook-static', binding: 'ASSETS', run_worker_first: true },
    vars: [
      { name: 'BLOCK_ROBOTS', optional: true },
      { name: 'DEV_PROXY', optional: true },
    ],
    requiredSecrets: [],
  },
  studio: {
    root: 'apps/studio',
    nameEnvVar: 'STUDIO_WORKER_NAME',
    routesEnvVar: 'STUDIO_ROUTES',
    main: reactStartMain,
    compatibilityFlags: ['nodejs_compat'],
    placement: euPlacement,
    observability,
    r2Buckets: [r2Bucket],
    ai: { binding: 'AI' },
    kvNamespaces: sharedKvBindings,
    vars: [
      ...appCommonVars,
      { name: 'LINKS_BASE_URL', required: true },
      { name: 'STUDIO_EVENTS_SLACK_CHANNEL', defaultValue: 'studio-events' },
      { name: 'STUDIO_FEEDBACK_SLACK_CHANNEL', defaultValue: 'studio-feedback' },
      { name: 'STUDIO_PERFORMANCE_LOG_ENABLED', defaultValue: 'false' },
      { name: 'APP_BASE_URL', required: true },
      { name: 'ADMIN_BASE_URL', required: true },
      ...policyVars,
      { name: 'VITE_STUDIO_URL', required: true },
      { name: 'LINEAR_FEEDBACK_TEAM_ID', optional: true },
      { name: 'LINEAR_FEEDBACK_LABEL_ID', optional: true },
      { name: 'BLOCK_ROBOTS', optional: true },
    ],
    requiredSecrets: appSecrets,
    optionalSecrets: [...appOptionalSecrets, 'LINEAR_API_KEY'],
  },
  www: {
    root: 'apps/www',
    nameEnvVar: 'WWW_WORKER_NAME',
    routesEnvVar: 'WWW_ROUTES',
    main: reactStartMain,
    compatibilityFlags: ['nodejs_compat'],
    placement: euPlacement,
    observability,
    kvNamespaces: [{ binding: 'AUTH_KV', envVar: 'CF_AUTH_KV_ID' }],
    vars: [
      { name: 'NODE_ENV', defaultValue: 'production' },
      { name: 'USERS_SLACK_CHANNEL', defaultValue: 'users' },
      { name: 'APP_BASE_URL', required: true },
      ...authVars,
      ...policyVars,
      { name: 'BLOCK_ROBOTS', optional: true },
    ],
    requiredSecrets: appSecrets,
    optionalSecrets: appOptionalSecrets,
  },
  'worker:image-guard': {
    root: 'workers/image-guard',
    nameEnvVar: 'IMAGE_GUARD_WORKER_NAME',
    routesEnvVar: 'IMAGE_GUARD_ROUTES',
    main: 'src/index.ts',
    placement: euPlacement,
    requiredSecrets: [],
  },
  'worker:posthog-proxy': {
    root: 'workers/posthog-proxy',
    nameEnvVar: 'POSTHOG_PROXY_WORKER_NAME',
    routesEnvVar: 'POSTHOG_PROXY_ROUTES',
    main: 'src/index.ts',
    requiredSecrets: [],
  },
}

export const targetAliases = {
  'image-guard': 'worker:image-guard',
  'posthog-proxy': 'worker:posthog-proxy',
}

export function resolveTargetName(name) {
  return targetAliases[name] ?? name
}
