import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function ResourcePurchasePage() {
  return (
    <PageShell title='采购确认' subtitle='确认资源、权益和支付方式后生成订单。'>
      <View className='grid gap-3'>
        <SectionCard title='订单资源'>
          <Text className='block text-base font-bold text-ink'>AI 智能发票管理</Text>
          <Text className='mt-2 block text-sm text-muted'>在线开通 · 平台认证供应商</Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '商品金额', value: '¥3,980' },
            { label: '会员优惠', value: '-¥1,000' },
            { label: '应付金额', value: '¥2,980' },
            { label: '支付方式', value: '微信支付 / 对公转账' }
          ]}
        />
        <ActionBar
          actions={[
            { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
            { label: '确认支付', path: routes.userOrders }
          ]}
        />
      </View>
    </PageShell>
  )
}
