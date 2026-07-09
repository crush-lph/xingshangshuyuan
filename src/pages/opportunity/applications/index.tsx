import { useEffect, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserApplications, type GetUserApplicationsData } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, textOf, textOrPlaceholder } from '@/shared/view-data'

type ApplicationRecord = NonNullable<GetUserApplicationsData['list']>[number]

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
    title: textOrPlaceholder(item.opportunity_title, '未命名申请'),
    desc: compactJoin([item.type_text, item.city]) || '接口未返回申请摘要',
    meta: textOf(item.created_at),
    tag: textOf(item.status_text),
    icon: 'hand-heart-line',
    tone: getApplicationTone(item.status),
    status: item.status,
    path: routes.opportunityDetail,
    query: item.opportunity_id ? { opportunity_id: item.opportunity_id } : undefined,
    action: '查看商机'
  }
}

export default function OpportunityApplicationsPage() {
  const [activeTab, setActiveTab] = useState<(typeof applicationTabs)[number]['label']>('全部')
  const [items, setItems] = useState<ApplicationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const currentRequestId = requestIdRef.current + 1
    const activeItem = applicationTabs.find((item) => item.label === activeTab)
    const activeStatus = activeItem && 'status' in activeItem ? activeItem.status : undefined

    requestIdRef.current = currentRequestId

    async function loadApplications() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await getUserApplications({
          ...(activeStatus !== undefined ? { status: activeStatus } : {}),
          page: 1,
          page_size: 20
        })

        if (requestIdRef.current !== currentRequestId) {
          return
        }

        setItems((response.data.list ?? []).map(mapApplication))
      } catch {
        if (requestIdRef.current !== currentRequestId) {
          return
        }

        setItems([])
        setHasError(true)
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false)
        }
      }
    }

    void loadApplications()
  }, [activeTab])

  return (
    <PageShell title="我的申请" subtitle="查看接单申请、审核状态和关联商机。">
      <View className="grid gap-3">
        <View className="flex gap-2 overflow-x-auto">
          {applicationTabs.map((item) => {
            const isActive = activeTab === item.label

            return (
              <View
                key={item.label}
                className={`shrink-0 rounded-full px-4 py-2 ${isActive ? 'bg-brand' : 'border border-line bg-white'}`}
                onClick={() => setActiveTab(item.label)}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>{item.label}</Text>
              </View>
            )
          })}
        </View>

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载申请记录', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '申请记录加载失败', desc: '请稍后重试。' }} />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无申请记录', desc: '当前筛选条件下没有接单申请。' }} />
        )}
      </View>
    </PageShell>
  )
}
