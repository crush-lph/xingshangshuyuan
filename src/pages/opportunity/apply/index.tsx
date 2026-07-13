import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ActionBar, FieldList, FormSection, FormTextField, FormTextareaField, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  applyOpportunity,
  getCompanyProfile,
  getOpportunityDetail,
  type GetCompanyProfileData,
  type GetOpportunityDetailData
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, numberOf, textOf, textOrPlaceholder } from '@/shared/view-data'

interface OpportunityApplyForm {
  reason: string
  quoteType: string
  quotePrice: string
  attachmentUrl: string
}

const initialForm: OpportunityApplyForm = {
  reason: '',
  quoteType: '1',
  quotePrice: '',
  attachmentUrl: ''
}

async function resolveOpportunityId() {
  return getPageParam('opportunity_id')
}

export default function OpportunityApplyPage() {
  const [detail, setDetail] = useState<GetOpportunityDetailData | null>(null)
  const [company, setCompany] = useState<GetCompanyProfileData | null>(null)
  const [form, setForm] = useState<OpportunityApplyForm>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setHasError(false)

      const [opportunityId, companyResult] = await Promise.all([
        resolveOpportunityId(),
        getCompanyProfile().catch(() => null)
      ])

      if (companyResult) {
        setCompany(companyResult.data)
        setForm((current) => ({
          ...current,
          reason: textOf(companyResult.data.business_scope) ?? current.reason
        }))
      }

      if (!opportunityId) {
        setDetail(null)
        setIsLoading(false)
        return
      }

      const detailResult = await getOpportunityDetail({ opportunity_id: opportunityId })
      setDetail(detailResult.data.id ? detailResult.data : null)
    }

    void loadData()
      .catch(() => {
        setDetail(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleApply() {
    if (!(await ensureLoggedIn('登录后才能申请接单'))) {
      return
    }

    if (!detail?.id) {
      Taro.showToast({ title: '暂无商机数据', icon: 'none' })
      return
    }

    if (detail.is_owner || detail.status !== 2 || (detail.expired_at && Date.parse(detail.expired_at) <= Date.now())) {
      Taro.showToast({ title: '当前商机不可申请', icon: 'none' })
      return
    }

    if (!textOf(form.reason)) {
      Taro.showToast({ title: '请填写接单说明', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await applyOpportunity({
        opportunity_id: detail.id,
        reason: form.reason.trim(),
        quote_type: numberOf(form.quoteType),
        quote_price: numberOf(form.quotePrice),
        attachment_url: textOf(form.attachmentUrl)
      })
      Taro.showToast({ title: '申请已提交', icon: 'success' })
      router.redirect(routes.opportunityApplications)
    } catch {
      Taro.showToast({ title: '申请提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="申请接单" subtitle="提交服务能力说明，平台审核后推送给发布方。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : detail ? (
        <View className="grid gap-3">
          <FieldList
            fields={[
              { label: '申请商机', value: textOrPlaceholder(detail.title) },
              { label: '申请企业', value: textOrPlaceholder(company?.name) },
              { label: '认证状态', value: textOrPlaceholder(company?.cert_status) },
              { label: '服务区域', value: textOrPlaceholder(company?.service_cities) },
              { label: '业务范围', value: textOrPlaceholder(company?.business_scope) }
            ]}
          />

          <FormSection title="接单申请" desc="说明你的服务能力、报价方式和可交付时间。">
            <FormTextareaField
              label="接单说明"
              required
              value={form.reason}
              placeholder="说明过往经验、服务范围、交付优势和期望对接方式"
              onChange={(value) => setForm((current) => ({ ...current, reason: value }))}
            />
            <View className="grid grid-cols-2 gap-3">
              <FormTextField
                label="报价类型"
                type="number"
                value={form.quoteType}
                placeholder="例如：1"
                onChange={(value) => setForm((current) => ({ ...current, quoteType: value }))}
              />
              <FormTextField
                label="报价金额"
                type="digit"
                value={form.quotePrice}
                placeholder="可选"
                onChange={(value) => setForm((current) => ({ ...current, quotePrice: value }))}
              />
            </View>
            <FormTextField
              label="附件地址"
              value={form.attachmentUrl}
              placeholder="可选，填写方案或资质文件 URL"
              onChange={(value) => setForm((current) => ({ ...current, attachmentUrl: value }))}
            />
          </FormSection>

          <ActionBar
            actions={[
              { label: '查看认证', variant: 'outline', path: routes.userCert },
              { label: isSubmitting ? '提交中' : '提交申请', disabled: isSubmitting, onClick: handleApply }
            ]}
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无可申请商机', desc: '当前接口没有返回可申请商机。' }} />
      )}
    </PageShell>
  )
}
