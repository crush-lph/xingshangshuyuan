import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import { ActionBar, FieldList, FormSection, FormTextField, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getUserCertification,
  submitUserCertification,
  uploadFile,
  type GetUserCertificationData,
  type SubmitUserCertificationPayload
} from '@/services'
import { ensurePhoneBound } from '@/shared/auth-guard'
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

type CertificationUploadKey = 'businessLicenseUrl' | 'idCardFrontUrl' | 'idCardBackUrl'

interface CertificationUploadItem {
  key: CertificationUploadKey
  label: string
  scene: string
  placeholder: string
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

const uploadItems: CertificationUploadItem[] = [
  {
    key: 'businessLicenseUrl',
    label: '营业执照',
    scene: 'business_license',
    placeholder: '上传营业执照照片'
  },
  {
    key: 'idCardFrontUrl',
    label: '身份证正面',
    scene: 'id_card_front',
    placeholder: '上传身份证人像面'
  },
  {
    key: 'idCardBackUrl',
    label: '身份证反面',
    scene: 'id_card_back',
    placeholder: '上传身份证国徽面'
  }
]

function formFromCertification(certification: GetUserCertificationData | null): CertificationForm {
  return {
    companyName: textOf(certification?.company_name) ?? '',
    creditCode: textOf(certification?.credit_code) ?? '',
    legalPerson: textOf(certification?.legal_person) ?? '',
    contactPhone: '',
    businessLicenseUrl: textOf(certification?.business_license_url) ?? '',
    idCardFrontUrl: textOf(certification?.id_card_front_url) ?? '',
    idCardBackUrl: textOf(certification?.id_card_back_url) ?? ''
  }
}

interface UploadCardProps {
  label: string
  placeholder: string
  value: string
  isUploading: boolean
  onClick: () => void
}

function UploadCard({ label, placeholder, value, isUploading, onClick }: UploadCardProps) {
  return (
    <View>
      <Text className="mb-2 block text-sm font-semibold text-ink">
        {label}
        <Text className="text-[#FF4D4F]">*</Text>
      </Text>
      <View
        className="min-h-[112px] rounded-lg border border-dashed border-line bg-canvas px-3 py-4"
        onClick={isUploading ? undefined : onClick}
      >
        {value ? (
          <View className="flex items-center gap-3">
            <Image className="h-16 w-16 shrink-0 rounded-lg bg-white" src={value} mode="aspectFill" />
            <View className="min-w-0 flex-1">
              <Text className="block text-sm font-semibold text-ink">{isUploading ? '上传中' : '已上传'}</Text>
              <Text className="mt-1 block text-xs leading-5 text-muted">点击可重新上传</Text>
            </View>
          </View>
        ) : (
          <View className="flex min-h-[80px] flex-col items-center justify-center text-center">
            <Text className="text-2xl font-light text-muted">+</Text>
            <Text className="mt-1 block text-sm font-semibold text-ink">{isUploading ? '上传中' : placeholder}</Text>
            <Text className="mt-1 block text-xs leading-5 text-muted">支持相册选择或拍照上传</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function UserCertPage() {
  const [certification, setCertification] = useState<GetUserCertificationData | null>(null)
  const [form, setForm] = useState<CertificationForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<CertificationUploadKey | null>(null)

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

    if (!textOf(form.businessLicenseUrl)) {
      return '请上传营业执照'
    }

    if (!textOf(form.idCardFrontUrl)) {
      return '请上传身份证正面'
    }

    if (!textOf(form.idCardBackUrl)) {
      return '请上传身份证反面'
    }

    return undefined
  }

  async function handleUploadDocument(item: CertificationUploadItem) {
    if (uploadingKey) {
      return
    }

    try {
      const selected = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const filePath = selected.tempFilePaths[0] ?? selected.tempFiles?.[0]?.path

      if (!filePath) {
        Taro.showToast({ title: '未选择图片', icon: 'none' })
        return
      }

      setUploadingKey(item.key)
      Taro.showLoading({ title: '上传中' })

      const result = await uploadFile({
        filePath,
        scene: item.scene
      })

      updateField(item.key, result.fileUrl)
      Taro.hideLoading()
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      Taro.hideLoading()
      const title = error instanceof Error && error.message ? error.message : '上传失败，请重试'
      Taro.showToast({ title, icon: 'none' })
    } finally {
      setUploadingKey(null)
    }
  }

  async function handleSubmit() {
    if (!(await ensurePhoneBound('绑定手机号后才能提交企业认证'))) {
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
        business_license_url: payload.business_license_url,
        id_card_front_url: payload.id_card_front_url,
        id_card_back_url: payload.id_card_back_url,
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
          desc="请上传营业执照及法人身份证正反面照片，上传成功后自动回填文件地址。"
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
          {uploadItems.map((item) => (
            <UploadCard
              key={item.key}
              label={item.label}
              placeholder={item.placeholder}
              value={form[item.key]}
              isUploading={uploadingKey === item.key}
              onClick={() => void handleUploadDocument(item)}
            />
          ))}
        </FormSection>

        <ActionBar
          actions={[
            { label: '返回我的', variant: 'outline', path: routes.profile },
            {
              label: isSubmitting ? '提交中' : '提交认证',
              disabled: isSubmitting || Boolean(uploadingKey),
              onClick: handleSubmit
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
