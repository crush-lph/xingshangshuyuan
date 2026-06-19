import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { PageShell } from '../../components/PageShell'
import './index.scss'

export default function HomePage() {
  return (
    <PageShell title='首页' subtitle='快速查看书苑动态、精选服务和近期学习安排。'>
      <View className='grid gap-3'>
        <View className='rounded-lg bg-brand px-5 py-5 text-white'>
          <Text className='block text-lg font-semibold'>今日推荐</Text>
          <Text className='mt-2 block text-sm leading-6 opacity-90'>
            国学素养课、文化研学和会员权益已经准备好。
          </Text>
          <View className='mt-4'>
            <Button type='primary' size='small'>
              查看详情
            </Button>
          </View>
        </View>
        <View className='grid grid-cols-2 gap-3'>
          {['课程预约', '活动报名', '书单精选', '会员权益'].map((item) => (
            <View key={item} className='rounded-lg bg-white px-4 py-4 shadow-soft'>
              <Text className='text-base font-medium text-ink'>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </PageShell>
  )
}
