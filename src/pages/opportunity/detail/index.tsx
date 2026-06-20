import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function OpportunityDetailPage() {
  return (
    <PageShell title="商机详情" subtitle="深圳宝安区工商注册+代账项目。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-white p-4 shadow-soft">
          <View className="flex flex-wrap gap-2">
            {['工商注册', '代理记账', '本地交付', '认证服务商'].map((item) => (
              <View key={item} className="rounded bg-brand-soft px-2 py-1">
                <Text className="text-xs font-semibold text-brand">{item}</Text>
              </View>
            ))}
          </View>
          <Text className="mt-3 block text-xl font-bold text-ink">深圳宝安区工商注册+代账</Text>
          <Text className="mt-2 block text-sm leading-6 text-muted">
            发布方有批量工商注册与后续代理记账需求，希望匹配宝安本地服务团队，可提供上门沟通。
          </Text>
        </View>

        <FieldList
          fields={[
            { label: '项目区域', value: '深圳宝安' },
            { label: '客户规模', value: '约50家新设企业' },
            { label: '预估金额', value: '¥80,000' },
            { label: '申请条件', value: '已认证服务商' }
          ]}
        />

        <SectionCard title="交付要求">
          <View className="grid gap-2">
            {[
              '具备本地工商注册、银行开户和税务登记交付能力。',
              '可承接后续小规模纳税人代理记账与月度申报。',
              '申请时需提交服务案例、团队规模和报价说明。'
            ].map((item) => (
              <Text key={item} className="block text-sm leading-6 text-muted">
                {item}
              </Text>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="平台规则">
          <View className="grid gap-2">
            <Text className="block text-sm leading-6 text-muted">
              申请通过前，客户名称、联系方式和具体地址均保持脱敏。
            </Text>
            <Text className="block text-sm leading-6 text-muted">
              平台记录沟通与报价过程，异常投诉会影响服务商接单权重。
            </Text>
          </View>
        </SectionCard>

        <ActionBar
          actions={[
            { label: '会员优先申请', variant: 'gold', path: routes.memberBenefit },
            { label: '申请接单', path: routes.opportunityApply }
          ]}
        />
      </View>
    </PageShell>
  )
}
