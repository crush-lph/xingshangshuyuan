import { useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, ListLoadMore, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getOpportunityApplications,
  getUserApplications,
  type GetOpportunityApplicationsData,
  type GetUserApplicationsData
} from '@/services'
import { routes } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { compactJoin, getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

type ApplicationRecord =
  NonNullable<GetUserApplicationsData['list']>[number] | NonNullable<GetOpportunityApplicationsData['list']>[number]

interface ApplicationItem extends ListItem {
  status?: number
}

const applicationTabs = [
  { label: '全部' },
  { label: '待审核', status: 1 },
  { label: '已通过', status: 2 },
  { label: '未通过', status: 0 }
] as const

function getApplicationTone(status?: number): ApplicationItem['tone'] {
  if (status === 2) {
    return 'success'
  }

  if (status === 0) {
    return 'neutral'
  }

  return 'brand'
}

function mapApplication(item: ApplicationRecord): ApplicationItem {
  return {
    title: textOrPlaceholder('opportunity_title' in item ? item.opportunity_title : undefined, '未命名申请'),
    desc: ('type_text' in item ? compactJoin([item.type_text, item.city]) : undefined) || '接口未返回申请摘要',
    meta: textOf(item.created_at),
    tag: textOf(item.status_text),
    icon: 'hand-heart-line',
    tone: getApplicationTone(item.status),
    status: item.status,
    path: 'opportunity_id' in item ? routes.opportunityDetail : undefined,
    query: 'opportunity_id' in item && item.opportunity_id ? { opportunity_id: item.opportunity_id } : undefined,
    action: '查看商机'
  }
}

export default function OpportunityApplicationsPage() {
  const opportunityId = getPageParam('opportunity_id')
  const isOwnerView = Boolean(opportunityId)
  const [activeTab, setActiveTab] = useState<(typeof applicationTabs)[number]['label']>('全部')
  const activeItem = applicationTabs.find((item) => item.label === activeTab)
  const activeStatus = activeItem && 'status' in activeItem ? activeItem.status : undefined
  const { hasError, hasMore, isLoading, isLoadingMore, items } = usePaginatedList<ApplicationRecord, ApplicationItem>({
    deps: [activeTab, opportunityId],
    fetchPage: async ({ page, page_size }) => {
      if (opportunityId) {
        const response = await getOpportunityApplications({ opportunity_id: opportunityId })
        return {
          ...response,
          data: {
            ...response.data,
            // This endpoint has no page parameters and returns the complete owner-side list.
            total_page: 1
          }
        }
      }

      return getUserApplications({
        ...(activeStatus !== undefined ? { status: activeStatus } : {}),
        page,
        page_size
      })
    },
    mapItems: (records: ApplicationRecord[]) =>
      isOwnerView
        ? records.map((item) => ({
            title: textOrPlaceholder(
              'nickname' in item ? (item.nickname ?? item.company_name) : undefined,
              '未命名申请人'
            ),
            desc: textOrPlaceholder('reason' in item ? item.reason : undefined, '申请人未填写接单说明'),
            meta: ('quote_price' in item ? priceOf(item.quote_price) : undefined) ?? textOf(item.created_at),
            tag: textOf(item.status_text),
            icon: 'hand-heart-line',
            tone: getApplicationTone(item.status)
          }))
        : records.map(mapApplication)
  })

  return (
    <PageShell
      title={isOwnerView ? '收到的申请' : '我的申请'}
      subtitle={isOwnerView ? '查看申请方的能力说明与报价。' : '查看接单申请、审核状态和关联商机。'}
    >
      <View className="grid gap-3">
        {!isOwnerView ? (
          <View className="flex gap-2 overflow-x-auto">
            {applicationTabs.map((item) => {
              const isActive = activeTab === item.label

              return (
                <View
                  key={item.label}
                  className={`shrink-0 rounded-full px-4 py-2 ${isActive ? 'bg-brand' : 'border border-line bg-white'}`}
                  onClick={() => setActiveTab(item.label)}
                >
                  <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>
                    {item.label}
                  </Text>
                </View>
              )
            })}
          </View>
        ) : null}

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载申请记录', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '申请记录加载失败', desc: '请稍后重试。' }} />
        ) : items.length ? (
          <>
            <ItemList items={items} />
            <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
          </>
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无申请记录', desc: '当前筛选条件下没有接单申请。' }} />
        )}
      </View>
    </PageShell>
  )
}
