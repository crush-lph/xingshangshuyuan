import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getOrders } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

function isCompletedOrder(order: Record<string, unknown>) {
  const status = order.status
  const statusText = textOf(order.status_text)

  return status === 2 || statusText === '已完成'
}

export default function UserOrdersPage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      setHasError(false)

      const response = await getOrders({ page: 1, page_size: 20 })
      setItems(
        firstRecordList(response.data).map((order) => {
          const orderNo = textOf(order.order_no ?? order.id)
          const orderId = textOf(order.order_id ?? order.id)
          const isCompleted = isCompletedOrder(order)
          const title = textOrPlaceholder(order.title ?? order.order_no ?? order.id, '未命名订单')

          return {
            title,
            desc: textOrPlaceholder(order.description ?? order.remark ?? order.status_text, '接口未返回订单描述'),
            meta: orderNo,
            price: priceOf(order.pay_amount ?? order.total_amount ?? order.amount),
            tag: textOf(order.status_text),
            icon: 'file-list-3-line',
            tone: isCompleted ? 'success' : 'gold',
            path: isCompleted ? routes.userReviews : orderNo ? routes.paymentTransfer : undefined,
            query: isCompleted
              ? {
                  ...(orderId ? { order_id: orderId } : {}),
                  title
                }
              : orderNo
                ? { order_no: orderNo }
                : undefined,
            action: isCompleted ? '去评价' : orderNo ? '查看' : '订单号缺失'
          }
        })
      )
    }

    void loadOrders()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
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
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无订单', desc: '当前接口没有返回订单记录。' }} />
        )}
      </View>
    </PageShell>
  )
}
