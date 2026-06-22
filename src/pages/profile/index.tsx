import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { EmptyState } from '@/components/business'
import { ManagerCard } from './components/ManagerCard'
import { MemberCard } from './components/MemberCard'
import { MenuGroup } from './components/MenuGroup'
import { MetricGrid } from './components/MetricGrid'
import { ProfileHeader } from './components/ProfileHeader'
import { getCustomerServiceConfig, getUnreadMessageCount, getUserLearningStats, getUserProfile } from '@/services'
import { accountMenus, memberActions, serviceMenus } from './profile.data'
import type { ManagerInfo, MetricItem } from './types'
import { isRecord, textOf } from '@/shared/view-data'
import { routes } from '@/shared/router'

export default function ProfilePage() {
  const [metricItems, setMetricItems] = useState<MetricItem[]>([])
  const [serviceMenuItems, setServiceMenuItems] = useState(serviceMenus)
  const [accountMenuItems, setAccountMenuItems] = useState(accountMenus)
  const [memberLevelText, setMemberLevelText] = useState<string | undefined>()
  const [manager, setManager] = useState<ManagerInfo | null>(null)

  useEffect(() => {
    async function loadProfileData() {
      const [profileResult, unreadResult, learningResult, customerServiceResult] = await Promise.allSettled([
        getUserProfile(),
        getUnreadMessageCount(),
        getUserLearningStats(),
        getCustomerServiceConfig()
      ])

      if (profileResult.status === 'fulfilled') {
        const profile = profileResult.value.data
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
        setMetricItems(
          [
            { label: '我的订单', value: undefined, color: 'text-brand', path: routes.userOrders },
            { label: '我的活动', value: learning.total_courses, color: 'text-brand', path: routes.userEvents },
            { label: '我的积分', value: learning.certificates_count, color: 'text-gold', path: routes.userPoints },
            { label: '已完成', value: learning.completed_courses, color: 'text-[#38A169]', path: routes.userReviews }
          ]
            .filter((item) => item.value !== undefined && item.value !== null)
            .map((item) => ({ ...item, value: String(item.value) }))
        )
      }

      if (customerServiceResult.status === 'fulfilled' && isRecord(customerServiceResult.value.data)) {
        const name = textOf(customerServiceResult.value.data.name ?? customerServiceResult.value.data.manager_name)
        const phone = textOf(customerServiceResult.value.data.phone ?? customerServiceResult.value.data.manager_phone)

        if (name && phone) {
          setManager({ name, phone })
        }
      }
    }

    void loadProfileData()
  }, [])

  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <View className="bg-brand px-5 pb-8 pt-5">
        <ProfileHeader />
        <MemberCard actions={memberActions} levelText={memberLevelText} />
      </View>

      <View className="-mt-4 px-4">
        {metricItems.length ? (
          <MetricGrid items={metricItems} />
        ) : (
          <EmptyState title="暂无个人统计" desc="Apifox mock 未返回学习统计数据。" />
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
