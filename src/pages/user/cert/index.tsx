import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCertification, type GetUserCertificationData } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'

export default function UserCertPage() {
  const [certification, setCertification] = useState<GetUserCertificationData | null>(null)

  useEffect(() => {
    void getUserCertification()
      .then((response) => setCertification(response.data.certification_id ? response.data : null))
      .catch(() => setCertification(null))
  }, [])

  return (
    <PageShell title="企业认证" subtitle="认证通过后可申请商机、发布需求并享受平台合作权益。">
      {certification ? (
        <View className="grid gap-3">
          <SectionCard title="认证状态">
            <Text className="block text-lg font-bold text-[#38A169]">
              {textOrPlaceholder(certification.status_text)}
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
      ) : (
        <EmptyState title="暂无认证信息" desc="Apifox mock 未返回企业认证数据。" />
      )}
    </PageShell>
  )
}
