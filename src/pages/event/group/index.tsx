import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventGroupPage() {
  return (
    <PageShell title='拼团参与' subtitle='邀请同行一起报名，成团后享受优惠价。'>
      <View className='grid gap-3'>
        <SectionCard title='当前拼团'>
          <Text className='block text-lg font-bold text-gold'>3人成团 · 还差1人</Text>
          <Text className='mt-2 block text-sm text-muted'>成团价 ¥398，未成团自动按原路径退款。</Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '发起人', value: '陈总' },
            { label: '活动', value: '数字化转型峰会' },
            { label: '截止时间', value: '今晚 22:00' },
            { label: '优惠金额', value: '每人省 ¥200' }
          ]}
        />
        <ActionBar actions={[{ label: '支付并加入', path: routes.eventTicket }]} />
      </View>
    </PageShell>
  )
}
