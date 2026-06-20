import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function MemberBenefitPage() {
  return (
    <PageShell title="会员权益" subtitle="供应链底价、商机优先、线下课和客户经理支持。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <Text className="block text-xs font-semibold text-gold-light">推荐方案</Text>
          <Text className="mt-1 block text-2xl font-bold text-white">行尚·菁英会员</Text>
          <Text className="mt-2 block text-sm leading-6 text-white/70">
            适合正在扩张资源采购、商机协作和团队学习的财税机构。
          </Text>
          <View className="mt-4 flex items-end justify-between">
            <View>
              <Text className="text-2xl font-bold text-gold-light">¥4,980</Text>
              <Text className="ml-1 text-xs text-white/50">/ 年</Text>
            </View>
            <Text className="text-xs font-semibold text-white/70">预计年省 ¥12,000+</Text>
          </View>
        </View>

        <FieldList
          fields={[
            { label: '资源采购', value: '70+资源会员底价' },
            { label: '商机权益', value: '高价值商机优先申请' },
            { label: '活动权益', value: '线下活动会员票' },
            { label: '专属服务', value: '客户经理协助匹配' }
          ]}
        />

        <SectionCard title="权益对比">
          <View className="grid gap-2">
            {[
              ['普通用户', '资源原价、商机普通排队、活动按原价报名'],
              ['菁英会员', '会员底价、商机优先、闭门课和专属客户经理'],
              ['城市合伙人', '区域商机共建、联合活动和深度资源扶持']
            ].map(([name, desc], index) => (
              <View
                key={name}
                className={`rounded-lg border px-3 py-3 ${index === 1 ? 'border-gold bg-gold-soft' : 'border-line bg-white'}`}
              >
                <Text className="block text-sm font-semibold text-ink">{name}</Text>
                <Text className="mt-1 block text-xs leading-5 text-muted">{desc}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="适合开通">
          <View className="grid gap-2">
            {[
              '每年采购软件、许可证、咨询等供应链资源超过 2 次。',
              '希望通过平台接触跨区域商机或高端咨询项目。',
              '需要团队持续学习增长、交付和管理方法。'
            ].map((item) => (
              <Text key={item} className="block text-sm leading-6 text-muted">
                {item}
              </Text>
            ))}
          </View>
        </SectionCard>

        <ActionBar
          actions={[
            { label: '咨询客户经理', variant: 'outline', path: routes.profile },
            { label: '立即开通', variant: 'gold', path: routes.memberConfirm }
          ]}
        />
      </View>
    </PageShell>
  )
}
