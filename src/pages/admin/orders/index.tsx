import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function AdminOrdersPage() {
  return (
    <PageShell title='订单确认' subtitle='处理对公转账、会员开通和资源采购订单。'>
      <ItemList
        items={[
          {
            title: 'XS20260620001',
            desc: '行商·菁英会员开通，对公转账待确认。',
            price: '¥4,980',
            tag: '待确认',
            action: '确认'
          },
          {
            title: 'XS20260618008',
            desc: '活动报名订单，微信支付已完成。',
            price: '¥598',
            tag: '已完成',
            action: '查看'
          }
        ]}
      />
    </PageShell>
  )
}
