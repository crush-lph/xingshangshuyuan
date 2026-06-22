import { useEffect, useState } from 'react'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertification } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'

export default function AdminCertPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    void getUserCertification()
      .then((response) => {
        const data = response.data
        setItems(
          data.certification_id
            ? [
                {
                  title: textOrPlaceholder(data.company_name, '未命名企业'),
                  desc: textOrPlaceholder(data.reject_reason, '接口未返回审核说明'),
                  meta: textOrPlaceholder(data.created_at),
                  tag: textOrPlaceholder(data.status_text),
                  action: '处理'
                }
              ]
            : []
        )
      })
      .catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="认证审核" subtitle="审核企业资料、服务能力和认证标签。">
      {items.length ? (
        <ItemList items={items} />
      ) : (
        <EmptyState title="暂无认证审核" desc="Apifox mock 未返回认证数据。" />
      )}
    </PageShell>
  )
}
