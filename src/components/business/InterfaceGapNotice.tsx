import { Text, View } from '@tarojs/components'
import { SectionCard } from './SectionCard'

interface InterfaceGapNoticeProps {
  title: string
  desc: string
  items: string[]
}

export function InterfaceGapNotice({ title, desc, items }: InterfaceGapNoticeProps) {
  return (
    <SectionCard title={title}>
      <Text className="block text-sm leading-6 text-muted">{desc}</Text>
      <View className="mt-3 grid gap-2">
        {items.map((item) => (
          <View key={item} className="rounded-lg bg-canvas px-3 py-2">
            <Text className="text-sm leading-5 text-muted">{item}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  )
}
