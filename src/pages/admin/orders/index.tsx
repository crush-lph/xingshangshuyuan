import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { InterfaceGapNotice, ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getInvoices, getOrders } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminOrdersContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      setHasError(false)

      const [ordersResult, invoicesResult] = await Promise.allSettled([
        getOrders({ page: 1, page_size: 20 }),
        getInvoices({ page: 1, page_size: 20 })
      ])
      const orders = ordersResult.status === 'fulfilled' ? firstRecordList(ordersResult.value.data) : []
      const invoices = invoicesResult.status === 'fulfilled' ? firstRecordList(invoicesResult.value.data) : []

      setItems([
        ...orders.map((order) => {
          const orderNo = textOf(order.order_no ?? order.id)

          return {
            title: textOrPlaceholder(order.order_no ?? order.id, '未命名订单'),
            desc: textOrPlaceholder(order.description ?? order.remark ?? order.status_text, '接口未返回订单描述'),
            price: priceOf(order.pay_amount ?? order.total_amount ?? order.amount),
            tag: textOf(order.status_text),
            icon: 'file-list-3-line',
            tone: 'gold' as const,
            path: routes.paymentTransfer,
            query: orderNo ? { order_no: orderNo } : undefined,
            action: '查看状态'
          }
        }),
        ...invoices.map((invoice) => ({
          title: textOrPlaceholder(invoice.invoice_no ?? invoice.title ?? invoice.id, '未命名发票'),
          desc: textOrPlaceholder(invoice.description ?? invoice.status_text, '接口未返回发票说明'),
          price: priceOf(invoice.amount),
          tag: textOf(invoice.status_text),
          icon: 'file-list-3-line',
          tone: 'tech' as const,
          action: '查看状态'
        }))
      ])

      setHasError(ordersResult.status === 'rejected' && invoicesResult.status === 'rejected')
    }

    void loadOrders()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="订单确认" subtitle="处理对公转账、会员开通和资源采购订单。">
      <View className="grid gap-3">
        <InterfaceGapNotice
          title="当前可查看，暂不能确认"
          desc="当前接口可以读取订单和发票类数据，但还没有后台确认到账或驳回凭证接口，因此页面不提供确认类操作。"
          items={[
            '缺少后台待确认订单列表和状态筛选接口。',
            '缺少确认到账接口，不能在前端模拟财务确认。',
            '缺少驳回凭证接口，不能展示假的驳回结果。',
            '缺少确认后驱动会员开通或资源交付状态变更的接口。'
          ]}
        />
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无订单数据', desc: '当前接口没有返回订单或发票数据。' }} />
        )}
      </View>
    </PageShell>
  )
}

export default function AdminOrdersPage() {
  return (
    <AdminGuard title="订单确认">
      <AdminOrdersContent />
    </AdminGuard>
  )
}
