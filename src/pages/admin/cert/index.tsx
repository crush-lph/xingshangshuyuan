import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { InterfaceGapNotice, ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertification } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminCertContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

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
        <InterfaceGapNotice
          title="当前可查看资料来源受限"
          desc="当前接口只能读取登录用户认证资料，不能作为后台认证审核队列；页面不提供通过、驳回或补充材料操作。"
          items={[
            '缺少后台认证申请列表接口。',
            '缺少后台认证详情接口，不能查看完整审核材料和历史记录。',
            '缺少认证通过接口。',
            '缺少认证驳回和补充材料接口。'
          ]}
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
