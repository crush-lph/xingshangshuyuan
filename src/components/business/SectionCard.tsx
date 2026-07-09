import { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

interface SectionCardProps {
  title?: string
  more?: string
  children: ReactNode
}

export function SectionCard({ title, more, children }: SectionCardProps) {
  return (
    <View className="max-w-full overflow-hidden rounded-lg bg-white p-4 shadow-soft">
      {title ? (
        <View className="mb-3 flex items-center justify-between">
          <View className="flex items-center gap-2">
            <View className="h-4 w-1 rounded bg-gold" />
            <Text className="text-base font-bold text-ink">{title}</Text>
          </View>
          {more ? <Text className="text-xs font-semibold text-tech">{more}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  )
}
