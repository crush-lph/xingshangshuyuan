import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getOpportunities,
  getOpportunityApplications,
  getOpportunityDetail,
  type GetOpportunityDetailData
} from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, getPageParam, textOrPlaceholder } from '@/shared/view-data'

async function resolveOpportunityId() {
  const pageId = getPageParam('opportunity_id')

  if (pageId) {
    return pageId
  }

  const response = await getOpportunities({ page: 1, page_size: 1 })
  return response.data.list?.[0]?.id
}

export default function OpportunityDetailPage() {
  const [detail, setDetail] = useState<GetOpportunityDetailData | null>(null)
  const [applicationCount, setApplicationCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadDetail() {
      setIsLoading(true)
      setHasError(false)

      const opportunityId = await resolveOpportunityId()

      if (!opportunityId) {
        setDetail(null)
        setIsLoading(false)
        return
      }

      const response = await getOpportunityDetail({ opportunity_id: opportunityId })
      setDetail(response.data.id ? response.data : null)

      const applications = await getOpportunityApplications({ opportunity_id: opportunityId }).catch(() => null)
      setApplicationCount(applications?.data.total ?? null)
    }

    void loadDetail()
      .catch(() => {
        setDetail(null)
        setApplicationCount(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const applicationCountText =
    applicationCount !== null
      ? String(applicationCount)
      : detail?.apply_count !== undefined && detail.apply_count !== null
        ? String(detail.apply_count)
        : '申请人数暂不可用'

  return (
    <PageShell title="商机详情" subtitle={detail ? textOrPlaceholder(detail.title) : '商机接口详情'}>
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : detail ? (
        <View className="grid gap-3">
          <View className="rounded-lg bg-white p-4 shadow-soft">
            {detail.tags?.length ? (
              <View className="flex flex-wrap gap-2">
                {detail.tags.map((item) => (
                  <View key={item} className="rounded bg-brand-soft px-2 py-1">
                    <Text className="text-xs font-semibold text-brand">{item}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text className="mt-3 block text-xl font-bold text-ink">
              {textOrPlaceholder(detail.title, '未命名商机')}
            </Text>
            <Text className="mt-2 block text-sm leading-6 text-muted">
              {textOrPlaceholder(detail.description, '接口未返回商机描述')}
            </Text>
          </View>

          <FieldList
            fields={[
              { label: '项目区域', value: textOrPlaceholder(detail.city) },
              { label: '商机类型', value: textOrPlaceholder(detail.type_text) },
              { label: '申请人数', value: applicationCountText },
              {
                label: '发布方',
                value: compactJoin([detail.publisher?.nickname, detail.publisher?.company_name]) || '未提供'
              },
              { label: '状态', value: textOrPlaceholder(detail.status_text) }
            ]}
          />

          <SectionCard title="交付要求">
            <Text className="block text-sm leading-6 text-muted">
              {textOrPlaceholder(detail.description, '接口未返回交付要求')}
            </Text>
          </SectionCard>

          <ActionBar
            actions={[
              { label: '会员优先申请', variant: 'gold', path: routes.memberBenefit },
              {
                label: '申请接单',
                path: routes.opportunityApply,
                query: detail.id ? { opportunity_id: detail.id } : undefined
              }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无商机详情', desc: '当前接口没有返回商机详情。' }} />
      )}
    </PageShell>
  )
}
