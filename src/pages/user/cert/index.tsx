import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, FormSection, FormTextField, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getUserCertification,
  submitUserCertification,
  type GetUserCertificationData,
  type SubmitUserCertificationPayload
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { routes } from '@/shared/router'
import { textOf, textOrPlaceholder } from '@/shared/view-data'

interface CertificationForm {
  companyName: string
  creditCode: string
  legalPerson: string
  contactPhone: string
  businessLicenseUrl: string
  idCardFrontUrl: string
  idCardBackUrl: string
}

const initialForm: CertificationForm = {
  companyName: '',
  creditCode: '',
  legalPerson: '',
  contactPhone: '',
  businessLicenseUrl: '',
  idCardFrontUrl: '',
  idCardBackUrl: ''
}

function formFromCertification(certification: GetUserCertificationData | null): CertificationForm {
  return {
    companyName: textOf(certification?.company_name) ?? '',
    creditCode: textOf(certification?.credit_code) ?? '',
    legalPerson: textOf(certification?.legal_person) ?? '',
    contactPhone: '',
    businessLicenseUrl: '',
    idCardFrontUrl: '',
    idCardBackUrl: ''
  }
}

export default function UserCertPage() {
  const [certification, setCertification] = useState<GetUserCertificationData | null>(null)
  const [form, setForm] = useState<CertificationForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void getUserCertification()
      .then((response) => {
        const nextCertification = response.data.certification_id ? response.data : null
        setCertification(nextCertification)
        setForm(formFromCertification(nextCertification))
      })
      .catch(() => {
        setCertification(null)
        setForm(initialForm)
      })
  }, [])

  function updateField<Key extends keyof CertificationForm>(key: Key, value: CertificationForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validateForm() {
    if (!textOf(form.companyName)) {
      return '请填写企业名称'
    }

    if (!textOf(form.creditCode)) {
      return '请填写统一信用代码'
    }

    if (!textOf(form.legalPerson)) {
      return '请填写法人姓名'
    }

    if (!textOf(form.contactPhone)) {
      return '请填写联系人手机号'
    }

    return undefined
  }

  async function handleSubmit() {
    if (!(await ensureLoggedIn('登录后才能提交企业认证'))) {
      return
    }

    const error = validateForm()

    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      return
    }

    const payload: SubmitUserCertificationPayload = {
      company_name: form.companyName.trim(),
      credit_code: form.creditCode.trim(),
      legal_person: form.legalPerson.trim(),
      contact_phone: form.contactPhone.trim(),
      business_license_url: textOf(form.businessLicenseUrl),
      id_card_front_url: textOf(form.idCardFrontUrl),
      id_card_back_url: textOf(form.idCardBackUrl)
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      const response = await submitUserCertification(payload)
      Taro.showToast({ title: '认证已提交', icon: 'success' })
      setCertification({
        certification_id: response.data.certification_id,
        company_name: payload.company_name,
        credit_code: payload.credit_code,
        legal_person: payload.legal_person,
        status: response.data.status,
        status_text: response.data.status_text
      })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="企业认证" subtitle="认证通过后可申请商机、发布需求并享受平台合作权益。">
      <View className="grid gap-3">
        {certification ? (
          <View className="grid gap-3">
            <SectionCard title="认证状态">
              <Text className="block text-lg font-bold text-[#38A169]">
                {textOrPlaceholder(certification.status_text, '审核中')}
              </Text>
              {certification.reject_reason ? (
                <Text className="mt-2 block text-sm leading-6 text-muted">{certification.reject_reason}</Text>
              ) : null}
            </SectionCard>
            <FieldList
              fields={[
                { label: '企业名称', value: textOrPlaceholder(certification.company_name) },
                { label: '统一信用代码', value: textOrPlaceholder(certification.credit_code) },
                { label: '法人', value: textOrPlaceholder(certification.legal_person) },
                { label: '认证时间', value: textOrPlaceholder(certification.reviewed_at ?? certification.created_at) }
              ]}
            />
          </View>
        ) : null}

        <FormSection
          title={certification ? '更新认证资料' : '提交认证资料'}
          desc="营业执照和身份证图片字段先支持填写上传后的 URL；后续接入真实上传后可自动回填。"
        >
          <FormTextField
            label="企业名称"
            required
            value={form.companyName}
            placeholder="请输入营业执照上的企业名称"
            onChange={(value) => updateField('companyName', value)}
          />
          <FormTextField
            label="统一信用代码"
            required
            value={form.creditCode}
            placeholder="请输入统一社会信用代码"
            onChange={(value) => updateField('creditCode', value)}
          />
          <FormTextField
            label="法人姓名"
            required
            value={form.legalPerson}
            placeholder="请输入法人姓名"
            onChange={(value) => updateField('legalPerson', value)}
          />
          <FormTextField
            label="联系人手机号"
            required
            type="number"
            value={form.contactPhone}
            placeholder="用于审核沟通"
            onChange={(value) => updateField('contactPhone', value)}
          />
          <FormTextField
            label="营业执照 URL"
            value={form.businessLicenseUrl}
            placeholder="可选，填写已上传文件地址"
            onChange={(value) => updateField('businessLicenseUrl', value)}
          />
          <FormTextField
            label="身份证正面 URL"
            value={form.idCardFrontUrl}
            placeholder="可选，填写已上传文件地址"
            onChange={(value) => updateField('idCardFrontUrl', value)}
          />
          <FormTextField
            label="身份证反面 URL"
            value={form.idCardBackUrl}
            placeholder="可选，填写已上传文件地址"
            onChange={(value) => updateField('idCardBackUrl', value)}
          />
        </FormSection>

        <ActionBar
          actions={[
            { label: '返回我的', variant: 'outline', path: routes.profile },
            { label: isSubmitting ? '提交中' : '提交认证', disabled: isSubmitting, onClick: handleSubmit }
          ]}
        />
      </View>
    </PageShell>
  )
}
