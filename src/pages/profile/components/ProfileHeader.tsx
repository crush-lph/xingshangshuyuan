import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { useUserInfo } from '@/stores/user-info'
import { textOrPlaceholder, textOf } from '@/shared/view-data'

export function ProfileHeader() {
  const { error, isLoggingIn, loadUserInfo, loginWithWechat, profile, userInfo } = useUserInfo()

  useEffect(() => {
    void loadUserInfo()
  }, [loadUserInfo])

  async function handleLogin() {
    try {
      await loginWithWechat()
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } catch {
      Taro.showToast({ title: '登录失败', icon: 'none' })
    }
  }

  const nickname = textOf(profile?.nickname ?? userInfo?.nickname)
  const avatarText = nickname?.slice(0, 1) ?? '未'

  return (
    <View className="flex items-center gap-4">
      <Avatar size="large" className="bg-white text-brand">
        {avatarText}
      </Avatar>
      <View>
        <Text className="block text-xl font-bold text-white">{nickname ?? '未登录'}</Text>
        <Text className="mt-1 block text-sm text-white/70">
          {textOrPlaceholder(profile?.company_name, error ?? '暂无企业信息')}
        </Text>
      </View>
      {profile || userInfo ? (
        <View className="ml-auto rounded bg-white/15 px-2 py-1">
          <Text className="text-xs font-semibold text-white">
            {textOrPlaceholder(profile?.certification_status_text, '未认证')}
          </Text>
        </View>
      ) : (
        <View className="ml-auto">
          <Button
            size="mini"
            fill="outline"
            className="border-white text-white"
            disabled={isLoggingIn}
            onClick={() => {
              void handleLogin()
            }}
          >
            {isLoggingIn ? '登录中' : '微信登录'}
          </Button>
        </View>
      )}
    </View>
  )
}
