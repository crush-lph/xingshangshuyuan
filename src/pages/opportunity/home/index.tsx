import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import {
  ActionBar,
  EmptyState,
  ItemList,
  SectionCard,
  StatGrid,
  type ListItem,
  type StatItem
} from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getOpportunities, getOpportunityStats, getUserApplications } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function OpportunityHomePage() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [applicationItems, setApplicationItems] = useState<ListItem[]>([])
  const [types, setTypes] = useState<string[]>([])

  useEffect(() => {
    async function loadOpportunityData() {
      const [statsResult, listResult, applicationsResult] = await Promise.allSettled([
        getOpportunityStats(),
        getOpportunities({ page: 1, page_size: 6 }),
        getUserApplications({ page: 1, page_size: 3 })
      ])

      if (statsResult.status === 'fulfilled') {
        const data = statsResult.value.data
        setStats(
          [
            { label: '撮合数量', value: data.total_match_count, tone: 'brand' as const },
            { label: '交易规模', value: data.total_revenue, tone: 'success' as const },
            { label: '满意度', value: data.satisfaction_rate, tone: 'gold' as const }
          ]
            .filter((item) => textOf(item.value))
            .map((item) => ({ ...item, value: textOrPlaceholder(item.value) }))
        )
      }

      if (listResult.status === 'fulfilled') {
        const opportunities = listResult.value.data.list ?? []
        setTypes(Array.from(new Set(opportunities.map((item) => textOf(item.type_text)).filter(Boolean) as string[])))
        setItems(
          opportunities.map((item) => ({
            title: textOrPlaceholder(item.title, '未命名商机'),
            desc: compactJoin([item.type_text, item.city, item.tags?.join('/')]) || '接口未返回商机摘要',
            meta: `${item.apply_count ?? 0} 人申请`,
            tag: item.is_confidential ? '保密' : textOf(item.type_text),
            path: routes.opportunityDetail,
            query: item.id ? { opportunity_id: item.id } : undefined,
            action: '详情'
          }))
        )
      }

      if (applicationsResult.status === 'fulfilled') {
        setApplicationItems(
          (applicationsResult.value.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.opportunity_title, '未命名申请'),
            desc: compactJoin([item.type_text, item.city]) || '接口未返回申请摘要',
            meta: textOrPlaceholder(item.created_at),
            tag: textOf(item.status_text),
            path: routes.opportunityDetail,
            query: item.opportunity_id ? { opportunity_id: item.opportunity_id } : undefined,
            action: '查看'
          }))
        )
      }
    }

    void loadOpportunityData()
  }, [])

  return (
    <PageShell title="商机" subtitle="财税公司甩单、接单、跨区域协作与高端项目撮合。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <Text className="block text-base font-bold text-white">商机对接</Text>
          <Text className="mt-2 block text-sm leading-5 text-white/65">商机数据直接来自 Apifox mock 接口。</Text>
        </View>

        {stats.length ? (
          <StatGrid items={stats} />
        ) : (
          <EmptyState title="暂无商机统计" desc="Apifox mock 未返回商机看板数据。" />
        )}

        <ActionBar
          actions={[
            { label: '发布商机', path: routes.opportunityPublish },
            { label: '我的申请', variant: 'outline', path: routes.userReviews }
          ]}
        />

        <SectionCard title="商机类型">
          {types.length ? (
            <View className="flex flex-wrap gap-2">
              {types.map((item) => (
                <View key={item} className="rounded-full bg-brand-soft px-3 py-2">
                  <Text className="text-xs font-semibold text-brand">{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="暂无商机类型" desc="商机列表没有返回类型数据。" />
          )}
        </SectionCard>

        {items.length ? (
          <ItemList items={items} />
        ) : (
          <EmptyState title="暂无商机" desc="Apifox mock 未返回商机列表数据。" />
        )}

        {applicationItems.length ? (
          <SectionCard title="我的申请">
            <ItemList items={applicationItems} />
          </SectionCard>
        ) : null}
      </View>
    </PageShell>
  )
}
