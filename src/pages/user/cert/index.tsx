import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Image, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { FormSection, FormTextField, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getUserCertification,
  submitUserCertification,
  uploadFile,
  type GetUserCertificationData,
  type SubmitUserCertificationPayload
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
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

const statusTone = {
  success: {
    bg: 'bg-[#E6F7F0]',
    text: 'text-[#38A169]',
    icon: 'checkbox-circle-line' as const
  },
  warning: {
    bg: 'bg-gold-soft',
    text: 'text-gold',
    icon: 'time-line' as const
  },
  danger: {
    bg: 'bg-[#FFF0F0]',
    text: 'text-[#E53E3E]',
    icon: 'error-warning-line' as const
  }
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

function getCertificationTone(certification: GetUserCertificationData) {
  const statusText = textOf(certification.status_text)

  if (statusText?.includes('驳回') || statusText?.includes('失败')) {
    return statusTone.danger
  }

  if (
    certification.status === 2 ||
    certification.status === 1 ||
    statusText?.includes('通过') ||
    statusText?.includes('已认证')
  ) {
    return statusTone.success
  }

  return statusTone.warning
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
        className="min-h-[112px] rounded-[14px] border border-dashed border-line bg-canvas px-3 py-4"
        onClick={isUploading ? undefined : onClick}
      >
        {value ? (
          <View className="flex items-center gap-3">
            <Image className="h-16 w-16 shrink-0 rounded-xl bg-white" src={value} mode="aspectFill" />
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

interface CertificationInfoViewProps {
  certification: GetUserCertificationData
  onUpdate: () => void
}

function CertificationInfoView({ certification, onUpdate }: CertificationInfoViewProps) {
  const tone = getCertificationTone(certification)

  return (
    <View className="grid gap-3">
      <View className="overflow-hidden rounded-[16px] bg-brand-deep shadow-medium">
        <View className="px-4 py-5">
          <View className="flex items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="block text-xs font-semibold text-white/70">企业认证</Text>
              <Text className="mt-1 block break-all text-xl font-bold text-white">
                {textOrPlaceholder(certification.company_name, '未命名企业')}
              </Text>
            </View>
            <View className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 ${tone.bg}`}>
              <AppIcon name={tone.icon} size={15} className={tone.text} />
              <Text className={`text-xs font-bold ${tone.text}`}>
                {textOrPlaceholder(certification.status_text, '审核中')}
              </Text>
            </View>
          </View>
          <Text className="mt-3 block text-sm leading-6 text-white/70">
            认证信息用于商机申请、需求发布和平台合作身份展示。
          </Text>
        </View>
      </View>

      <SectionCard title="认证信息">
        <View className="grid gap-3">
          {[
            { label: '统一信用代码', value: textOrPlaceholder(certification.credit_code) },
            { label: '法人姓名', value: textOrPlaceholder(certification.legal_person) },
            { label: '认证时间', value: textOrPlaceholder(certification.reviewed_at ?? certification.created_at) }
          ].map((item) => (
            <View
              key={item.label}
              className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
            >
              <Text className="shrink-0 text-sm text-muted">{item.label}</Text>
              <Text className="min-w-0 flex-1 break-all text-right text-sm font-semibold text-ink">{item.value}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {certification.reject_reason ? (
        <View className="rounded-[14px] bg-[#FFF0F0] px-4 py-3">
          <Text className="block text-sm font-bold text-[#E53E3E]">审核说明</Text>
          <Text className="mt-1 block text-sm leading-6 text-muted">{certification.reject_reason}</Text>
        </View>
      ) : null}

      <TaroButton
        className="app-native-button-borderless flex h-12 w-full items-center justify-center rounded-full border-0 bg-brand px-4 text-white"
        onClick={onUpdate}
      >
        <Text className="text-base font-bold text-white">
          {certification.reject_reason ? '重新提交认证' : '更新认证信息'}
        </Text>
      </TaroButton>
    </View>
  )
}

interface CertificationFormViewProps {
  certification: GetUserCertificationData | null
  form: CertificationForm
  uploadingKey: CertificationUploadKey | null
  isSubmitting: boolean
  onCancel?: () => void
  onSubmit: () => void
  onUpload: (item: CertificationUploadItem) => void
  onFieldChange: <Key extends keyof CertificationForm>(key: Key, value: CertificationForm[Key]) => void
}

function CertificationFormView({
  certification,
  form,
  uploadingKey,
  isSubmitting,
  onCancel,
  onSubmit,
  onUpload,
  onFieldChange
}: CertificationFormViewProps) {
  return (
    <View className="grid gap-3">
      <FormSection
        title={certification ? '更新认证资料' : '提交认证资料'}
        desc="请上传营业执照及法人身份证正反面照片，上传成功后自动回填文件地址。"
      >
        <FormTextField
          label="企业名称"
          required
          value={form.companyName}
          placeholder="请输入营业执照上的企业名称"
          onChange={(value) => onFieldChange('companyName', value)}
        />
        <FormTextField
          label="统一信用代码"
          required
          value={form.creditCode}
          placeholder="请输入统一社会信用代码"
          onChange={(value) => onFieldChange('creditCode', value)}
        />
        <FormTextField
          label="法人姓名"
          required
          value={form.legalPerson}
          placeholder="请输入法人姓名"
          onChange={(value) => onFieldChange('legalPerson', value)}
        />
        <FormTextField
          label="联系人手机号"
          required
          type="number"
          value={form.contactPhone}
          placeholder="用于审核沟通"
          onChange={(value) => onFieldChange('contactPhone', value)}
        />
        {uploadItems.map((item) => (
          <UploadCard
            key={item.key}
            label={item.label}
            placeholder={item.placeholder}
            value={form[item.key]}
            isUploading={uploadingKey === item.key}
            onClick={() => onUpload(item)}
          />
        ))}
      </FormSection>

      <View className={onCancel ? 'grid w-full grid-cols-2 gap-3' : 'grid w-full gap-2'}>
        {onCancel ? (
          <TaroButton
            className="flex h-12 w-full items-center justify-center rounded-xl border border-brand bg-white px-4 text-brand"
            disabled={isSubmitting || Boolean(uploadingKey)}
            onClick={onCancel}
          >
            <Text className="text-base font-bold text-brand">取消</Text>
          </TaroButton>
        ) : null}
        <TaroButton
          className={`app-native-button-borderless h-12 ${onCancel ? 'rounded-xl' : 'rounded-full'} flex w-full items-center justify-center border-0 bg-brand px-4 text-white`}
          disabled={isSubmitting || Boolean(uploadingKey)}
          onClick={onSubmit}
        >
          <Text className="text-base font-bold text-white">{isSubmitting ? '提交中' : '提交认证'}</Text>
        </TaroButton>
      </View>
    </View>
  )
}

export default function UserCertPage() {
  const [certification, setCertification] = useState<GetUserCertificationData | null>(null)
  const [form, setForm] = useState<CertificationForm>(initialForm)
  const [isEditing, setIsEditing] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<CertificationUploadKey | null>(null)

  useEffect(() => {
    void getUserCertification()
      .then((response) => {
        const nextCertification = response.data.certification_id ? response.data : null
        setCertification(nextCertification)
        setForm(formFromCertification(nextCertification))
        setIsEditing(!nextCertification)
      })
      .catch(() => {
        setCertification(null)
        setForm(initialForm)
        setIsEditing(true)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
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

    if (!(await ensureLoggedIn('登录后才能上传认证材料'))) {
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
        business_license_url: payload.business_license_url,
        id_card_front_url: payload.id_card_front_url,
        id_card_back_url: payload.id_card_back_url,
        status: response.data.status,
        status_text: response.data.status_text
      })
      setIsEditing(false)
    } catch {
      Taro.showToast({ title: '认证提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="企业认证" subtitle="认证通过后可申请商机、发布需求并享受平台合作权益。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {hasError ? (
          <StateNotice
            state="error"
            copy={{ title: '认证资料加载失败', desc: '暂时无法读取历史认证资料，可稍后重试。' }}
          />
        ) : null}
        {!isLoading && !hasError && certification && !isEditing ? (
          <CertificationInfoView
            certification={certification}
            onUpdate={() => {
              setForm(formFromCertification(certification))
              setIsEditing(true)
            }}
          />
        ) : null}

        {!isLoading && !hasError && isEditing ? (
          <CertificationFormView
            certification={certification}
            form={form}
            uploadingKey={uploadingKey}
            isSubmitting={isSubmitting}
            onCancel={
              certification
                ? () => {
                    setForm(formFromCertification(certification))
                    setIsEditing(false)
                  }
                : undefined
            }
            onSubmit={() => void handleSubmit()}
            onUpload={(item) => void handleUploadDocument(item)}
            onFieldChange={updateField}
          />
        ) : null}
      </View>
    </PageShell>
  )
}
