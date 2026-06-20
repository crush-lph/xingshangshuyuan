import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function UserReviewsPage() {
  return (
    <PageShell title="我的评价" subtitle="对已完成的资源、活动和商机服务进行评价。">
      <ItemList
        items={[
          {
            title: '数字化转型峰会',
            desc: '活动评价待提交。',
            tag: '待评价',
            action: '去评价'
          },
          {
            title: 'AI 智能发票管理',
            desc: '资源服务已完成，可评价服务商。',
            tag: '待评价',
            action: '评价'
          }
        ]}
      />
    </PageShell>
  )
}
