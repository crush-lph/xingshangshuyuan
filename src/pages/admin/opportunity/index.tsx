import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getMyOpportunities, updateOpportunityStatus } from '@/services'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'

export default function AdminOpportunityPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadOpportunities() {
      const response = await getMyOpportunities({ page: 1, page_size: 20 })
      setItems(
        (response.data.list ?? []).map((item) => ({
          title: textOrPlaceholder(item.title, '未命名商机'),
          desc: compactJoin([item.type_text, item.city]) || '接口未返回商机摘要',
          meta: `${item.apply_count ?? 0} 人申请 · ${item.view_count ?? 0} 次浏览`,
          tag: textOrPlaceholder(item.status_text),
          action: '关闭',
          onClick: item.id
            ? async () => {
                await updateOpportunityStatus({ opportunity_id: item.id, status: 0 })
                Taro.showToast({ title: '状态接口已调用', icon: 'success' })
              }
            : undefined
        }))
      )
    }

    void loadOpportunities().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="商机撮合" subtitle="审核商机、匹配服务商并跟踪撮合结果。">
      {items.length ? (
        <ItemList items={items} />
      ) : (
        <EmptyState title="暂无商机管理数据" desc="Apifox mock 未返回我发布的商机。" />
      )}
    </PageShell>
  )
}
