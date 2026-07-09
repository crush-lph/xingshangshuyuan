import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import type { ManagerInfo } from '../types'

interface ManagerCardProps {
  manager: ManagerInfo
}

export function ManagerCard({ manager }: ManagerCardProps) {
  function handleContact() {
    if (manager.phone) {
      Taro.makePhoneCall({
        phoneNumber: manager.phone
      })
      return
    }

    if (manager.qrcodeUrl) {
      Taro.previewImage({
        urls: [manager.qrcodeUrl],
        current: manager.qrcodeUrl
      })
      return
    }

    Taro.showToast({ title: '客户经理联系方式待配置', icon: 'none' })
  }

  return (
    <View className="mt-3 rounded-lg bg-white p-4 shadow-soft">
      <View className="flex items-center gap-3">
        <View className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          {manager.qrcodeUrl ? (
            <Image className="h-12 w-12 rounded-full" mode="aspectFill" src={manager.qrcodeUrl} />
          ) : (
            <AppIcon name="customer-service-2-line" size={24} />
          )}
        </View>
        <View className="min-w-0 flex-1">
          <Text className="block text-sm font-bold text-ink">{manager.name} · 专属客户经理</Text>
          <Text className="mt-1 block text-xs leading-5 text-muted">
            {manager.phone ? manager.phone : '为你处理资源匹配、课程咨询和商机服务'}
          </Text>
        </View>
        <Button size="small" fill="outline" className="h-9 rounded-full px-4" onClick={handleContact}>
          联系
        </Button>
      </View>
    </View>
  )
}
