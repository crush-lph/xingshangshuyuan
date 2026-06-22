import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { EmptyState, ItemList, SectionCard, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getOrders } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserOrdersPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadOrders() {
      const response = await getOrders({ page: 1, page_size: 20 })
      setItems(
        firstRecordList(response.data).map((order) => {
          const orderNo = textOf(order.order_no ?? order.id)

          return {
            title: textOrPlaceholder(order.title ?? order.order_no ?? order.id, '未命名订单'),
            desc: textOrPlaceholder(order.description ?? order.remark ?? order.status_text, '接口未返回订单描述'),
            meta: orderNo,
            price: priceOf(order.pay_amount ?? order.total_amount ?? order.amount),
            tag: textOf(order.status_text),
            path: routes.paymentTransfer,
            query: orderNo ? { order_no: orderNo } : undefined,
            action: '查看'
          }
        })
      )
    }

    void loadOrders().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="我的订单" subtitle="查看资源采购、活动报名和会员订单。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="grid grid-cols-3 gap-2 text-center">
            {['全部', '待支付', '已完成'].map((item, index) => (
              <View key={item} className={`rounded-lg px-3 py-2 ${index === 0 ? 'bg-brand text-white' : 'bg-canvas'}`}>
                <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-muted'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
        {items.length ? (
          <ItemList items={items} />
        ) : (
          <EmptyState title="暂无订单" desc="Apifox mock 未返回订单列表数据。" />
        )}
      </View>
    </PageShell>
  )
}
