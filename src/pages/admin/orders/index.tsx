import { useEffect, useState } from 'react'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getInvoices, getOrders } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function AdminOrdersPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadOrders() {
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
            path: routes.paymentTransfer,
            query: orderNo ? { order_no: orderNo } : undefined,
            action: '查看'
          }
        }),
        ...invoices.map((invoice) => ({
          title: textOrPlaceholder(invoice.invoice_no ?? invoice.title ?? invoice.id, '未命名发票'),
          desc: textOrPlaceholder(invoice.description ?? invoice.status_text, '接口未返回发票说明'),
          price: priceOf(invoice.amount),
          tag: textOf(invoice.status_text),
          action: '查看'
        }))
      ])
    }

    void loadOrders().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="订单确认" subtitle="处理对公转账、会员开通和资源采购订单。">
      {items.length ? (
        <ItemList items={items} />
      ) : (
        <EmptyState title="暂无订单" desc="Apifox mock 未返回订单列表数据。" />
      )}
    </PageShell>
  )
}
