import { useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, ListLoadMore, SectionCard, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getOrders, type OrderListItem } from '@/services'
import { routes } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { numberOf, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface OrderTab {
  label: string
  paid?: 0 | 1
  status?: 4
}

const orderTabs: OrderTab[] = [
  { label: '全部' },
  { label: '未支付', paid: 0 },
  { label: '已支付', paid: 1 },
  { label: '已退款', status: 4 }
]

function getOrderAction(status: number | undefined) {
  if (status === 0) return '继续支付'
  if (status === 1) return '查看'
  if (status === 2) return '查看订单'
  if (status === 3) return '已取消'
  return '查看订单'
}

function mapOrderItems(records: OrderListItem[], fromPaidFilter = false): ListItem[] {
  return records.map((order) => {
    const orderNo = textOf(order.order_no)
    const orderId = numberOf(order.order_id ?? order.id)
    const status = numberOf(order.status)
    const paidFlag = order.paid ?? order.is_paid
    const isPaid =
      fromPaidFilter ||
      paidFlag === true ||
      numberOf(paidFlag) === 1 ||
      Boolean(textOf(order.pay_time)) ||
      status === 1 ||
      status === 2
    const canReview = isPaid && status !== 3 && status !== 4 && orderId !== undefined
    const isCompleted = status === 2 || textOf(order.status_text) === '已完成'
    const title = textOrPlaceholder(order.title ?? order.order_no ?? order.id, '未命名订单')

    return {
      title,
      titleSize: 'small',
      desc: textOf(order.description ?? order.remark),
      price: priceOf(order.pay_amount ?? order.total_amount ?? order.amount),
      tag: textOf(order.status_text),
      icon: 'file-list-3-line',
      tone: isCompleted ? 'success' : 'gold',
      path: orderNo ? routes.paymentTransfer : undefined,
      query: orderNo ? { order_no: orderNo } : undefined,
      action: canReview ? '去评价' : orderNo ? getOrderAction(status) : '订单信息缺失',
      actionPath: canReview ? routes.userReviews : undefined,
      actionQuery: canReview
        ? {
            order_id: orderId,
            ...(orderNo ? { order_no: orderNo } : {}),
            title
          }
        : undefined
    }
  })
}

export default function UserOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>(orderTabs[0])
  const { hasError, hasMore, isLoading, isLoadingMore, items } = usePaginatedList<OrderListItem, ListItem>({
    deps: [activeTab],
    fetchPage: ({ page, page_size }) =>
      getOrders({
        ...(activeTab.paid !== undefined ? { paid: activeTab.paid } : {}),
        ...(activeTab.status !== undefined ? { status: activeTab.status } : {}),
        page,
        page_size
      }),
    mapItems: (records) => mapOrderItems(records, activeTab.paid === 1)
  })

  return (
    <PageShell title="我的订单" subtitle="查看资源采购、活动报名和会员订单。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="grid grid-cols-4 gap-2 text-center">
            {orderTabs.map((item) => {
              const isActive = item.label === activeTab.label

              return (
                <View
                  key={item.label}
                  className={`rounded-lg px-3 py-2 ${isActive ? 'bg-brand text-white' : 'bg-canvas'}`}
                  onClick={() => setActiveTab(item)}
                >
                  <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>
                    {item.label}
                  </Text>
                </View>
              )
            })}
          </View>
        </SectionCard>
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <>
            <ItemList items={items} />
            <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
          </>
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无订单', desc: '当前接口没有返回订单记录。' }} />
        )}
      </View>
    </PageShell>
  )
}
