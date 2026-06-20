import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function PaymentTransferPage() {
  return (
    <PageShell title='对公支付凭证' subtitle='上传转账凭证后由财务确认到账。'>
      <View className='grid gap-3'>
        <FieldList
          fields={[
            { label: '订单编号', value: 'XS20260620001' },
            { label: '订单金额', value: '¥4,980' },
            { label: '收款户名', value: '行商书苑科技有限公司' },
            { label: '备注信息', value: '请备注订单编号' }
          ]}
        />
        <SectionCard title='凭证上传'>
          <Text className='block rounded-lg border border-dashed border-line bg-canvas px-4 py-8 text-center text-sm text-muted'>
            点击上传银行回单截图
          </Text>
        </SectionCard>
        <ActionBar actions={[{ label: '提交凭证', path: routes.userOrders }]} />
      </View>
    </PageShell>
  )
}
