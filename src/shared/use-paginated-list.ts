import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'

export interface PageQuery {
  page: number
  page_size: number
}

interface PaginationMeta {
  total?: number
  totalPage?: number
}

export interface PaginatedData<TRecord> {
  list?: TRecord[]
  total?: number
  total_page?: number
}

export interface PaginatedResponse<TRecord> {
  data: TRecord[] | PaginatedData<TRecord>
}

interface UsePaginatedListOptions<TRecord, TItem> {
  pageSize?: number
  deps: DependencyList
  fetchPage: (query: PageQuery) => Promise<PaginatedResponse<TRecord>>
  mapItems: (records: TRecord[]) => TItem[]
  enablePullDownRefresh?: boolean
}

function getRecords<TRecord>(response: PaginatedResponse<TRecord>) {
  return Array.isArray(response.data) ? response.data : (response.data.list ?? [])
}

function getMeta<TRecord>(response: PaginatedResponse<TRecord>): PaginationMeta {
  if (Array.isArray(response.data)) {
    return {}
  }

  return {
    total: response.data.total,
    totalPage: response.data.total_page
  }
}

function resolveHasMore(recordCount: number, page: number, pageSize: number, meta: PaginationMeta) {
  if (meta.totalPage !== undefined) {
    return page < meta.totalPage
  }

  if (meta.total !== undefined) {
    return page * pageSize < meta.total
  }

  return recordCount >= pageSize
}

export function usePaginatedList<TRecord, TItem>({
  deps,
  enablePullDownRefresh = true,
  fetchPage,
  mapItems,
  pageSize = 20
}: UsePaginatedListOptions<TRecord, TItem>) {
  const [items, setItems] = useState<TItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const requestIdRef = useRef(0)
  const isLoadingRef = useRef(false)
  const isLoadingMoreRef = useRef(false)
  const hasMoreRef = useRef(false)
  const pageRef = useRef(1)

  const loadPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append' = 'replace') => {
      if (mode === 'append' && (isLoadingRef.current || isLoadingMoreRef.current || !hasMoreRef.current)) {
        return
      }

      const currentRequestId = requestIdRef.current + 1
      requestIdRef.current = currentRequestId

      if (mode === 'append') {
        isLoadingMoreRef.current = true
        setIsLoadingMore(true)
      } else {
        isLoadingRef.current = true
        hasMoreRef.current = false
        setHasMore(false)
        setIsLoading(true)
      }
      setHasError(false)

      try {
        const response = await fetchPage({ page: nextPage, page_size: pageSize })

        if (requestIdRef.current !== currentRequestId) {
          return
        }

        const records = getRecords(response)
        const mappedItems = mapItems(records)
        const nextHasMore = resolveHasMore(records.length, nextPage, pageSize, getMeta(response))

        setItems((current) => (mode === 'append' ? [...current, ...mappedItems] : mappedItems))
        pageRef.current = nextPage
        setHasMore(nextHasMore)
        hasMoreRef.current = nextHasMore
      } catch {
        if (requestIdRef.current !== currentRequestId) {
          return
        }

        if (mode === 'append') {
          Taro.showToast({ title: '加载更多失败，请稍后重试', icon: 'none' })
        } else {
          setItems([])
          setHasError(true)
          setHasMore(false)
          hasMoreRef.current = false
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
          setIsLoadingMore(false)
          isLoadingRef.current = false
          isLoadingMoreRef.current = false
        }
      }
    },
    [fetchPage, mapItems, pageSize]
  )

  const refresh = useCallback(async () => {
    await loadPage(1, 'replace')
  }, [loadPage])

  const loadMore = useCallback(async () => {
    await loadPage(pageRef.current + 1, 'append')
  }, [loadPage])

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh()
    }, 0)

    return () => clearTimeout(timer)
    // The caller owns the query dependency list, similar to useEffect deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useReachBottom(() => {
    void loadMore()
  })

  usePullDownRefresh(() => {
    if (!enablePullDownRefresh) {
      Taro.stopPullDownRefresh()
      return
    }

    void refresh().finally(() => Taro.stopPullDownRefresh())
  })

  return {
    hasError,
    hasMore,
    isLoading,
    isLoadingMore,
    items,
    loadMore,
    refresh,
    setItems
  }
}
