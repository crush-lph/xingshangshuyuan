import { ReactNode, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'

interface PageShellProps {
  title: string
  subtitle: string
  eyebrow?: string
  showHeader?: boolean
  children: ReactNode
}

export function PageShell({ title, subtitle, eyebrow, showHeader = true, children }: PageShellProps) {
  useEffect(() => {
    void Taro.setNavigationBarTitle({ title })
  }, [title])

  return (
    <View className="min-h-screen bg-canvas text-ink">
      <View className="px-4 pb-6 pt-4">
        {showHeader ? (
          <View className="mb-4">
            {eyebrow ? <Text className="block text-xs font-semibold text-brand">{eyebrow}</Text> : null}
            <Text className="block text-2xl font-bold text-ink">{title}</Text>
            <Text className="mt-2 block text-sm leading-6 text-muted">{subtitle}</Text>
          </View>
        ) : null}
        {children}
      </View>
    </View>
  )
}
