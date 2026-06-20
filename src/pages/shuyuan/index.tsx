import { Text, View } from '@tarojs/components'
import { ActionBar, ItemList, SectionCard, StatGrid } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { router, routes } from '@/shared/router'

const tracks = ['经营增长', '专业交付', '团队管理', '商机撮合', '会员私董会', '服务标准']

export default function ShuyuanPage() {
  return (
    <PageShell title="行商书苑" subtitle="财税机构课程、活动和服务标准沉淀。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <Text className="block text-xs font-semibold text-gold-light">本周推荐</Text>
          <Text className="mt-2 block text-xl font-bold text-white">老客户升单训练营 · 深圳站</Text>
          <Text className="mt-2 block text-sm leading-5 text-white/65">
            课程、案例拆解、现场演练和同城资源对接一体化。
          </Text>
          <View className="mt-3">
            <ActionBar actions={[{ label: '立即报名', variant: 'gold', path: routes.eventDetail }]} />
          </View>
        </View>

        <StatGrid
          items={[
            { label: '课程专题', value: '36', tone: 'brand' },
            { label: '线下活动', value: '8', tone: 'success' },
            { label: '会员私享', value: '12', tone: 'gold' }
          ]}
        />

        <SectionCard title="学习路径">
          <View className="grid grid-cols-3 gap-2">
            {tracks.map((item, index) => (
              <View
                key={item}
                className={`rounded-lg px-3 py-3 text-center ${index === 0 ? 'bg-brand' : 'bg-brand-soft'}`}
                onClick={() => router.to(index === 4 ? routes.memberBenefit : routes.eventHome)}
              >
                <Text className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-brand'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <ItemList
          items={[
            {
              title: '财税公司老客户升单训练营',
              desc: '续费、增购、客户分层和销售话术现场演练。',
              meta: '深圳 · 7月12日 · 会员¥598',
              tag: '线下课',
              path: routes.eventDetail,
              action: '报名'
            },
            {
              title: '代账交付标准化手册',
              desc: '从客户资料、票据归档到申报复核的标准流程。',
              meta: '会员可查看完整模板',
              tag: '资料',
              path: routes.userBenefits,
              action: '查看'
            },
            {
              title: '城市会长私享会',
              desc: '本地资源互换、商机拆解和合作项目路演。',
              meta: '会员优先 · 限30人',
              tag: '私董会',
              path: routes.memberBenefit,
              action: '了解'
            }
          ]}
        />

        <SectionCard title="服务标准">
          <View className="grid gap-2">
            {[
              '认证服务商需要完成企业认证、案例审核和服务承诺。',
              '课程资料与资源模板优先向会员开放。',
              '平台沉淀活动签到、报名、评价与权益核销记录。'
            ].map((item) => (
              <Text key={item} className="block text-sm leading-6 text-muted">
                {item}
              </Text>
            ))}
          </View>
        </SectionCard>
      </View>
    </PageShell>
  )
}
