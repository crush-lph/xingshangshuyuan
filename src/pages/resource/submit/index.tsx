import { useState } from 'react'
import Taro from '@tarojs/taro'
import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { saveCompanyProfile } from '@/services'
import { router, routes } from '@/shared/router'

export default function ResourceSubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await saveCompanyProfile({})
      Taro.showToast({ title: '需求已提交', icon: 'success' })
      router.redirect(routes.resourceHome)
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="提交资源需求" subtitle="填写核心需求后，由客户经理协助匹配供应商。">
      <FormPreview
        title="需求信息"
        desc="当前页面已接入企业档案保存接口；真实输入控件后续再补。"
        fields={[
          { label: '提交接口', value: 'POST /api/companies/profile' },
          { label: '提交参数', value: '由接口或后续真实表单提供' }
        ]}
        actions={[
          { label: '保存草稿', variant: 'outline' },
          { label: isSubmitting ? '提交中' : '提交需求', disabled: isSubmitting, onClick: handleSubmit }
        ]}
      />
    </PageShell>
  )
}
