import { ReactNode } from 'react'
import { View, Text } from '@tarojs/components'

interface PageShellProps {
  title: string
  subtitle: string
  eyebrow?: string
  children: ReactNode
}

export function PageShell({ title, subtitle, eyebrow, children }: PageShellProps) {
  return (
    <View className='min-h-screen bg-canvas text-ink'>
      <View className='bg-brand px-5 pb-6 pt-5'>
        {eyebrow ? (
          <Text className='mb-2 block text-xs font-semibold text-[#f0b429]'>{eyebrow}</Text>
        ) : null}
        <Text className='block text-xl font-bold leading-tight text-white'>{title}</Text>
        <Text className='mt-2 block text-sm leading-6 text-white/70'>{subtitle}</Text>
      </View>
      <View className='px-4 py-4'>{children}</View>
    </View>
  )
}
