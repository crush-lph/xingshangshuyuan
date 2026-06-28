import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Switch, Text, View } from '@tarojs/components'
import { ActionBar, FormSection, FormTextField, FormTextareaField } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { createOpportunity } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { numberOf, textOf } from '@/shared/view-data'

interface OpportunityPublishForm {
  title: string
  type: string
  city: string
  description: string
  isConfidential: boolean
}

const initialForm: OpportunityPublishForm = {
  title: '',
  type: '1',
  city: '',
  description: '',
  isConfidential: true
}

export default function OpportunityPublishPage() {
  const [form, setForm] = useState<OpportunityPublishForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof OpportunityPublishForm>(key: Key, value: OpportunityPublishForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validateForm() {
    if (!textOf(form.title)) {
      return '请填写商机标题'
    }

    if (!numberOf(form.type)) {
      return '请填写业务类型编号'
    }

    if (!textOf(form.city)) {
      return '请填写所在城市'
    }

    if (!textOf(form.description)) {
      return '请填写业务需求'
    }

    return undefined
  }

  async function handleSubmit() {
    if (!(await ensureLoggedIn('登录后才能发布商机'))) {
      return
    }

    const error = validateForm()

    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      const response = await createOpportunity({
        title: form.title.trim(),
        type: numberOf(form.type),
        city: form.city.trim(),
        description: form.description.trim(),
        is_confidential: form.isConfidential ? 1 : 0
      })
      Taro.showToast({ title: '商机已提交', icon: 'success' })
      router.redirect(
        response.data.opportunity_id ? routes.opportunityDetail : routes.opportunityHome,
        response.data.opportunity_id ? { opportunity_id: response.data.opportunity_id } : undefined
      )
    } catch {
      Taro.showToast({ title: '商机提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="发布商机" subtitle="提交客户需求后，平台审核并协助撮合服务商。">
      <View className="grid gap-3">
        <FormSection title="商机信息" desc="平台会基于业务类型、城市和需求描述推荐合适服务商。">
          <FormTextField
            label="商机标题"
            required
            value={form.title}
            placeholder="例如：上海企业所得税汇算项目外包"
            onChange={(value) => updateField('title', value)}
          />
          <View className="grid grid-cols-2 gap-3">
            <FormTextField
              label="业务类型"
              required
              type="number"
              value={form.type}
              placeholder="例如：1"
              onChange={(value) => updateField('type', value)}
            />
            <FormTextField
              label="所在城市"
              required
              value={form.city}
              placeholder="例如：上海"
              onChange={(value) => updateField('city', value)}
            />
          </View>
          <FormTextareaField
            label="业务需求"
            required
            value={form.description}
            placeholder="请描述客户行业、需求范围、预算区间、交付时间和对接要求"
            onChange={(value) => updateField('description', value)}
          />
          <View className="flex items-center justify-between rounded-lg bg-canvas px-3 py-3">
            <View>
              <Text className="block text-sm font-semibold text-ink">匿名发布</Text>
              <Text className="mt-1 block text-xs text-muted">开启后列表页隐藏发布方敏感信息</Text>
            </View>
            <Switch
              checked={form.isConfidential}
              color="#1E5EFF"
              onChange={(event) => updateField('isConfidential', event.detail.value)}
            />
          </View>
        </FormSection>

        <ActionBar
          actions={[
            { label: '返回商机', variant: 'outline', path: routes.opportunityHome },
            { label: isSubmitting ? '提交中' : '提交审核', disabled: isSubmitting, onClick: handleSubmit }
          ]}
        />
      </View>
    </PageShell>
  )
}
