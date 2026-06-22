import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCompanyProfile, type GetCompanyProfileData } from '@/services'
import { routes } from '@/shared/router'
import { textOrPlaceholder } from '@/shared/view-data'

export default function ResourceNonstandardDetailPage() {
  const [company, setCompany] = useState<GetCompanyProfileData | null>(null)

  useEffect(() => {
    void getCompanyProfile()
      .then((response) => setCompany(response.data.id ? response.data : null))
      .catch(() => setCompany(null))
  }, [])

  return (
    <PageShell title="非标资源需求" subtitle="非标资源由客户经理协同供应商报价和交付。">
      <View className="grid gap-3">
        <SectionCard title="需求说明">
          <Text className="text-sm leading-6 text-muted">
            提交需求后平台进行供应商匹配，企业档案信息来自 Apifox mock 接口。
          </Text>
        </SectionCard>
        {company ? (
          <FieldList
            fields={[
              { label: '企业名称', value: textOrPlaceholder(company.name) },
              { label: '所在城市', value: textOrPlaceholder(company.city) },
              { label: '服务城市', value: textOrPlaceholder(company.service_cities) },
              { label: '业务范围', value: textOrPlaceholder(company.business_scope) }
            ]}
          />
        ) : (
          <EmptyState title="暂无企业档案" desc="Apifox mock 未返回企业档案数据。" />
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
