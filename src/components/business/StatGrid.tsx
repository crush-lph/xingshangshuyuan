import { Text, View } from '@tarojs/components'
import type { StatItem } from './types'

interface StatGridProps {
  items: StatItem[]
}

const toneClassName: Record<NonNullable<StatItem['tone']>, string> = {
  brand: 'text-brand',
  gold: 'text-gold',
  success: 'text-[#38A169]',
  danger: 'text-[#E53E3E]'
}

export function StatGrid({ items }: StatGridProps) {
  return (
    <View className="grid grid-cols-3 overflow-hidden rounded-lg bg-brand-deep shadow-medium">
      {items.map((item, index) => (
        <View
          key={item.label}
          className={`px-2 py-4 text-center ${index === items.length - 1 ? '' : 'border-r border-white/10'}`}
        >
          <Text className={`block text-lg font-bold ${toneClassName[item.tone ?? 'brand']}`}>{item.value}</Text>
          <Text className="mt-1 block text-xs text-white/60">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
