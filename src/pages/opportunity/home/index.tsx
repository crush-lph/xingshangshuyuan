import { Text, View } from '@tarojs/components'
import { ActionBar, ItemList, SectionCard, StatGrid } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function OpportunityHomePage() {
  return (
    <PageShell title="商机" subtitle="财税公司甩单、接单、跨区域协作与高端项目撮合。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <Text className="block text-xs font-semibold text-gold-light">商机撮合中心</Text>
          <Text className="mt-2 block text-xl font-bold text-white">甩单、接单、跨区域协作</Text>
          <Text className="mt-2 block text-sm leading-5 text-white/65">
            发布方信息默认脱敏，申请通过后开放联系方式。
          </Text>
        </View>

        <StatGrid
          items={[
            { label: '可申请商机', value: '42', tone: 'brand' },
            { label: '本月撮合', value: '18', tone: 'success' },
            { label: '预估金额', value: '86万', tone: 'gold' }
          ]}
        />

        <ActionBar
          actions={[
            { label: '我要甩单', path: routes.opportunityPublish },
            { label: '我要接单', variant: 'outline', path: routes.opportunityDetail }
          ]}
        />

        <SectionCard title="商机类型">
          <View className="flex flex-wrap gap-2">
            {['全部', '工商注册', '代理记账', '税筹咨询', '资质办理', '跨区域协作'].map((item, index) => (
              <View key={item} className={`rounded-full px-3 py-2 ${index === 0 ? 'bg-brand' : 'bg-brand-soft'}`}>
                <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-brand'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <ItemList
          items={[
            {
              title: '深圳宝安区工商注册+代账',
              desc: '约 50 家新设企业，需要本地服务商承接。',
              meta: '预算 ¥8万 · 认证企业发布 · 联系方式脱敏',
              tag: '可申请',
              path: routes.opportunityDetail,
              action: '详情'
            },
            {
              title: '杭州高新企业税筹咨询',
              desc: '客户希望评估股权架构与研发费用合规方案。',
              meta: '预算面议 · 菁英会员优先 · 需案例证明',
              tag: '高价值',
              path: routes.opportunityDetail,
              action: '申请'
            },
            {
              title: '成都餐饮连锁门店财税外包',
              desc: '15 家门店月度账务、发票与税务申报统一交付。',
              meta: '预算 ¥12万/年 · 本地服务优先',
              tag: '长期',
              path: routes.opportunityDetail,
              action: '查看'
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
