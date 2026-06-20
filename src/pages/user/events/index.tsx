import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function UserEventsPage() {
  return (
    <PageShell title="我的活动" subtitle="管理报名记录、电子票和活动评价。">
      <ItemList
        items={[
          {
            title: '全国财税行业数字化转型峰会',
            desc: '报名成功，待现场核销。',
            meta: '深圳 · 2026-06-18',
            tag: '待核销',
            path: routes.eventTicket,
            action: '电子票'
          },
          {
            title: '老客户升单训练营',
            desc: '活动已结束，可提交评价。',
            meta: '杭州 · 2026-05-20',
            tag: '待评价',
            path: routes.userReviews,
            action: '评价'
          }
        ]}
      />
    </PageShell>
  )
}
