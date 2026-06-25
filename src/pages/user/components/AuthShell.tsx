import { ReactNode } from 'react'
import { Text, View } from '@tarojs/components'

interface AuthShellProps {
  stepLabel: string
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthShell({ stepLabel, title, subtitle, children }: AuthShellProps) {
  return (
    <View className="min-h-screen bg-canvas px-5 pt-10 text-ink">
      <View className="mb-7">
        <View className="mb-4 flex items-center justify-between">
          <Text className="text-sm font-semibold text-brand">行商书苑</Text>
          <Text className="text-xs font-medium text-muted">{stepLabel}</Text>
        </View>
        <Text className="block text-xl font-bold leading-tight text-ink">{title}</Text>
        <Text className="mt-2 block text-sm leading-6 text-muted">{subtitle}</Text>
      </View>

      <View>{children}</View>
    </View>
  )
}
