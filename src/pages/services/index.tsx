import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { PageShell } from '../../components/PageShell'

const services = [
  { name: '文化课程', desc: '系统课程与专题班' },
  { name: '研学活动', desc: '线下参访与主题体验' },
  { name: '文创好物', desc: '书苑精选周边' }
]

export default function ServicesPage() {
  return (
    <PageShell title='服务商城' subtitle='浏览课程、活动和文创服务，一站式完成选择。'>
      <View className='grid gap-3'>
        {services.map((service) => (
          <View key={service.name} className='rounded-lg bg-white p-4 shadow-soft'>
            <View className='flex items-center justify-between gap-3'>
              <View>
                <Text className='block text-lg font-semibold text-ink'>{service.name}</Text>
                <Text className='mt-1 block text-sm text-[#66736d]'>{service.desc}</Text>
              </View>
              <Button type='primary' size='small'>
                进入
              </Button>
            </View>
          </View>
        ))}
      </View>
    </PageShell>
  )
}
