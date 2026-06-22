import { Text, View } from '@tarojs/components'
import { router } from '@/shared/router'
import type { MemberAction } from '../types'

interface MemberCardProps {
  actions: MemberAction[]
  levelText?: string
  expireText?: string
}

export function MemberCard({ actions, expireText, levelText }: MemberCardProps) {
  return (
    <View className="mt-5 rounded-lg bg-brand-deep px-4 py-4 shadow-medium">
      <View className="flex items-center justify-between">
        <View>
          <Text className="block text-xs text-white/60">当前等级</Text>
          <Text className="mt-1 block text-lg font-bold text-gold-light">{levelText ?? '暂无会员信息'}</Text>
        </View>
        {expireText ? <Text className="rounded bg-white/10 px-2 py-1 text-xs text-white/75">{expireText}</Text> : null}
      </View>

      <View className="mt-4 grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <View
            key={action.label}
            className="rounded bg-white/10 px-2 py-2 text-center"
            onClick={() => router.to(action.path)}
          >
            <Text className="text-xs font-semibold text-white">{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
