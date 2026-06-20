import { Text, View } from '@tarojs/components'
import { FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function UserCertPage() {
  return (
    <PageShell title="企业认证" subtitle="认证通过后可申请商机、发布需求并享受平台合作权益。">
      <View className="grid gap-3">
        <SectionCard title="认证状态">
          <Text className="block text-lg font-bold text-[#38A169]">认证已通过</Text>
          <Text className="mt-2 block text-sm leading-6 text-muted">
            企业信息已完成审核，可正常使用会员与商机能力。
          </Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '企业名称', value: '鑫财财税有限公司' },
            { label: '认证标签', value: '500户+ · 可跨区域 · 代账' },
            { label: '认证时间', value: '2026-01-15' },
            { label: '客户经理', value: '张晓慧' }
          ]}
        />
      </View>
    </PageShell>
  )
}
