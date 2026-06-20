import { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

interface SectionCardProps {
  title?: string
  more?: string
  children: ReactNode
}

export function SectionCard({ title, more, children }: SectionCardProps) {
  return (
    <View className='rounded-lg bg-white p-4 shadow-soft'>
      {title ? (
        <View className='mb-3 flex items-center justify-between'>
          <Text className='text-base font-bold text-ink'>{title}</Text>
          {more ? <Text className='text-xs font-medium text-tech'>{more}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  )
}
