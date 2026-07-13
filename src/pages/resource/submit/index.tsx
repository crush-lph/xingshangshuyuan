import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FormSection, FormTextField, FormTextareaField, InterfaceGapNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { saveCompanyProfile } from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { numberOf, textOf } from '@/shared/view-data'

interface ResourceDemandForm {
  name: string
  creditCode: string
  city: string
  teamSize: string
  clientCount: string
  businessScope: string
  serviceCities: string
}

const initialForm: ResourceDemandForm = {
  name: '',
  creditCode: '',
  city: '',
  teamSize: '',
  clientCount: '',
  businessScope: '',
  serviceCities: ''
}

export default function ResourceSubmitPage() {
  const [form, setForm] = useState<ResourceDemandForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<Key extends keyof ResourceDemandForm>(key: Key, value: ResourceDemandForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validateForm() {
    if (!textOf(form.name)) {
      return '请填写企业名称'
    }

    if (!textOf(form.city)) {
      return '请填写所在城市'
    }

    if (!textOf(form.businessScope)) {
      return '请填写资源需求'
    }

    return undefined
  }

  async function handleSubmit() {
    if (!(await ensureLoggedIn('登录后才能提交资源需求'))) {
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
      await saveCompanyProfile({
        name: form.name.trim(),
        credit_code: textOf(form.creditCode),
        city: form.city.trim(),
        team_size: numberOf(form.teamSize),
        client_count: numberOf(form.clientCount),
        business_scope: form.businessScope.trim(),
        service_cities: textOf(form.serviceCities) ?? form.city.trim(),
        is_cross_region: textOf(form.serviceCities) ? 1 : 0
      })
      Taro.showToast({ title: '企业资源档案已保存', icon: 'success' })
      router.redirect(routes.resourceHome)
    } catch {
      Taro.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="完善资源档案" subtitle="保存企业能力与资源方向，供后续需求接口接入后复用。">
      <View className="grid gap-3">
        <InterfaceGapNotice
          title="资源需求提交接口尚未接入"
          desc="当前只能保存企业资源档案，不会生成后台待处理需求。"
          items={['后端补充资源需求创建接口后，才能形成提交、分配、撮合和交付闭环。']}
        />
        <FormSection title="企业与需求信息" desc="用于建立企业档案，并作为平台匹配资源方的基础信息。">
          <FormTextField
            label="企业名称"
            required
            value={form.name}
            placeholder="请输入企业或门店名称"
            onChange={(value) => updateField('name', value)}
          />
          <FormTextField
            label="统一信用代码"
            value={form.creditCode}
            placeholder="可选，用于后续企业认证"
            onChange={(value) => updateField('creditCode', value)}
          />
          <FormTextField
            label="所在城市"
            required
            value={form.city}
            placeholder="例如：上海"
            onChange={(value) => updateField('city', value)}
          />
          <View className="grid grid-cols-2 gap-3">
            <FormTextField
              label="团队规模"
              type="number"
              value={form.teamSize}
              placeholder="人数"
              onChange={(value) => updateField('teamSize', value)}
            />
            <FormTextField
              label="客户数量"
              type="number"
              value={form.clientCount}
              placeholder="约多少家"
              onChange={(value) => updateField('clientCount', value)}
            />
          </View>
          <FormTextareaField
            label="资源需求"
            required
            value={form.businessScope}
            placeholder="说明需要采购、合作或寻找的资源类型，例如财税工具、资质办理、客户转介绍等"
            onChange={(value) => updateField('businessScope', value)}
          />
          <FormTextField
            label="服务城市"
            value={form.serviceCities}
            placeholder="多个城市用逗号分隔，留空默认本地"
            onChange={(value) => updateField('serviceCities', value)}
          />
        </FormSection>

        <View className="rounded-lg bg-gold-soft px-4 py-3">
          <Text className="text-sm leading-6 text-gold">
            当前保存内容仅用于完善企业资源档案，不代表已进入后台需求处理队列。
          </Text>
        </View>

        <ActionBar
          actions={[
            { label: '返回资源库', variant: 'outline', path: routes.resourceHome },
            { label: isSubmitting ? '保存中' : '保存企业资源档案', disabled: isSubmitting, onClick: handleSubmit }
          ]}
        />
      </View>
    </PageShell>
  )
}
