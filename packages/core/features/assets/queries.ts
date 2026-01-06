import {and, desc, eq} from 'drizzle-orm'
import {db} from '../db'
import {asset, type AssetType, guideAsset, stopAsset} from './schema'

export type GetAssetsFilters = {
    type?: AssetType
    locale?: string
    organizationId?: string
    uploadedBy?: string
}

export async function getAssets(filters?: GetAssetsFilters) {
    const conditions = []

    if (filters?.type) {
        conditions.push(eq(asset.type, filters.type))
    }
    if (filters?.locale) {
        conditions.push(eq(asset.locale, filters.locale))
    }
    if (filters?.organizationId) {
        conditions.push(eq(asset.organizationId, filters.organizationId))
    }
    if (filters?.uploadedBy) {
        conditions.push(eq(asset.uploadedBy, filters.uploadedBy))
    }

    const query = db.select().from(asset)

    if (conditions.length > 0) {
        return query.where(and(...conditions)).orderBy(desc(asset.createdAt));
    }

    return query.orderBy(desc(asset.createdAt));
}

export async function attachAssetToGuide({
                                             guideId,
                                             assetId,
                                             role,
                                             locale,
                                             order = 0,
                                         }: {
    guideId: string
    assetId: string
    role: string
    locale?: string
    order?: number
}) {
    const [result] = await db
        .insert(guideAsset)
        .values({
            guideId,
            assetId,
            role,
            locale: locale || null,
            order,
        })
        .returning()

    return result
}

export async function attachAssetToStop({
                                            stopId,
                                            assetId,
                                            role,
                                            locale,
                                            order = 0,
                                        }: {
    stopId: string
    assetId: string
    role: string
    locale?: string
    order?: number
}) {
    const [result] = await db
        .insert(stopAsset)
        .values({
            stopId,
            assetId,
            role,
            locale: locale || null,
            order,
        })
        .returning()

    return result
}

