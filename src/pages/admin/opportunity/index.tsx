import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function AdminOpportunityPage() {
  return (
    <PageShell title="商机撮合" subtitle="审核商机、匹配服务商并跟踪撮合结果。">
      <ItemList
        items={[
          {
            title: '深圳宝安区工商注册+代账',
            desc: '发布方认证通过，待审核上线。',
            meta: '预估金额 ¥80,000',
            tag: '待审核',
            action: '审核'
          },
          {
            title: '杭州高新企业税筹咨询',
            desc: '已有 3 家会员服务商申请接单。',
            meta: '会员优先',
            tag: '撮合中',
            action: '匹配'
          }
        ]}
      />
    </PageShell>
  )
}
