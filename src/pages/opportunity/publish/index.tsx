import { useState } from 'react'
import Taro from '@tarojs/taro'
import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { createOpportunity } from '@/services'
import { router, routes } from '@/shared/router'

export default function OpportunityPublishPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await createOpportunity({})
      Taro.showToast({ title: '商机已提交', icon: 'success' })
      router.redirect(routes.opportunityHome)
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="发布商机" subtitle="提交客户需求后，平台审核并协助撮合服务商。">
      <FormPreview
        title="商机信息"
        desc="当前页面已接入发布商机接口；真实输入控件后续再补。"
        fields={[
          { label: '提交接口', value: 'POST /api/opportunities' },
          { label: '提交参数', value: '由接口或后续真实表单提供' }
        ]}
        actions={[
          { label: '保存草稿', variant: 'outline' },
          { label: isSubmitting ? '提交中' : '提交审核', disabled: isSubmitting, onClick: handleSubmit }
        ]}
      />
    </PageShell>
  )
}
