import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { InterfaceGapNotice, ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getMyOpportunities, updateOpportunityStatus } from '@/services'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminOpportunityContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadOpportunities() {
      if (refreshKey > 0) {
        setIsLoading(true)
        setHasError(false)
      }

      try {
        const response = await getMyOpportunities({ page: 1, page_size: 20 })
        if (!isMounted) {
          return
        }

        setItems(
          (response.data.list ?? []).map((item) => ({
            title: textOrPlaceholder(item.title, '未命名商机'),
            desc: compactJoin([item.type_text, item.city]) || '接口未返回商机摘要',
            meta:
              item.apply_count === undefined && item.view_count === undefined
                ? '接口未返回申请/浏览统计'
                : compactJoin([
                    item.apply_count === undefined ? '' : `${item.apply_count} 人申请`,
                    item.view_count === undefined ? '' : `${item.view_count} 次浏览`
                  ]),
            tag: textOrPlaceholder(item.status_text),
            icon: 'briefcase-4-line',
            tone: 'gold',
            action: item.id ? '关闭商机' : undefined,
            onClick: item.id
              ? async () => {
                  try {
                    await updateOpportunityStatus({ opportunity_id: item.id, status: 0 })
                    Taro.showToast({ title: '商机已关闭', icon: 'success' })
                    setRefreshKey((current) => current + 1)
                  } catch {
                    Taro.showToast({ title: '商机状态更新失败，请稍后重试', icon: 'none' })
                  }
                }
              : undefined
          }))
        )
      } catch {
        if (isMounted) {
          setItems([])
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOpportunities()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  return (
    <PageShell title="商机撮合" subtitle="审核商机、匹配服务商并跟踪撮合结果。">
      <View className="grid gap-3">
        <InterfaceGapNotice
          title="当前可关闭商机，暂不能撮合"
          desc="当前接口支持读取我发布的商机，并通过状态接口关闭商机；撮合审核、申请处理和推荐服务商能力仍需接口补齐。"
          items={[
            '缺少后台商机审核列表接口，当前数据来源不是完整撮合工作台。',
            '缺少商机申请列表接口，不能查看全部申请方和报价。',
            '缺少推荐服务商或选择服务商接口，不能生成撮合建议。',
            '缺少撮合成功/失败接口，不能展示假的撮合结果。'
          ]}
        />
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无商机管理数据', desc: '当前接口没有返回商机数据。' }} />
        )}
      </View>
    </PageShell>
  )
}

export default function AdminOpportunityPage() {
  return (
    <AdminGuard title="商机撮合">
      <AdminOpportunityContent />
    </AdminGuard>
  )
}
