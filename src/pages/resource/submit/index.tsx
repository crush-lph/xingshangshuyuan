import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function ResourceSubmitPage() {
  return (
    <PageShell title='提交资源需求' subtitle='填写核心需求后，由客户经理协助匹配供应商。'>
      <FormPreview
        title='需求信息'
        desc='当前为表单结构预览，后续接入真实表单组件与校验。'
        fields={[
          { label: '需求类型', value: '跨区域工商注册' },
          { label: '服务城市', value: '深圳 / 杭州' },
          { label: '预算范围', value: '¥5,000 - ¥20,000' },
          { label: '期望响应', value: '1个工作日内' }
        ]}
        actions={[
          { label: '保存草稿', variant: 'outline' },
          { label: '提交需求', path: routes.home }
        ]}
      />
    </PageShell>
  )
}
