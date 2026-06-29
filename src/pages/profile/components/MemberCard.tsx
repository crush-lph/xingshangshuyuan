import { Image, Text, View } from '@tarojs/components'
import adminLogo from '@/assets/identity/identity-admin.png'
import eliteLogo from '@/assets/identity/identity-elite.png'
import navigatorLogo from '@/assets/identity/identity-navigator.png'
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

const logoByType: Record<UserIdentity['type'], string> = {
  elite: eliteLogo,
  navigator: navigatorLogo,
  admin: adminLogo
}

export function MemberCard({ actions, expireText, identity, levelText }: MemberCardProps) {
  return (
    <View className={`mt-5 rounded-lg px-4 py-4 shadow-medium ${cardClassNameByType[identity.type]}`}>
      <View className="flex items-center justify-between gap-3">
        <Text className="text-xs text-white/60">当前等级</Text>
        {expireText ? <Text className="rounded bg-white/10 px-2 py-1 text-xs text-white/75">{expireText}</Text> : null}
      </View>

      <View className="mt-3 flex min-w-0 self-start rounded bg-white/10 px-2 py-1.5">
        <View className="flex min-w-0 items-center gap-1.5">
          <Image className="h-6 w-6 shrink-0" src={logoByType[identity.type]} mode="aspectFit" />
          <Text className="block truncate text-sm font-bold text-gold-light">{levelText ?? identity.label}</Text>
        </View>
      </View>

      <View className="mt-4 grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <View
            key={action.label}
            className="rounded-lg bg-white/10 px-2 py-2 text-center"
            onClick={() => router.to(action.path)}
          >
            <Text className="text-xs font-semibold text-white">{action.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
