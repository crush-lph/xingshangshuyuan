import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventDetailPage() {
  return (
    <PageShell title='数字化转型峰会' subtitle='全天课程、资源对接与商机撮合。'>
      <View className='grid gap-3'>
        <View className='rounded-lg bg-brand-deep p-4 shadow-medium'>
          <Text className='block text-xs font-semibold text-gold-light'>深圳 · 6月18日 09:30-17:30</Text>
          <Text className='mt-2 block text-xl font-bold text-white'>全国财税行业数字化转型峰会</Text>
          <Text className='mt-2 block text-sm leading-5 text-white/65'>
            面向财税机构负责人，聚焦增长、交付、资源和商机。
          </Text>
        </View>

        <FieldList
          fields={[
            { label: '活动地点', value: '深圳南山科兴科学园' },
            { label: '普通票', value: '¥598/人' },
            { label: '会员票', value: '¥398/人' },
            { label: '报名状态', value: '剩余 42 席' }
          ]}
        />

        <SectionCard title='票种选择'>
          <View className='grid gap-2'>
            {[
              { title: '单人票', desc: '含全天课程、茶歇和资料包', price: '¥598' },
              { title: '会员票', desc: '菁英会员专享，现场资源对接优先', price: '¥398' },
              { title: '3人拼团票', desc: '适合同城团队参会，成团后自动锁席', price: '¥1,380' }
            ].map((item, index) => (
              <View key={item.title} className={`rounded-lg border px-3 py-3 ${index === 1 ? 'border-gold bg-gold-soft' : 'border-line bg-white'}`}>
                <View className='flex items-center justify-between gap-3'>
                  <View className='flex-1'>
                    <Text className='block text-sm font-semibold text-ink'>{item.title}</Text>
                    <Text className='mt-1 block text-xs leading-5 text-muted'>{item.desc}</Text>
                  </View>
                  <Text className='text-base font-bold text-gold'>{item.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title='活动日程'>
          <View className='grid gap-3'>
            {[
              ['09:30', '签到入场与城市资源墙'],
              ['10:00', '代账机构数字化转型趋势'],
              ['14:00', '智能申报与交付标准化案例'],
              ['16:00', '资源对接与商机撮合']
            ].map(([time, title]) => (
              <View key={time} className='flex gap-3'>
                <Text className='w-12 text-sm font-semibold text-brand'>{time}</Text>
                <Text className='flex-1 text-sm text-ink'>{title}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <ActionBar
          actions={[
            { label: '发起拼团', variant: 'outline', path: routes.eventGroup },
            { label: '会员优惠', variant: 'gold', path: routes.memberBenefit },
            { label: '立即报名', path: routes.eventSignup }
          ]}
        />
      </View>
    </PageShell>
  )
}
