import { Text, View } from '@tarojs/components'
import { ActionBar } from './ActionBar'
import type { ActionItem } from './types'

interface EmptyStateProps {
  title?: string
  desc?: string
  actions?: ActionItem[]
}

export function EmptyState({ title = '暂无数据', desc = '当前接口没有返回可展示内容。', actions }: EmptyStateProps) {
  return (
    <View className="rounded-lg border border-dashed border-line bg-white px-4 py-8 text-center shadow-soft">
      <View className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-canvas">
        <Text className="text-lg text-muted">—</Text>
      </View>
      <Text className="block text-base font-semibold text-ink">{title}</Text>
      <Text className="mt-2 block text-sm leading-6 text-muted">{desc}</Text>
      {actions?.length ? (
        <View className="mt-4">
          <ActionBar actions={actions} />
        </View>
      ) : null}
    </View>
  )
}
