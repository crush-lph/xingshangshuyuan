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
  getUserProfile
} from '@/services'
import { accountMenus, memberActions, serviceMenus } from './profile.data'
import type { ManagerInfo, MetricItem } from './types'
import { isRecord, textOf } from '@/shared/view-data'
import { routes } from '@/shared/router'
import { getUserIdentity, type UserIdentity } from '@/shared/user-identity'

export default function ProfilePage() {
  const [metricItems, setMetricItems] = useState<MetricItem[]>([
    { label: '我的订单', value: '--', color: 'text-brand', path: routes.userOrders },
    { label: '我的活动', value: '--', color: 'text-brand', path: routes.userEvents },
    { label: '我的积分', value: '--', color: 'text-gold', path: routes.userPoints },
    { label: '我的评价', value: '--', color: 'text-[#38A169]', path: routes.userReviews }
  ])
  const [serviceMenuItems, setServiceMenuItems] = useState(serviceMenus)
  const [accountMenuItems, setAccountMenuItems] = useState(accountMenus)
  const [identity, setIdentity] = useState<UserIdentity>(() => getUserIdentity())
  const [manager, setManager] = useState<ManagerInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      setIsLoading(true)
      setHasError(false)

      const [userInfoResult, profileResult, unreadResult, learningResult, customerServiceResult] =
        await Promise.allSettled([
          getUserInfo(),
          getUserProfile(),
          getUnreadMessageCount(),
          getUserLearningStats(),
          getCustomerServiceConfig()
        ])

      if (profileResult.status === 'fulfilled') {
        const profile = profileResult.value.data
        const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value.data : undefined
        setIdentity(getUserIdentity({ ...userInfo, ...profile }))

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
      } else if (userInfoResult.status === 'fulfilled') {
        setIdentity(getUserIdentity(userInfoResult.value.data))
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
        [userInfoResult, profileResult, unreadResult, learningResult, customerServiceResult].every(
          (result) => result.status === 'rejected'
        )
      )
    }

    void loadProfileData()
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <View className="bg-brand px-5 pb-8 pt-5">
        <ProfileHeader />
        <MemberCard actions={memberActions} identity={identity} />
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
