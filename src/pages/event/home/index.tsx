import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard, StatGrid } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventHomePage() {
  return (
    <PageShell title="活动" subtitle="线下峰会、训练营和城市沙龙，服务财税机构增长。">
      <View className="grid gap-3">
        <View className="rounded-lg bg-gold-soft px-4 py-3">
          <Text className="text-sm font-semibold text-gold">深圳数字化转型峰会开放报名，会员票限量 80 张</Text>
        </View>

        <StatGrid
          items={[
            { label: '本月活动', value: '8', tone: 'brand' },
            { label: '覆盖城市', value: '12', tone: 'success' },
            { label: '会员专享', value: '3', tone: 'gold' }
          ]}
        />

        <SectionCard title="活动分类">
          <View className="grid grid-cols-3 gap-2">
            {['经营管理', '营销增长', '专业交付', '峰会沙龙', '知行塾', '会员闭门'].map((item, index) => (
              <View
                key={item}
                className={`rounded-lg px-3 py-3 text-center ${index === 0 ? 'bg-brand' : 'bg-brand-soft'}`}
              >
                <Text className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-brand'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <ItemList
          items={[
            {
              title: '全国财税行业数字化转型峰会',
              desc: '代账增长、智能申报、产品化交付与城市资源对接。',
              meta: '深圳 · 6月18日 · 剩余42席',
              price: '¥598',
              tag: '会员¥398',
              path: routes.eventDetail,
              action: '报名'
            },
            {
              title: '老客户升单训练营',
              desc: '围绕续费、增购和客户分层运营进行实战训练。',
              meta: '杭州 · 6月26日 · 2天1夜',
              price: '¥1,280',
              tag: '训练营',
              path: routes.eventDetail,
              action: '详情'
            },
            {
              title: '城市会长私享会',
              desc: '当地资源互换、重点商机拆解和合作项目路演。',
              meta: '成都 · 7月03日 · 会员优先',
              tag: '闭门',
              path: routes.eventDetail,
              action: '预约'
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
