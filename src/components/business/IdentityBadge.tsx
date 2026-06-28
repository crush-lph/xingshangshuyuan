import { Image, Text, View } from '@tarojs/components'
import eliteIcon from '@/assets/identity/identity-elite.png'
import adminIcon from '@/assets/identity/identity-admin.png'
import navigatorIcon from '@/assets/identity/identity-navigator.png'
import type { UserIdentity, UserIdentityType } from '@/shared/user-identity'

type IdentityBadgeVariant = 'solid' | 'soft'
type IdentityBadgeSize = 'sm' | 'md'

interface IdentityBadgeProps {
  identity: UserIdentity
  variant?: IdentityBadgeVariant
  size?: IdentityBadgeSize
}

interface IdentityVisualConfig {
  iconBg: string
  iconSrc: string
  solidClassName: string
  softClassName: string
}

const visualByType: Record<UserIdentityType, IdentityVisualConfig> = {
  elite: {
    iconBg: 'bg-[#EAF7FF]',
    iconSrc: eliteIcon,
    solidClassName: 'border border-[#58AAEE]/35 bg-[#EAF7FF] text-[#2675D6]',
    softClassName: 'border border-[#9BE8FF]/40 bg-white/10 text-[#A7E7FF]'
  },
  navigator: {
    iconBg: 'bg-[#102B72]',
    iconSrc: navigatorIcon,
    solidClassName: 'border border-[#F0B429]/55 bg-brand-deep text-gold-light',
    softClassName: 'border border-[#F0B429]/40 bg-[#050E2E] text-gold-light'
  },
  admin: {
    iconBg: 'bg-[#EAF3FF]',
    iconSrc: adminIcon,
    solidClassName: 'border border-[#1677FF]/25 bg-[#EAF3FF] text-tech',
    softClassName: 'border border-[#1677FF]/35 bg-white/10 text-white'
  }
}

export function IdentityBadge({ identity, size = 'md', variant = 'solid' }: IdentityBadgeProps) {
  const visual = visualByType[identity.type]
  const isSmall = size === 'sm'
  const className = variant === 'soft' ? visual.softClassName : visual.solidClassName

  return (
    <View className={`flex items-center gap-1 rounded px-2 ${isSmall ? 'py-1' : 'py-1.5'} ${className}`}>
      <View className={`flex items-center justify-center rounded ${visual.iconBg} ${isSmall ? 'h-4 w-4' : 'h-5 w-5'}`}>
        <Image className={isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4'} src={visual.iconSrc} mode="aspectFit" />
      </View>
      <Text className={`${isSmall ? 'text-xs' : 'text-xs'} font-semibold leading-none`}>{identity.label}</Text>
    </View>
  )
}
