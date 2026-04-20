import type { KeyValueStore } from '../../platform/kv/key-value-store'
import { getRequiredKeyValueStore } from '../../platform/kv/key-value-store.server'
import type { EnableMaintenanceInput, MaintenanceApp, MaintenanceState, MaintenanceStatus } from './types'

const MAINTENANCE_KEY_PREFIX = 'ops:maintenance:'

function getMaintenanceStore(): KeyValueStore {
  return getRequiredKeyValueStore('MAINTENANCE', { logPrefix: '[maintenance-kv]' })
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function parseMaintenanceState(raw: unknown): MaintenanceState | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  if (record.enabled !== true) return null

  const enabledAt = toNullableString(record.enabledAt)
  if (!enabledAt) return null

  return {
    enabled: true,
    message: toNullableString(record.message),
    eta: toNullableString(record.eta),
    enabledAt,
    enabledBy: toNullableString(record.enabledBy),
  }
}

function buildDisabledStatus(app: MaintenanceApp): MaintenanceStatus {
  return {
    app,
    enabled: false,
    message: null,
    eta: null,
    enabledAt: null,
    enabledBy: null,
  }
}

function normalizeOptionalValue(value?: string | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function getMaintenanceKey(app: MaintenanceApp): string {
  return `${MAINTENANCE_KEY_PREFIX}${app}`
}

export async function getMaintenanceState(app: MaintenanceApp): Promise<MaintenanceState | null> {
  const store = getMaintenanceStore()
  const raw = await store.getJson(getMaintenanceKey(app))
  return parseMaintenanceState(raw)
}

export async function getMaintenanceStatus(app: MaintenanceApp): Promise<MaintenanceStatus> {
  const state = await getMaintenanceState(app)
  if (!state) {
    return buildDisabledStatus(app)
  }

  return {
    app,
    enabled: true,
    message: state.message,
    eta: state.eta,
    enabledAt: state.enabledAt,
    enabledBy: state.enabledBy,
  }
}

export async function getMaintenanceStatusForApps(
  apps: readonly MaintenanceApp[],
): Promise<Record<MaintenanceApp, MaintenanceStatus>> {
  const statuses = await Promise.all(apps.map((app) => getMaintenanceStatus(app)))

  return statuses.reduce<Record<MaintenanceApp, MaintenanceStatus>>(
    (acc, status) => {
      acc[status.app] = status
      return acc
    },
    {
      studio: buildDisabledStatus('studio'),
      app: buildDisabledStatus('app'),
    },
  )
}

export async function enableMaintenance(
  app: MaintenanceApp,
  input: EnableMaintenanceInput = {},
): Promise<MaintenanceStatus> {
  const store = getMaintenanceStore()

  const state: MaintenanceState = {
    enabled: true,
    message: normalizeOptionalValue(input.message),
    eta: normalizeOptionalValue(input.eta),
    enabledAt: new Date().toISOString(),
    enabledBy: normalizeOptionalValue(input.enabledBy),
  }

  await store.setJson(getMaintenanceKey(app), state)

  return {
    app,
    enabled: true,
    message: state.message,
    eta: state.eta,
    enabledAt: state.enabledAt,
    enabledBy: state.enabledBy,
  }
}

export async function disableMaintenance(app: MaintenanceApp): Promise<MaintenanceStatus> {
  const store = getMaintenanceStore()
  await store.delete(getMaintenanceKey(app))
  return buildDisabledStatus(app)
}
