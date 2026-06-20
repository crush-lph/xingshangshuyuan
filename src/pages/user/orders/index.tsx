import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getMockOrders, type MemberOrder, type OrderStatus } from '@/shared/frontend-test-flow'
import { routes } from '@/shared/router'

function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    paid: '已完成',
    pending: '待支付',
    transfer_pending: '待确认'
  }

  return labels[status]
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<MemberOrder[]>([])

  useEffect(() => {
    void getMockOrders().then(setOrders)
  }, [])

  const mockOrderItems = orders.map((order) => ({
    title: order.title,
    desc:
      order.status === 'paid'
        ? '微信支付已完成，会员权益已开通。'
        : order.status === 'transfer_pending'
          ? '转账凭证已提交，等待财务确认。'
          : '会员开通订单，等待支付。',
    meta: order.id,
    price: `¥${order.amount.toLocaleString()}`,
    tag: getStatusLabel(order.status),
    path: order.status === 'pending' ? routes.paymentTransfer : routes.userBenefits,
    action: order.status === 'pending' ? '去支付' : '查看'
  }))

  return (
    <PageShell title="我的订单" subtitle="查看资源采购、活动报名和会员订单。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="grid grid-cols-3 gap-2 text-center">
            {['全部', '待支付', '已完成'].map((item, index) => (
              <View key={item} className={`rounded-lg px-3 py-2 ${index === 1 ? 'bg-brand text-white' : 'bg-canvas'}`}>
                <Text className={`text-xs font-semibold ${index === 1 ? 'text-white' : 'text-muted'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
        <ItemList
          items={[
            ...mockOrderItems,
            {
              title: '行商·菁英会员',
              desc: '会员开通订单，等待对公转账确认。',
              meta: 'XS20260620001',
              price: '¥4,980',
              tag: '待支付',
              path: routes.paymentTransfer,
              action: '去支付'
            },
            {
              title: '数字化转型峰会报名',
              desc: '普通票 1 张，电子票已生成。',
              meta: 'XS20260618008',
              price: '¥598',
              tag: '已完成',
              path: routes.eventTicket,
              action: '查看'
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
