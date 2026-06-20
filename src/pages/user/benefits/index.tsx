import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCurrentAuthSession, getMockOrders, type AuthSession } from '@/shared/frontend-test-flow'
import { routes } from '@/shared/router'

export default function UserBenefitsPage() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [paidOrderId, setPaidOrderId] = useState('')

  useEffect(() => {
    void getCurrentAuthSession().then(setSession)
    void getMockOrders().then((orders) => {
      const paidOrder = orders.find((order) => order.status === 'paid')
      setPaidOrderId(paidOrder?.id ?? '')
    })
  }, [])

  return (
    <PageShell title="我的权益" subtitle="查看当前会员等级、权益使用情况和升级入口。">
      <View className="grid gap-3">
        <SectionCard title="当前会员">
          <Text className="block text-lg font-bold text-gold">行商·菁英会员</Text>
          <Text className="mt-2 block text-sm text-muted">
            {paidOrderId ? 'Mock 支付已完成，有效期至 2027-06-20' : '测试流程未完成支付'}
          </Text>
          {session ? (
            <Text className="mt-1 block text-xs text-muted">绑定企业：{session.profile.companyName}</Text>
          ) : null}
          {paidOrderId ? <Text className="mt-1 block text-xs text-brand">开通订单：{paidOrderId}</Text> : null}
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
