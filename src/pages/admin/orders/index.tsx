import { View } from '@tarojs/components'
import { InterfaceGapNotice, ItemList, ListLoadMore, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getInvoices, getOrders } from '@/services'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { firstRecordList, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

interface AdminOrderRecord extends Record<string, unknown> {
  recordType: 'order' | 'invoice'
}

function mapAdminOrderItems(records: AdminOrderRecord[]): ListItem[] {
  return records.map((record) => {
    if (record.recordType === 'invoice') {
      return {
        title: textOrPlaceholder(record.invoice_no ?? record.title ?? record.id, '未命名发票'),
        desc: textOrPlaceholder(record.description ?? record.status_text, '接口未返回发票说明'),
        price: priceOf(record.amount),
        tag: textOf(record.status_text),
        icon: 'file-list-3-line',
        tone: 'tech',
        action: '查看状态'
      }
    }

    return {
      title: textOrPlaceholder(record.order_no ?? record.id, '未命名订单'),
      desc: textOrPlaceholder(record.description ?? record.remark ?? record.status_text, '接口未返回订单描述'),
      price: priceOf(record.pay_amount ?? record.total_amount ?? record.amount),
      tag: textOf(record.status_text),
      icon: 'file-list-3-line',
      tone: 'gold'
    }
  })
}

function AdminOrdersContent() {
  const { hasError, hasMore, isLoading, isLoadingMore, items } = usePaginatedList<AdminOrderRecord, ListItem>({
    deps: [],
    fetchPage: async ({ page, page_size }) => {
      const [ordersResult, invoicesResult] = await Promise.allSettled([
        getOrders({ page, page_size }),
        getInvoices({ page, page_size })
      ])
      const orders =
        ordersResult.status === 'fulfilled'
          ? firstRecordList(ordersResult.value.data).map((item) => ({ ...item, recordType: 'order' as const }))
          : []
      const invoices =
        invoicesResult.status === 'fulfilled'
          ? firstRecordList(invoicesResult.value.data).map((item) => ({ ...item, recordType: 'invoice' as const }))
          : []

      if (ordersResult.status === 'rejected' && invoicesResult.status === 'rejected') {
        throw new Error('admin orders load failed')
      }

      return { data: { list: [...orders, ...invoices] } }
    },
    mapItems: mapAdminOrderItems
  })

  return (
    <PageShell title="订单确认" subtitle="查看订单与发票数据，确认操作等待后台接口接入。">
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
          <>
            <ItemList items={items} />
            <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
          </>
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
