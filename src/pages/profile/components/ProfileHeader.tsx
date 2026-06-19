import { Text, View } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'

export function ProfileHeader() {
  return (
    <View className='flex items-center gap-4'>
      <Avatar size='large' className='bg-white text-brand'>
        陈
      </Avatar>
      <View>
        <Text className='block text-xl font-bold text-white'>陈总</Text>
        <Text className='mt-1 block text-sm text-white/70'>鑫财财税有限公司</Text>
      </View>
      <View className='ml-auto rounded bg-white/15 px-2 py-1'>
        <Text className='text-xs font-semibold text-white'>已认证</Text>
      </View>
    </View>
  )
}
