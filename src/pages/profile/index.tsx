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
import { accountMenus, adminMenus, memberActions, serviceMenus } from './profile.data'
import type { ManagerInfo, MetricItem } from './types'
import { isRecord, numberOf, textOf } from '@/shared/view-data'
import { routes } from '@/shared/router'
import { getUserIdentity, type UserIdentity } from '@/shared/user-identity'
import { useUserInfo } from '@/stores/user-info'

const defaultMetricItems: MetricItem[] = [
  { label: '我的订单', value: '--', color: 'text-brand', path: routes.userOrders },
  { label: '我的活动', value: '--', color: 'text-brand', path: routes.userEvents },
  { label: '我的积分', value: '--', color: 'text-gold', path: routes.userPoints },
  { label: '我的评价', value: '--', color: 'text-[#38A169]', path: routes.userReviews }
]

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

function isAdminRole(value: { role?: unknown; role_text?: unknown }) {
  return (
    getUserIdentity({ role: numberOf(value.role) ?? textOf(value.role), role_text: textOf(value.role_text) }).type ===
    'admin'
  )
}

function getManagerInfo(value: unknown): ManagerInfo {
  const data = isRecord(value) ? value : {}
  const name = textOf(data.name ?? data.manager_name ?? data.manager)
  const phone = textOf(data.phone ?? data.manager_phone ?? data.mobile ?? data.tel)
  const qrcodeUrl = textOf(data.qrcode_url ?? data.qr_code_url ?? data.qrcode ?? data.qr_code)

  return {
    name: name ?? '专属客户经理',
    phone,
    qrcodeUrl
  }
}

export default function ProfilePage() {
  const isLoggedIn = useUserInfo((state) => state.isLoggedIn)
  const userRefreshVersion = useUserInfo((state) => state.refreshVersion)
  const [metricItems, setMetricItems] = useState<MetricItem[]>(defaultMetricItems)
  const [serviceMenuItems, setServiceMenuItems] = useState(serviceMenus)
  const [accountMenuItems, setAccountMenuItems] = useState(accountMenus)
  const [memberIdentity, setMemberIdentity] = useState<UserIdentity | null>(null)
  const [memberLevelText, setMemberLevelText] = useState<string>()
  const [memberExpireText, setMemberExpireText] = useState<string>()
  const [manager, setManager] = useState<ManagerInfo | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const visibleServiceMenuItems = isAdmin ? [...serviceMenuItems, ...adminMenus] : serviceMenuItems

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true)
      setHasError(false)
      setMemberIdentity(null)
      setMemberLevelText(undefined)
      setMemberExpireText(undefined)
      setIsAdmin(false)
      setMetricItems(defaultMetricItems)
      setServiceMenuItems(serviceMenus)
      setAccountMenuItems(accountMenus)
      setManager(null)

      if (!isLoggedIn) {
        const customerServiceResult = await getCustomerServiceConfig()
          .then((response) => ({ status: 'fulfilled' as const, value: response }))
          .catch((reason) => ({ status: 'rejected' as const, reason }))

        if (customerServiceResult.status === 'fulfilled') {
          setManager(getManagerInfo(customerServiceResult.value.data))
        } else {
          setManager(getManagerInfo(null))
        }

        return
      }

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
        setIsAdmin(isAdminRole(profile))
        setMemberIdentity(
          getUserIdentity({
            vip_level: profile.vip_level,
            vip_level_text: profile.vip_level_text
          })
        )
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
        setIsAdmin(isAdminRole(userInfo))
        setMemberIdentity(
          getUserIdentity({
            vip_level: userInfo.vip_level,
            vip_level_text: userInfo.vip_level_text
          })
        )
        setMemberLevelText(textOf(userInfo.vip_level_text))
      }

      if (userInfoResult.status === 'fulfilled' && hasUserIdentityData(userInfoResult.value.data)) {
        setIsAdmin((current) => current || isAdminRole(userInfoResult.value.data))
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
            item.label === '消息中心'
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
          defaultMetricItems[0],
          defaultMetricItems[1],
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
            path: routes.userCourses
          }
        ])
      }

      if (customerServiceResult.status === 'fulfilled') {
        setManager(getManagerInfo(customerServiceResult.value.data))
      } else {
        setManager(getManagerInfo(null))
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
  }, [isLoggedIn, userRefreshVersion])

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
          <MenuGroup items={visibleServiceMenuItems} />
        </View>

        <View className="mt-3">
          <MenuGroup items={accountMenuItems} />
        </View>

        {manager ? <ManagerCard manager={manager} /> : null}
      </View>
    </View>
  )
}
