import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { StateNotice } from '@/components/business'
import { ManagerCard } from './components/ManagerCard'
import { MemberCard } from './components/MemberCard'
import { MenuGroup } from './components/MenuGroup'
import { MetricGrid } from './components/MetricGrid'
import { ProfileHeader } from './components/ProfileHeader'
import {
  getCustomerServiceConfig,
  getUnreadMessageCount,
  getUserInfo,
  getUserLearningStats,
  getUserProfile,
  getUserVip
} from '@/services'
import { accountMenus, memberActions, serviceMenus } from './profile.data'
import type { ManagerInfo, MetricItem } from './types'
import { isRecord, numberOf, textOf } from '@/shared/view-data'
import { routes } from '@/shared/router'
import { getUserIdentity, type UserIdentity } from '@/shared/user-identity'
import { useUserInfo } from '@/stores/user-info'

function isPaidMember(value: unknown, label?: unknown) {
  const level = numberOf(value) ?? 0
  const levelText = textOf(label)?.toLowerCase() ?? ''

  return level >= 2 || ['领航', '付费', '高级', 'navigator'].some((keyword) => levelText.includes(keyword))
}

function formatExpireText(value: unknown) {
  const expireAt = textOf(value)

  if (!expireAt) {
    return undefined
  }

  const dateText = expireAt.split(/[T ]/)[0] ?? expireAt
  return `到期：${dateText}`
}

function hasUserIdentityData(value: {
  id?: unknown
  user_id?: unknown
  nickname?: unknown
  phone?: unknown
  company_name?: unknown
}) {
  return Boolean(
    numberOf(value.id) ||
    numberOf(value.user_id) ||
    textOf(value.nickname) ||
    textOf(value.phone) ||
    textOf(value.company_name)
  )
}

function hasVipIdentityData(value: {
  level?: unknown
  vip_level?: unknown
  level_text?: unknown
  vip_level_text?: unknown
}) {
  return Boolean(numberOf(value.vip_level ?? value.level) || textOf(value.vip_level_text) || textOf(value.level_text))
}

export default function ProfilePage() {
  const isLoggedIn = useUserInfo((state) => state.isLoggedIn)
  const userRefreshVersion = useUserInfo((state) => state.refreshVersion)
  const [metricItems, setMetricItems] = useState<MetricItem[]>([
    { label: '我的订单', value: '--', color: 'text-brand', path: routes.userOrders },
    { label: '我的活动', value: '--', color: 'text-brand', path: routes.userEvents },
    { label: '我的积分', value: '--', color: 'text-gold', path: routes.userPoints },
    { label: '我的评价', value: '--', color: 'text-[#38A169]', path: routes.userReviews }
  ])
  const [serviceMenuItems, setServiceMenuItems] = useState(serviceMenus)
  const [accountMenuItems, setAccountMenuItems] = useState(accountMenus)
  const [memberIdentity, setMemberIdentity] = useState<UserIdentity | null>(null)
  const [memberLevelText, setMemberLevelText] = useState<string>()
  const [memberExpireText, setMemberExpireText] = useState<string>()
  const [manager, setManager] = useState<ManagerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true)
      setHasError(false)
      setMemberIdentity(null)
      setMemberLevelText(undefined)
      setMemberExpireText(undefined)

      const [userInfoResult, profileResult, vipResult, unreadResult, learningResult, customerServiceResult] =
        await Promise.allSettled([
          getUserInfo(),
          getUserProfile(),
          getUserVip(),
          getUnreadMessageCount(),
          getUserLearningStats(),
          getCustomerServiceConfig()
        ])

      if (profileResult.status === 'fulfilled' && hasUserIdentityData(profileResult.value.data)) {
        const profile = profileResult.value.data
        setMemberIdentity(getUserIdentity({ vip_level: profile.vip_level, vip_level_text: profile.vip_level_text }))
        setMemberLevelText(textOf(profile.vip_level_text))

        setAccountMenuItems((items) =>
          items.map((item) =>
            item.label === '企业认证'
              ? {
                  ...item,
                  badge: textOf(profile.certification_status_text)
                }
              : item
          )
        )
      } else if (userInfoResult.status === 'fulfilled' && hasUserIdentityData(userInfoResult.value.data)) {
        const userInfo = userInfoResult.value.data
        setMemberIdentity(getUserIdentity({ vip_level: userInfo.vip_level, vip_level_text: userInfo.vip_level_text }))
        setMemberLevelText(textOf(userInfo.vip_level_text))
      }

      if (vipResult.status === 'fulfilled' && hasVipIdentityData(vipResult.value.data)) {
        const vip = vipResult.value.data
        const vipLevel = vip.vip_level ?? vip.level
        const vipLevelText = textOf(vip.vip_level_text) ?? textOf(vip.level_text)

        setMemberIdentity(getUserIdentity({ vip_level: vipLevel, vip_level_text: vipLevelText }))
        setMemberLevelText(vipLevelText)
        setMemberExpireText(isPaidMember(vipLevel, vipLevelText) ? formatExpireText(vip.expire_at) : undefined)
      }

      if (unreadResult.status === 'fulfilled') {
        const unreadCount = unreadResult.value.data.unread_count ?? 0
        setServiceMenuItems((items) =>
          items.map((item) =>
            item.label === '我的商机'
              ? {
                  ...item,
                  badge: unreadCount > 0 ? `${unreadCount}条未读` : undefined
                }
              : item
          )
        )
      }

      if (learningResult.status === 'fulfilled') {
        const learning = learningResult.value.data
        setMetricItems([
          { label: '我的订单', value: '--', color: 'text-brand', path: routes.userOrders },
          { label: '我的活动', value: '--', color: 'text-brand', path: routes.userEvents },
          {
            label: '证书记录',
            value: learning.certificates_count === undefined ? '--' : String(learning.certificates_count),
            color: 'text-gold',
            path: routes.userPoints
          },
          {
            label: '已学课程',
            value: learning.completed_courses === undefined ? '--' : String(learning.completed_courses),
            color: 'text-[#38A169]',
            path: routes.userEvents
          }
        ])
      }

      if (customerServiceResult.status === 'fulfilled' && isRecord(customerServiceResult.value.data)) {
        const name = textOf(customerServiceResult.value.data.name ?? customerServiceResult.value.data.manager_name)
        const phone = textOf(customerServiceResult.value.data.phone ?? customerServiceResult.value.data.manager_phone)

        if (name && phone) {
          setManager({ name, phone })
        }
      }

      setHasError(
        [userInfoResult, profileResult, vipResult, unreadResult, learningResult, customerServiceResult].every(
          (result) => result.status === 'rejected'
        )
      )
    }

    void loadProfileData()
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [userRefreshVersion])

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <View className="bg-brand px-5 pb-8 pt-5">
        <ProfileHeader />
        {isLoggedIn && memberIdentity ? (
          <MemberCard
            actions={memberActions}
            expireText={memberExpireText}
            identity={memberIdentity}
            levelText={memberLevelText}
          />
        ) : null}
      </View>

      <View className="-mt-4 px-4">
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : (
          <MetricGrid items={metricItems} />
        )}

        <View className="mt-3">
          <MenuGroup items={serviceMenuItems} />
        </View>

        <View className="mt-3">
          <MenuGroup items={accountMenuItems} />
        </View>

        {manager ? <ManagerCard manager={manager} /> : null}
      </View>
    </View>
  )
}
