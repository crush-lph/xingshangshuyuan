import { View, Text } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { PageShell } from '../../components/PageShell'

export default function ProfilePage() {
  return (
    <PageShell title='我的' subtitle='管理个人资料、订单、预约和会员权益。'>
      <View className='rounded-lg bg-white p-5 shadow-soft'>
        <View className='flex items-center gap-4'>
          <Avatar size='large'>行</Avatar>
          <View>
            <Text className='block text-lg font-semibold text-ink'>书苑会员</Text>
            <Text className='mt-1 block text-sm text-[#66736d]'>欢迎来到行尚书苑</Text>
          </View>
        </View>
        <View className='mt-5 grid grid-cols-3 gap-3 text-center'>
          {['订单', '预约', '收藏'].map((item) => (
            <View key={item} className='rounded-lg bg-brand-soft px-3 py-4'>
              <Text className='text-sm font-medium text-brand-dark'>{item}</Text>
            </View>
          ))}
        </View>
        <View className='mt-5'>
          <Button block type='primary'>
            完善资料
          </Button>
        </View>
      </View>
    </PageShell>
  )
}
