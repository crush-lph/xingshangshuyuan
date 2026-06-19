import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { PageShell } from '@/components/PageShell'

const stats = [
  ['7000+', '服务机构'],
  ['3000+', '联盟伙伴'],
  ['7万+', '培训人次']
]

const entries = ['智能工具', '培训课程', '增值服务', '资质认证']

export default function HomePage() {
  return (
    <PageShell
      eyebrow='笃行致远 · 聚商共赢'
      title='行商书苑'
      subtitle='面向财税机构的工具、课程、咨询与商机生态服务平台。'
    >
      <View className='grid gap-3'>
        <View className='rounded-lg bg-white p-4 shadow-soft'>
          <Text className='block text-lg font-bold text-ink'>2026 全国财税行业峰会</Text>
          <Text className='mt-2 block text-sm leading-6 text-muted'>
            聚焦代账增长、智能申报、合规咨询与机构协同。
          </Text>
          <View className='mt-4 grid grid-cols-3 gap-2'>
            {stats.map(([value, label]) => (
              <View key={label} className='rounded-lg bg-brand-deep px-2 py-3 text-center'>
                <Text className='block text-base font-bold text-gold-light'>{value}</Text>
                <Text className='mt-1 block text-xs text-white/60'>{label}</Text>
              </View>
            ))}
          </View>
          <View className='mt-4 flex items-center justify-between'>
            <Text className='text-xs text-muted'>300+ 城市联动</Text>
            <Button type='primary' size='small'>
              立即报名
            </Button>
          </View>
        </View>

        <View className='grid grid-cols-2 gap-3'>
          {entries.map((item) => (
            <View key={item} className='rounded-lg bg-white px-4 py-4 shadow-soft'>
              <View className='mb-3 h-1 w-8 rounded-full bg-gold' />
              <Text className='block text-base font-semibold text-ink'>{item}</Text>
              <Text className='mt-1 block text-xs text-muted'>进入服务</Text>
            </View>
          ))}
        </View>

        <View className='rounded-lg bg-white p-4 shadow-soft'>
          <View className='mb-3 flex items-center justify-between'>
            <Text className='text-base font-bold text-ink'>平台动态</Text>
            <Text className='text-xs font-medium text-tech'>更多</Text>
          </View>
          {['代账公司经营管理训练营开放报名', '增值税申报新规重点解读', '杭州伙伴客户增长案例复盘'].map(
            (notice) => (
              <View key={notice} className='border-t border-line py-3'>
                <Text className='text-sm leading-5 text-ink'>{notice}</Text>
              </View>
            )
          )}
        </View>
      </View>
    </PageShell>
  )
}
