import { Text, View } from '@tarojs/components'
import type { StatItem } from './types'

interface StatGridProps {
  items: StatItem[]
}

const toneClassName: Record<NonNullable<StatItem['tone']>, string> = {
  brand: 'bg-brand-soft text-brand',
  gold: 'bg-gold-soft text-gold',
  success: 'bg-[#E6F7F0] text-[#2F855A]',
  danger: 'bg-[#FFF0F0] text-[#C53030]'
}

export function StatGrid({ items }: StatGridProps) {
  return (
    <View className="grid max-w-full grid-cols-3 gap-2 overflow-hidden rounded-lg border border-line bg-white p-2 shadow-soft">
      {items.map((item) => (
        <View
          key={item.label}
          className={`min-w-0 rounded-lg px-2 py-3 text-center ${toneClassName[item.tone ?? 'brand']}`}
        >
          <Text className="block truncate text-lg font-bold leading-6">{item.value}</Text>
          <Text className="mt-1 block truncate text-xs font-semibold leading-5 text-ink/80">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
