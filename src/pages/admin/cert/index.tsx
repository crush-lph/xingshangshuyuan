import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertification } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminCertContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

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
                  icon: 'building-2-line',
                  tone: 'gold',
                  action: '来源受限'
                }
              ]
            : []
        )
      })
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="认证审核" subtitle="审核企业资料、服务能力和认证标签。">
      <View className="grid gap-3">
        <StateNotice
          state="empty"
          copy={{
            title: '后台认证审核列表接口待补',
            desc: '当前仅能读取登录用户认证资料，不能作为后台待审核列表。'
          }}
        />
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无认证资料示例', desc: '当前接口没有返回登录用户认证资料。' }} />
        )}
      </View>
    </PageShell>
  )
}

export default function AdminCertPage() {
  return (
    <AdminGuard title="认证审核">
      <AdminCertContent />
    </AdminGuard>
  )
}
