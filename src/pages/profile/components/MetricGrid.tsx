import { Text, View } from '@tarojs/components'
import { router } from '@/shared/router'
import type { MetricItem } from '../types'

interface MetricGridProps {
  items: MetricItem[]
}

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <View className='grid grid-cols-4 overflow-hidden rounded-lg bg-white shadow-soft'>
      {items.map((item, index) => (
        <View
          key={item.label}
          className={`px-2 py-4 text-center ${index === items.length - 1 ? '' : 'border-r border-line'}`}
          onClick={() => router.to(item.path)}
        >
          <Text className={`block text-lg font-bold ${item.color}`}>{item.value}</Text>
          <Text className='mt-1 block text-xs text-muted'>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
