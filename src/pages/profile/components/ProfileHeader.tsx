import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import {
  getCurrentAuthSession,
  isFrontendMockEnabled,
  loginWithWechat,
  type AuthSession
} from '@/shared/frontend-test-flow'

export function ProfileHeader() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    void getCurrentAuthSession().then(setSession)
  }, [])

  async function handleLogin() {
    setIsLoggingIn(true)

    try {
      const nextSession = await loginWithWechat()
      setSession(nextSession)
      Taro.showToast({
        title: isFrontendMockEnabled() ? 'Mock 登录成功' : '登录成功',
        icon: 'success'
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const profile = session?.profile

  return (
    <View className="flex items-center gap-4">
      <Avatar size="large" className="bg-white text-brand">
        {profile?.avatarText ?? '未'}
      </Avatar>
      <View>
        <Text className="block text-xl font-bold text-white">{profile?.name ?? '未登录'}</Text>
        <Text className="mt-1 block text-sm text-white/70">
          {profile?.companyName ?? '登录后测试会员、订单和支付流程'}
        </Text>
      </View>
      {session ? (
        <View className="ml-auto rounded bg-white/15 px-2 py-1">
          <Text className="text-xs font-semibold text-white">{profile?.verified ? '已认证' : '未认证'}</Text>
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
