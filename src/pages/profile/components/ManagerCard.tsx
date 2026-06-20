import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import type { ManagerInfo } from '../types'

interface ManagerCardProps {
  manager: ManagerInfo
}

export function ManagerCard({ manager }: ManagerCardProps) {
  return (
    <View className="mt-3 flex items-center gap-3 rounded-lg bg-white p-4 shadow-soft">
      <View className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white">
        <Text className="text-base font-bold">{manager.name.slice(0, 1)}</Text>
      </View>
      <View className="flex-1">
        <Text className="block text-sm font-semibold text-ink">{manager.name} · 专属客户经理</Text>
        <Text className="mt-1 block text-xs text-muted">{manager.phone}</Text>
      </View>
      <Button
        size="small"
        fill="outline"
        onClick={() => {
          Taro.makePhoneCall({
            phoneNumber: manager.phone
          })
        }}
      >
        联系
      </Button>
    </View>
  )
}
