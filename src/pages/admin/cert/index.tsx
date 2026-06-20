import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function AdminCertPage() {
  return (
    <PageShell title="认证审核" subtitle="审核企业资料、服务能力和认证标签。">
      <ItemList
        items={[
          {
            title: '鑫财财税有限公司',
            desc: '申请标签：500户+ · 可跨区域 · 代账',
            meta: '提交于 2026-06-20 10:30',
            tag: '待审核',
            action: '处理'
          },
          {
            title: '杭州企服伙伴',
            desc: '申请标签：资质许可 · 知产科创',
            meta: '提交于 2026-06-19 15:20',
            tag: '补充材料',
            action: '查看'
          }
        ]}
      />
    </PageShell>
  )
}
