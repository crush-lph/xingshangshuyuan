import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function UserBenefitsPage() {
  return (
    <PageShell title='我的权益' subtitle='查看当前会员等级、权益使用情况和升级入口。'>
      <View className='grid gap-3'>
        <SectionCard title='当前会员'>
          <Text className='block text-lg font-bold text-gold'>行商·菁英会员</Text>
          <Text className='mt-2 block text-sm text-muted'>有效期至 2026-07-01</Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '课程权益', value: '3 次可用' },
            { label: '资源采购', value: '会员价' },
            { label: '商机申请', value: '优先' },
            { label: '客户经理', value: '专属支持' }
          ]}
        />
        <ActionBar actions={[{ label: '升级领航会员', variant: 'gold', path: routes.memberBenefit }]} />
      </View>
    </PageShell>
  )
}
