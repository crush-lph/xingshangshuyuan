import { View } from '@tarojs/components'
import { ManagerCard } from './components/ManagerCard'
import { MemberCard } from './components/MemberCard'
import { MenuGroup } from './components/MenuGroup'
import { MetricGrid } from './components/MetricGrid'
import { ProfileHeader } from './components/ProfileHeader'
import { accountMenus, managerInfo, memberActions, metrics, serviceMenus } from './profile.data'

export default function ProfilePage() {
  return (
    <View className="min-h-screen bg-canvas pb-6 text-ink">
      <View className="bg-brand px-5 pb-8 pt-5">
        <ProfileHeader />
        <MemberCard actions={memberActions} />
      </View>

      <View className="-mt-4 px-4">
        <MetricGrid items={metrics} />

        <View className="mt-3">
          <MenuGroup items={serviceMenus} />
        </View>

        <View className="mt-3">
          <MenuGroup items={accountMenus} />
        </View>

        <ManagerCard manager={managerInfo} />
      </View>
    </View>
  )
}
