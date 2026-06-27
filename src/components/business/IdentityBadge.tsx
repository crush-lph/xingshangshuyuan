import { Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
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
  iconColor: string
  solidClassName: string
  softClassName: string
}

const visualByType: Record<UserIdentityType, IdentityVisualConfig> = {
  elite: {
    iconBg: 'bg-gold-soft',
    iconColor: '#C8960C',
    solidClassName: 'border border-[#F0B429]/35 bg-[#FFF3D0] text-gold',
    softClassName: 'border border-[#F0B429]/30 bg-white/10 text-gold-light'
  },
  navigator: {
    iconBg: 'bg-[#102B72]',
    iconColor: '#F0B429',
    solidClassName: 'border border-[#F0B429]/55 bg-brand-deep text-gold-light',
    softClassName: 'border border-[#F0B429]/40 bg-[#050E2E] text-gold-light'
  },
  admin: {
    iconBg: 'bg-[#EAF3FF]',
    iconColor: '#1677FF',
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
        <AppIcon name={identity.icon} size={isSmall ? 11 : 13} color={visual.iconColor} />
      </View>
      <Text className={`${isSmall ? 'text-xs' : 'text-xs'} font-semibold leading-none`}>{identity.label}</Text>
    </View>
  )
}
