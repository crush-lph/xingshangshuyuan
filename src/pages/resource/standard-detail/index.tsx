import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function ResourceStandardDetailPage() {
  return (
    <PageShell title="财税公司一体化经营系统" subtitle="标准化工具资源，支持在线采购和会员优惠。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <View className="flex items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="block text-xs font-semibold text-gold-light">战略级供应商 · 平台兜底</Text>
              <Text className="mt-2 block text-xl font-bold text-white">¥2,980</Text>
              <Text className="mt-1 block text-xs text-white/55">市场价 ¥3,980 · 菁英会员再省 ¥1,000</Text>
            </View>
            <View className="rounded bg-gold-soft px-2 py-1">
              <Text className="text-xs font-semibold text-gold">会员价</Text>
            </View>
          </View>
        </View>

        <FieldList
          fields={[
            { label: '交付方式', value: '在线开通 + 专人配置' },
            { label: '服务周期', value: '7个工作日内完成' },
            { label: '适用机构', value: '代账公司、财税服务商' },
            { label: '售后保障', value: '30天配置答疑' }
          ]}
        />

        <SectionCard title="核心能力">
          <View className="grid grid-cols-2 gap-2">
            {['客户档案', '账套管理', '申报提醒', '工单协同', '收款跟进', '经营看板'].map((item) => (
              <View key={item} className="rounded-lg bg-brand-soft px-3 py-3">
                <Text className="text-sm font-semibold text-brand">{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="购买须知">
          <View className="grid gap-2">
            {[
              '下单后客户经理确认机构规模与开通账号数。',
              '供应商完成系统初始化、权限配置与基础培训。',
              '平台保留交付记录，出现争议可发起售后协助。'
            ].map((item) => (
              <Text key={item} className="block text-sm leading-6 text-muted">
                {item}
              </Text>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="用户评价" more="4.8分">
          <Text className="block text-sm leading-6 text-muted">
            “客户跟进和申报提醒比原来的表格稳定很多，团队培训半天就能上手。”
          </Text>
        </SectionCard>

        <ActionBar
          actions={[
            { label: '开通会员省钱', variant: 'gold', path: routes.memberBenefit },
            { label: '立即采购', path: routes.resourcePurchase }
          ]}
        />
      </View>
    </PageShell>
  )
}
