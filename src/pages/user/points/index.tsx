import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertificates, getUserLearningStats } from '@/services'
import { firstRecordList, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserPointsPage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadPoints() {
      setIsLoading(true)
      setHasError(false)

      const [statsResult, certificatesResult] = await Promise.allSettled([
        getUserLearningStats(),
        getUserCertificates()
      ])

      if (certificatesResult.status === 'fulfilled') {
        setItems(
          firstRecordList(certificatesResult.value.data).map((item) => ({
            title: textOrPlaceholder(item.title ?? item.name ?? item.certificate_name, '未命名证书'),
            meta: textOf(item.created_at ?? item.issued_at),
            tag: textOf(item.status_text),
            icon: 'coins-line',
            tone: 'gold',
            action: '查看'
          }))
        )
      }

      setHasError(statsResult.status === 'rejected' && certificatesResult.status === 'rejected')
    }

    void loadPoints()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="我的积分" subtitle="积分余额和流水接口暂未接入，当前仅展示证书记录。">
      <View className="grid gap-3">
        <StateNotice
          state="empty"
          copy={{ title: '积分接口暂未接入', desc: '当前没有稳定接口返回积分余额和积分流水，因此不展示积分数。' }}
        />
        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载证书记录', desc: '证书记录不等同于积分余额。' }} />
        ) : hasError ? (
          <StateNotice
            state="error"
            copy={{ title: '证书记录加载失败', desc: '积分接口暂未接入，证书记录也暂时无法加载。' }}
          />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无证书记录', desc: '当前接口没有返回证书记录。' }} />
        )}
      </View>
    </PageShell>
  )
}
