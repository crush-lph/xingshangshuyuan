import { Text, View } from '@tarojs/components'
import { IdentityBadge } from '@/components/business'
import { router } from '@/shared/router'
import type { UserIdentity } from '@/shared/user-identity'
import type { MemberAction } from '../types'

interface MemberCardProps {
  actions: MemberAction[]
  identity: UserIdentity
  levelText?: string
  expireText?: string
}

const cardClassNameByType: Record<UserIdentity['type'], string> = {
  elite: 'bg-brand-deep',
  navigator: 'bg-[#050E2E]',
  admin: 'bg-[#0B2C5F]'
}

export function MemberCard({ actions, expireText, identity, levelText }: MemberCardProps) {
  return (
    <View className={`mt-5 rounded-lg px-4 py-4 shadow-medium ${cardClassNameByType[identity.type]}`}>
      <View className="flex items-center justify-between">
        <View className="min-w-0 flex-1">
          <Text className="block text-xs text-white/60">当前身份</Text>
          <Text className="mt-1 block text-lg font-bold text-gold-light">{levelText ?? identity.label}</Text>
          <Text className="mt-1 block text-xs text-white/55">{identity.desc}</Text>
        </View>
        {expireText ? <Text className="rounded bg-white/10 px-2 py-1 text-xs text-white/75">{expireText}</Text> : null}
      </View>

      <View className="mt-3">
        <IdentityBadge identity={identity} variant="soft" />
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
