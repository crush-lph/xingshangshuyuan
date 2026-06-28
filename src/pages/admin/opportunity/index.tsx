import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getMyOpportunities, updateOpportunityStatus } from '@/services'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminOpportunityContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  async function loadOpportunities() {
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await getMyOpportunities({ page: 1, page_size: 20 })
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
                  await loadOpportunities()
                } catch {
                  Taro.showToast({ title: '商机状态更新失败，请稍后重试', icon: 'none' })
                }
              }
            : undefined
        }))
      )
    } catch {
      setItems([])
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOpportunities()
  }, [])

  return (
    <PageShell title="商机撮合" subtitle="审核商机、匹配服务商并跟踪撮合结果。">
      <View className="grid gap-3">
        <StateNotice
          state="empty"
          copy={{
            title: '撮合服务商接口待补',
            desc: '当前只支持查看我发布的商机和真实关闭动作，暂不展示撮合结果或服务商建议。'
          }}
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
