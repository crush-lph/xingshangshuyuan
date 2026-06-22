import { useEffect, useMemo, useState } from 'react'
import { Input, Text, View } from '@tarojs/components'
import { EmptyState, ItemList, SectionCard, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getProductCategories, getProducts, getSearchSuggest } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface ResourceItem extends ListItem {
  category: string
}

export default function ResourceListPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(['全部'])
  const [activeFilter, setActiveFilter] = useState('全部')
  const [resources, setResources] = useState<ResourceItem[]>([])

  useEffect(() => {
    async function loadResources() {
      const [categoriesResult, productsResult] = await Promise.allSettled([
        getProductCategories(),
        getProducts({ page: 1, page_size: 20 })
      ])

      if (categoriesResult.status === 'fulfilled') {
        setFilters([
          '全部',
          ...Array.from(
            new Set(
              (categoriesResult.value.data.list ?? []).map((item) => textOf(item.name)).filter(Boolean) as string[]
            )
          )
        ])
      }

      if (productsResult.status === 'fulfilled') {
        setResources(
          (productsResult.value.data.list ?? []).map((item) => {
            const category = textOrPlaceholder(item.product_type_text, '未分类')

            return {
              title: textOrPlaceholder(item.name, '未命名资源'),
              desc: textOrPlaceholder(item.description, '接口未返回资源描述'),
              price: priceOf(item.vip_price ?? item.price, item.price_unit),
              tag: category,
              meta: compactJoin([item.sales_count ? `${item.sales_count}人购买` : '', item.price_unit]),
              category,
              path: routes.resourceStandardDetail,
              query: item.id ? { product_id: item.id } : undefined,
              action: '查看'
            }
          })
        )
      }
    }

    void loadResources()
  }, [])

  useEffect(() => {
    const keyword = query.trim()

    if (!keyword) {
      return
    }

    void getSearchSuggest({ keyword }).catch(() => undefined)
  }, [query])

  const visibleResources = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    return resources.filter((item) => {
      const matchesFilter = activeFilter === '全部' || item.category === activeFilter
      const searchableText = [item.title, item.desc, item.meta, item.tag, item.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesKeyword = !keyword || searchableText.includes(keyword)

      return matchesFilter && matchesKeyword
    })
  }, [activeFilter, query, resources])

  return (
    <PageShell title="资源列表" subtitle="按业务场景筛选供应商、工具和标准化服务。">
      <View className="grid gap-3">
        <View className="rounded-full bg-white px-4 py-3 shadow-soft">
          <Input
            value={query}
            placeholder="搜索资源名称、分类或描述"
            className="text-sm"
            onInput={(event) => setQuery(event.detail.value)}
          />
        </View>

        <SectionCard>
          <View className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <View
                key={item}
                className={`rounded-full px-3 py-2 ${activeFilter === item ? 'bg-brand' : 'border border-line bg-white'}`}
                onClick={() => setActiveFilter(item)}
              >
                <Text className={`text-xs font-semibold ${activeFilter === item ? 'text-white' : 'text-muted'}`}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {visibleResources.length ? (
          <ItemList items={visibleResources} />
        ) : (
          <EmptyState title="暂无资源" desc="当前接口或筛选条件没有返回可展示资源。" />
        )}
      </View>
    </PageShell>
  )
}
