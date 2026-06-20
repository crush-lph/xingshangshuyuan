import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function UserPointsPage() {
  return (
    <PageShell title='我的积分' subtitle='积分可用于活动抵扣和会员权益兑换。'>
      <View className='grid gap-3'>
        <SectionCard>
          <Text className='block text-3xl font-bold text-gold'>380</Text>
          <Text className='mt-2 block text-sm text-muted'>当前可用积分</Text>
        </SectionCard>
        <ItemList
          items={[
            { title: '完成企业认证', meta: '2026-01-15', price: '+100' },
            { title: '报名活动', meta: '2026-06-18', price: '+80' },
            { title: '推荐好友报名活动', meta: '2026-06-10', price: '+200' }
          ]}
        />
      </View>
    </PageShell>
  )
}
