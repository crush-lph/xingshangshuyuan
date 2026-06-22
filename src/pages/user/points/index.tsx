import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { EmptyState, ItemList, SectionCard, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertificates, getUserLearningStats } from '@/services'
import { firstRecordList, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserPointsPage() {
  const [score, setScore] = useState('')
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadPoints() {
      const [statsResult, certificatesResult] = await Promise.allSettled([
        getUserLearningStats(),
        getUserCertificates()
      ])

      if (statsResult.status === 'fulfilled') {
        setScore(textOf(statsResult.value.data.certificates_count) ?? '')
      }

      if (certificatesResult.status === 'fulfilled') {
        setItems(
          firstRecordList(certificatesResult.value.data).map((item) => ({
            title: textOrPlaceholder(item.title ?? item.name ?? item.certificate_name, '未命名证书'),
            meta: textOf(item.created_at ?? item.issued_at),
            tag: textOf(item.status_text),
            action: '查看'
          }))
        )
      }
    }

    void loadPoints().catch(() => {
      setScore('')
      setItems([])
    })
  }, [])

  return (
    <PageShell title="我的积分" subtitle="积分可用于活动抵扣和会员权益兑换。">
      <View className="grid gap-3">
        {score ? (
          <SectionCard>
            <Text className="block text-3xl font-bold text-gold">{score}</Text>
            <Text className="mt-2 block text-sm text-muted">接口返回的证书数量</Text>
          </SectionCard>
        ) : (
          <EmptyState title="暂无积分统计" desc="Apifox mock 未返回学习统计数据。" />
        )}
        {items.length ? (
          <ItemList items={items} />
        ) : (
          <EmptyState title="暂无证书记录" desc="Apifox mock 未返回证书列表数据。" />
        )}
      </View>
    </PageShell>
  )
}
