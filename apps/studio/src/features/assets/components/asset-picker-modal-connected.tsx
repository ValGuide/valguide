import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAssetsContextOptional } from '../context/assets-context'
import { assetsInfiniteQueryOptions } from '../query-options'
import { AssetPickerModal, type AssetPickerModalProps } from './asset-picker-modal'
import { AssetUploadInlineConnected } from './asset-upload-inline-connected'

type AssetPickerModalConnectedProps = Omit<
  AssetPickerModalProps,
  | 'assets'
  | 'isLoading'
  | 'isFetchingMore'
  | 'hasMore'
  | 'searchQuery'
  | 'onSearchQueryChange'
  | 'onLoadMore'
  | 'onRefetch'
  | 'UploadInline'
>

export function AssetPickerModalConnected({ type, locale, ...props }: AssetPickerModalConnectedProps) {
  const contextValue = useAssetsContextOptional()
  const shouldFetchAssets = !contextValue
  const queryClient = useQueryClient()
  const [searchDraft, setSearchDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchDraft.trim())
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchDraft])

  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    ...assetsInfiniteQueryOptions({
      type,
      search: searchQuery || undefined,
    }),
    enabled: shouldFetchAssets,
    placeholderData: (previousData) => previousData,
  })

  const assets = contextValue?.assets ?? data?.pages.flatMap((page) => page.items) ?? []
  const isLoading = contextValue?.isLoading ?? isPending
  const isFetchingMore = contextValue ? false : isFetchingNextPage
  const hasMore = contextValue ? false : Boolean(hasNextPage)
  const refetch = contextValue?.refetch ?? (() => queryClient.invalidateQueries({ queryKey: ['assets-infinite'] }))

  return (
    <AssetPickerModal
      {...props}
      type={type}
      locale={locale}
      assets={assets}
      isLoading={isLoading}
      isFetchingMore={isFetchingMore}
      hasMore={hasMore}
      searchQuery={searchDraft}
      onSearchQueryChange={setSearchDraft}
      onLoadMore={() => void fetchNextPage()}
      onRefetch={refetch}
      UploadInline={AssetUploadInlineConnected}
    />
  )
}
