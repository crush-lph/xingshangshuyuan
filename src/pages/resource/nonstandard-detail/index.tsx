import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCompanyProfile, type GetCompanyProfileData } from '@/services'
import { routes } from '@/shared/router'
import { textOrPlaceholder } from '@/shared/view-data'

export default function ResourceNonstandardDetailPage() {
  const [company, setCompany] = useState<GetCompanyProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)

    void getCompanyProfile()
      .then((response) => setCompany(response.data.id ? response.data : null))
      .catch(() => {
        setCompany(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="非标资源需求" subtitle="非标资源由客户经理协同供应商报价和交付。">
      <View className="grid gap-3">
        <SectionCard title="需求说明">
          <Text className="text-sm leading-6 text-muted">提交需求后平台进行供应商匹配，企业档案信息来自平台接口。</Text>
        </SectionCard>
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : company ? (
          <FieldList
            fields={[
              { label: '企业名称', value: textOrPlaceholder(company.name) },
              { label: '所在城市', value: textOrPlaceholder(company.city) },
              { label: '服务城市', value: textOrPlaceholder(company.service_cities) },
              { label: '业务范围', value: textOrPlaceholder(company.business_scope) }
            ]}
          />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无服务资料', desc: '当前接口没有返回企业服务资料。' }} />
        )}
        <ActionBar
          actions={[
            { label: '开通会员优先匹配', variant: 'gold', path: routes.memberBenefit },
            { label: '提交需求', path: routes.resourceSubmit }
          ]}
        />
      </View>
    </PageShell>
  )
}
