import { Text, View } from '@tarojs/components'
import { PageShell } from '@/components/PageShell'

interface PrototypeRoutePageProps {
  group: string
  title: string
}

export function PrototypeRoutePage({ group, title }: PrototypeRoutePageProps) {
  return (
    <PageShell title={title} subtitle={`${group}模块页面，后续按原型补充具体交互和内容。`}>
      <View className='rounded-lg bg-white p-4 shadow-soft'>
        <Text className='block text-xs font-semibold text-gold'>{group}</Text>
        <Text className='mt-2 block text-lg font-bold text-ink'>{title}</Text>
        <Text className='mt-2 block text-sm leading-6 text-muted'>
          当前已完成路由和分包占位，页面内容将按原型逐步实现。
        </Text>
      </View>
    </PageShell>
  )
}
