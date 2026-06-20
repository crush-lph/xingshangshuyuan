import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { router } from '@/shared/router'
import type { MenuItem } from '../types'

interface MenuGroupProps {
  items: MenuItem[]
}

function openPath(path?: MenuItem['path']) {
  if (path) {
    router.to(path)
    return
  }

  Taro.showToast({
    title: '功能建设中',
    icon: 'none'
  })
}

export function MenuGroup({ items }: MenuGroupProps) {
  return (
    <View className="overflow-hidden rounded-lg bg-white shadow-soft">
      {items.map((item, index) => (
        <View
          key={item.label}
          className={`flex items-center gap-3 px-4 py-4 ${index === items.length - 1 ? '' : 'border-b border-line'}`}
          onClick={() => openPath(item.path)}
        >
          <View className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
            <Text className="text-sm font-bold">{item.icon}</Text>
          </View>
          <Text className="flex-1 text-sm font-semibold text-ink">{item.label}</Text>
          {item.value ? <Text className="text-sm font-bold text-gold">{item.value}</Text> : null}
          {item.badge ? (
            <Text className="rounded bg-brand-soft px-2 py-1 text-xs font-medium text-brand">{item.badge}</Text>
          ) : null}
          <Text className="text-xl leading-none text-line">›</Text>
        </View>
      ))}
    </View>
  )
}
