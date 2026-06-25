import { ReactNode, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'

interface PageShellProps {
  title: string
  subtitle: string
  eyebrow?: string
  children: ReactNode
}

export function PageShell({ title, children }: PageShellProps) {
  useEffect(() => {
    void Taro.setNavigationBarTitle({ title })
  }, [title])

  return (
    <View className="min-h-screen bg-canvas text-ink">
      <View className="px-4 pb-6 pt-3">{children}</View>
    </View>
  )
}
