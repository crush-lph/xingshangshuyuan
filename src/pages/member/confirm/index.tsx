import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function MemberConfirmPage() {
  return (
    <PageShell title='会员开通确认' subtitle='确认会员方案与企业信息后生成订单。'>
      <View className='grid gap-3'>
        <SectionCard title='会员方案'>
          <Text className='block text-base font-bold text-ink'>行商·菁英会员</Text>
          <Text className='mt-2 block text-sm text-muted'>有效期 12 个月，含资源、课程、商机优先权益。</Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '开通企业', value: '鑫财财税有限公司' },
            { label: '会员费用', value: '¥4,980' },
            { label: '开票类型', value: '增值税普通发票' },
            { label: '支付方式', value: '微信支付 / 对公转账' }
          ]}
        />
        <ActionBar
          actions={[
            { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
            { label: '确认开通', path: routes.userBenefits }
          ]}
        />
      </View>
    </PageShell>
  )
}
