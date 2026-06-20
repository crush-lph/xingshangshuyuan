import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventListPage() {
  return (
    <PageShell title="活动列表" subtitle="按城市、主题和会员权益筛选活动。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="flex flex-wrap gap-2">
            {['全部', '深圳', '杭州', '线上', '会员优惠'].map((item, index) => (
              <View
                key={item}
                className={`rounded-full px-3 py-2 ${index === 0 ? 'bg-brand' : 'bg-white border border-line'}`}
              >
                <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-muted'}`}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
        <ItemList
          items={[
            {
              title: '全国财税行业数字化转型峰会',
              desc: '全天课程、资源对接、商机撮合。',
              meta: '深圳 · 6月18日 · 238人已报名',
              price: '¥598',
              path: routes.eventDetail,
              action: '报名'
            },
            {
              title: '客户增长城市沙龙',
              desc: '本地服务商闭门交流与案例复盘。',
              meta: '杭州 · 6月28日',
              price: '免费',
              path: routes.eventDetail,
              action: '详情'
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
