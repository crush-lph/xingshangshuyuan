import type { AppIconName } from './app-icons'
import { numberOf, textOf } from './view-data'

export type UserIdentityType = 'elite' | 'navigator' | 'admin'

export interface UserIdentitySource {
  role?: number | string | null
  role_text?: string | null
  vip_level?: number | string | null
  vip_level_text?: string | null
}

export interface UserIdentity {
  type: UserIdentityType
  label: string
  shortLabel: string
  desc: string
  icon: AppIconName
}

const identityByType: Record<UserIdentityType, UserIdentity> = {
  elite: {
    type: 'elite',
    label: '行商 · 菁英会员',
    shortLabel: '菁英',
    desc: '已加入行商生态，享基础会员权益',
    icon: 'star-line'
  },
  navigator: {
    type: 'navigator',
    label: '行商 · 领航会员',
    shortLabel: '领航',
    desc: '付费会员身份，享优先资源与战略底价',
    icon: 'trophy-line'
  },
  admin: {
    type: 'admin',
    label: '平台管理员',
    shortLabel: '管理员',
    desc: '平台运营权限，可处理审核与后台任务',
    icon: 'shield-check-line'
  }
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword))
}

export function getUserIdentity(source?: UserIdentitySource | null): UserIdentity {
  const roleText = textOf(source?.role_text)?.toLowerCase() ?? ''
  const vipText = textOf(source?.vip_level_text) ?? ''
  const role = numberOf(source?.role)
  const vipLevel = numberOf(source?.vip_level) ?? 0

  if (role === 9 || includesAny(roleText, ['admin', '管理员', '后台', '平台'])) {
    return identityByType.admin
  }

  if (vipLevel >= 2 || includesAny(vipText, ['领航', '付费', '高级', 'navigator'])) {
    return identityByType.navigator
  }

  return identityByType.elite
}
