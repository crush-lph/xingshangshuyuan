import { ItemList } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function AdminResourcePage() {
  return (
    <PageShell title='资源需求' subtitle='跟进非标需求、供应商报价和交付状态。'>
      <ItemList
        items={[
          {
            title: '跨区域工商注册需求',
            desc: '深圳 / 杭州，预算 ¥5,000 - ¥20,000。',
            meta: '客户经理：张晓慧',
            tag: '待匹配',
            action: '分配'
          },
          {
            title: '专精特新申报辅导',
            desc: '需要政策匹配和材料预审。',
            meta: '已匹配 2 家供应商',
            tag: '报价中',
            action: '跟进'
          }
        ]}
      />
    </PageShell>
  )
}
