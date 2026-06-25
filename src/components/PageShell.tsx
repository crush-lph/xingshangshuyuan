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
    <View className="min-h-screen bg-canvas text-ink">
      <View className="relative overflow-hidden bg-brand px-5 pb-7 pt-5">
        <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <View className="absolute -bottom-12 left-6 h-32 w-32 rounded-full bg-gold/10" />
        <View className="relative">
          {eyebrow ? <Text className="mb-2 block text-xs font-semibold text-gold-light">{eyebrow}</Text> : null}
          <Text className="block text-xl font-bold leading-tight text-white">{title}</Text>
          <Text className="mt-2 block text-sm leading-6 text-white/70">{subtitle}</Text>
        </View>
      </View>
      <View className="-mt-3 px-4 pb-6 pt-0">{children}</View>
    </View>
  )
}
