import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function OpportunityApplyPage() {
  return (
    <PageShell title="申请接单" subtitle="提交服务能力说明，平台审核后推送给发布方。">
      <FormPreview
        title="申请信息"
        desc="系统会带入企业认证信息，减少重复填写。"
        fields={[
          { label: '申请企业', value: '鑫财财税有限公司' },
          { label: '认证状态', value: '已认证' },
          { label: '服务区域', value: '深圳宝安 / 南山' },
          { label: '优势说明', value: '工商+代账一体交付' }
        ]}
        actions={[
          { label: '查看认证', variant: 'outline', path: routes.userCert },
          { label: '提交申请', path: routes.profile }
        ]}
      />
    </PageShell>
  )
}
