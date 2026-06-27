import { Image, Text, View } from '@tarojs/components'
import eliteIcon from '@/assets/identity/identity-elite.png'
import adminIcon from '@/assets/identity/identity-admin.png'
import navigatorIcon from '@/assets/identity/identity-navigator.png'

const identityIcons = [
  {
    label: '菁英会员',
    src: eliteIcon
  },
  {
    label: '管理员',
    src: adminIcon
  },
  {
    label: '领航会员',
    src: navigatorIcon
  }
]

export function IdentityIconPreview() {
  return (
    <View className="rounded-lg bg-white px-4 py-4 shadow-soft">
      <Text className="block text-sm font-semibold text-ink">身份图标预览</Text>
      <View className="mt-4 grid grid-cols-3 gap-3">
        {identityIcons.map((item) => (
          <View key={item.label} className="flex flex-col items-center">
            <View className="flex h-16 w-16 items-center justify-center rounded bg-canvas">
              <Image className="h-12 w-12" src={item.src} mode="aspectFit" />
            </View>
            <Text className="mt-2 block text-xs text-muted">{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
