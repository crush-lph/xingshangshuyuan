import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'
import { useUserInfo } from '@/stores/user-info'
import { textOrPlaceholder } from '@/shared/view-data'

export default function UserSettingsPage() {
  const { isLoggedIn, logout, profile, userInfo } = useUserInfo()

  async function handleLogout() {
    if (!isLoggedIn) {
      Taro.showToast({ title: '当前未登录', icon: 'none' })
      return
    }

    const result = await Taro.showModal({
      title: '退出登录',
      content: '退出后将清空当前用户信息，需要重新登录后继续使用账号相关功能。',
      confirmText: '退出',
      confirmColor: '#E53E3E'
    })

    if (!result.confirm) {
      return
    }

    logout()
    Taro.showToast({ title: '已退出登录', icon: 'success' })
    Taro.switchTab({ url: routes.profile })
  }

  return (
    <PageShell title="设置" subtitle="管理当前账号状态和基础偏好。">
      <View className="grid gap-3">
        {isLoggedIn ? (
          <FieldList
            fields={[
              { label: '昵称', value: textOrPlaceholder(profile?.nickname ?? userInfo?.nickname) },
              { label: '手机号', value: textOrPlaceholder(profile?.phone ?? userInfo?.phone) },
              { label: '企业', value: textOrPlaceholder(profile?.company_name) },
              { label: '认证状态', value: textOrPlaceholder(profile?.certification_status_text) }
            ]}
          />
        ) : (
          <StateNotice state="loginRequired" copy={{ title: '当前未登录', desc: '登录后可在这里管理账号信息。' }} />
        )}

        <SectionCard title="账号">
          <Text className="block text-sm leading-6 text-muted">
            退出登录只清空本机当前用户状态，不会删除平台账号或已提交的业务数据。
          </Text>
        </SectionCard>

        <ActionBar
          actions={[
            {
              label: '退出登录',
              variant: 'outline',
              disabled: !isLoggedIn,
              onClick: handleLogout
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
