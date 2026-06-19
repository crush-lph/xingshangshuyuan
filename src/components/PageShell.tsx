import { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'

interface PageShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <View className='min-h-screen bg-[#f6f8f6] px-4 py-5 text-ink'>
      <View className='rounded-lg bg-white px-5 py-6 shadow-soft'>
        <Text className='block text-2xl font-semibold leading-tight text-ink'>{title}</Text>
        <Text className='mt-2 block text-sm leading-6 text-[#66736d]'>{subtitle}</Text>
      </View>
      <View className='mt-4'>{children}</View>
    </View>
  )
}
