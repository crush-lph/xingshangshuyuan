import { useEffect, useState } from 'react'
import { Input, ScrollView, Text, View } from '@tarojs/components'
import { ItemList, ListLoadMore, SectionCard, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts } from '@/services'
import { routes } from '@/shared/router'
import { useDebouncedValue } from '@/shared/use-debounced-value'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { compactJoin, getPageParam, priceOf, textOrPlaceholder } from '@/shared/view-data'

interface ResourceItem extends ListItem {
  category: string
  categoryId?: number
}

type ResourceRecord = NonNullable<Awaited<ReturnType<typeof getProducts>>['data']['list']>[number]

interface ResourceFilter {
  label: string
  categoryId?: number
}

function getResourceFilterChipId(categoryId?: number) {
  return `resource-filter-${categoryId ?? 'all'}`
}

function mapResourceItems(list: ResourceRecord[]): ResourceItem[] {
  return list.map((item) => {
    const category = textOrPlaceholder(item.product_type_text, '未分类')
    const price = priceOf(item.vip_price ?? item.price, item.price_unit)

    return {
      title: textOrPlaceholder(item.name, '未命名资源'),
      desc: textOrPlaceholder(item.description, '接口未返回资源描述'),
      tag: category,
      icon: 'archive-line',
      tone: item.vip_price ? 'gold' : 'tech',
      meta: compactJoin([item.sales_count ? `${item.sales_count}人购买` : '']),
      price,
      category,
      categoryId: item.category_id,
      path: routes.resourceStandardDetail,
      query: item.id ? { product_id: item.id } : undefined,
      action: '查看'
    }
  })
}

export default function ResourceListPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query)
  const [filters, setFilters] = useState<ResourceFilter[]>([{ label: '全部' }])
  const [activeCategoryId, setActiveCategoryId] = useState<string | number | undefined>(() =>
    getPageParam('category_id')
  )
  const {
    hasError,
    hasMore,
    isLoading,
    isLoadingMore,
    items: resources
  } = usePaginatedList<ResourceRecord, ResourceItem>({
    deps: [activeCategoryId, debouncedQuery],
    fetchPage: ({ page, page_size }) =>
      getProducts({
        ...(activeCategoryId !== undefined ? { category_id: activeCategoryId } : {}),
        ...(debouncedQuery.trim() ? { keyword: debouncedQuery.trim() } : {}),
        page,
        page_size
      }),
    mapItems: mapResourceItems
  })

  useEffect(() => {
    async function loadCategories() {
      const response = await getProductCategories()
      const pageCategoryId = getPageParam('category_id')
      const categories = response.data.list ?? []

      setFilters([
        { label: '全部' },
        ...categories.map((item) => ({
          label: textOrPlaceholder(item.name, '未命名分类'),
          categoryId: item.id
        }))
      ])

      if (pageCategoryId) {
        const activeCategory = categories.find((item) => String(item.id) === String(pageCategoryId))

        if (activeCategory) {
          setActiveCategoryId(activeCategory.id)
        }
      }
    }

    void loadCategories().catch(() => undefined)
  }, [])

  function handleFilterChange(item: ResourceFilter) {
    if (String(activeCategoryId ?? '') === String(item.categoryId ?? '')) {
      return
    }

    setActiveCategoryId(item.categoryId)
  }

  return (
    <PageShell title="资源列表" subtitle="按业务场景筛选供应商、工具和标准化服务。">
      <View className="grid max-w-full gap-3 overflow-hidden">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            <View className="max-w-full overflow-hidden rounded-full bg-white px-4 py-3 shadow-soft">
              <Input
                value={query}
                placeholder="搜索资源名称、分类或描述"
                className="text-sm"
                onInput={(event) => setQuery(event.detail.value)}
              />
            </View>

            <SectionCard>
              <ScrollView scrollX enhanced showScrollbar={false} className="w-full max-w-full overflow-hidden">
                <View className="inline-flex gap-2 px-1">
                  {filters.map((item) => {
                    const isActive = String(activeCategoryId ?? '') === String(item.categoryId ?? '')

                    return (
                      <View
                        id={getResourceFilterChipId(item.categoryId)}
                        key={item.label}
                        className={`shrink-0 rounded-full border px-4 py-2 ${
                          isActive ? 'border-brand bg-brand' : 'border-transparent bg-brand-soft'
                        }`}
                        onClick={() => handleFilterChange(item)}
                      >
                        <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-brand'}`}>
                          {item.label}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </ScrollView>
            </SectionCard>

            {resources.length ? (
              <>
                <ItemList items={resources} />
                <ListLoadMore hasItems={resources.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
              </>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无资源', desc: '当前接口或筛选条件没有返回可展示资源。' }} />
            )}
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
