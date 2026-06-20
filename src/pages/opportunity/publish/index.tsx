import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function OpportunityPublishPage() {
  return (
    <PageShell title='发布商机' subtitle='提交客户需求后，平台审核并协助撮合服务商。'>
      <FormPreview
        title='商机信息'
        desc='当前为发布表单预览，后续接入真实表单和资料上传。'
        fields={[
          { label: '商机类型', value: '工商注册 + 代账' },
          { label: '服务区域', value: '深圳宝安' },
          { label: '预估金额', value: '¥80,000' },
          { label: '隐私设置', value: '审核通过后展示' }
        ]}
        actions={[
          { label: '保存草稿', variant: 'outline' },
          { label: '提交审核', path: routes.opportunityHome }
        ]}
      />
    </PageShell>
  )
}
