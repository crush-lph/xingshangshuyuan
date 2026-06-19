import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { PageShell } from '@/components/PageShell'

const services = [
  { name: '智能工具', desc: '发票、申报、对账与代账管理工具', action: '试用' },
  { name: '培训课程', desc: '经营增长、考证辅导与行业训练营', action: '报名' },
  { name: '增值咨询', desc: '股权、税筹、知识产权与合规咨询', action: '咨询' },
  { name: '资质认证', desc: '专精特新、ISO、互联网资质代办', action: '办理' }
]

export default function ServicesPage() {
  return (
    <PageShell title='服务商城' subtitle='工具、培训、咨询和资质服务统一入口。'>
      <View className='grid gap-3'>
        {services.map((service) => (
          <View key={service.name} className='rounded-lg bg-white p-4 shadow-soft'>
            <View className='flex items-center justify-between gap-3'>
              <View>
                <Text className='block text-lg font-semibold text-ink'>{service.name}</Text>
                <Text className='mt-1 block text-sm leading-5 text-muted'>{service.desc}</Text>
              </View>
              <Button type='primary' size='small'>
                {service.action}
              </Button>
            </View>
          </View>
        ))}
      </View>
    </PageShell>
  )
}
