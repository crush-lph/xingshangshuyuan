import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { EmptyState, FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  applyOpportunity,
  getCompanyProfile,
  getOpportunities,
  getOpportunityDetail,
  type GetCompanyProfileData,
  type GetOpportunityDetailData
} from '@/services'
import { router, routes } from '@/shared/router'
import { getPageParam, textOrPlaceholder } from '@/shared/view-data'

async function resolveOpportunityId() {
  const pageId = getPageParam('opportunity_id')

  if (pageId) {
    return pageId
  }

  const response = await getOpportunities({ page: 1, page_size: 1 })
  return response.data.list?.[0]?.id
}

export default function OpportunityApplyPage() {
  const [detail, setDetail] = useState<GetOpportunityDetailData | null>(null)
  const [company, setCompany] = useState<GetCompanyProfileData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [opportunityId, companyResult] = await Promise.all([
        resolveOpportunityId(),
        getCompanyProfile().catch(() => null)
      ])

      if (companyResult) {
        setCompany(companyResult.data)
      }

      if (!opportunityId) {
        setDetail(null)
        return
      }

      const detailResult = await getOpportunityDetail({ opportunity_id: opportunityId })
      setDetail(detailResult.data.id ? detailResult.data : null)
    }

    void loadData().catch(() => setDetail(null))
  }, [])

  async function handleApply() {
    if (!detail?.id) {
      Taro.showToast({ title: '暂无商机数据', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await applyOpportunity({
        opportunity_id: detail.id,
        reason: company?.business_scope,
        quote_type: 1
      })
      Taro.showToast({ title: '申请已提交', icon: 'success' })
      router.redirect(routes.profile)
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title="申请接单" subtitle="提交服务能力说明，平台审核后推送给发布方。">
      {detail ? (
        <FormPreview
          title="申请信息"
          desc="系统会带入企业档案接口信息。"
          fields={[
            { label: '申请商机', value: textOrPlaceholder(detail.title) },
            { label: '申请企业', value: textOrPlaceholder(company?.name) },
            { label: '认证状态', value: textOrPlaceholder(company?.cert_status) },
            { label: '服务区域', value: textOrPlaceholder(company?.service_cities) },
            { label: '业务范围', value: textOrPlaceholder(company?.business_scope) }
          ]}
          actions={[
            { label: '查看认证', variant: 'outline', path: routes.userCert },
            { label: isSubmitting ? '提交中' : '提交申请', disabled: isSubmitting, onClick: handleApply }
          ]}
        />
      ) : (
        <EmptyState title="暂无可申请商机" desc="Apifox mock 未返回商机详情数据。" />
      )}
    </PageShell>
  )
}
