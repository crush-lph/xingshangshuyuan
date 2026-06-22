import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { getUserInfo, getUserProfile, wxLogin, type GetUserInfoData, type GetUserProfileData } from '@/services'
import { textOrPlaceholder, textOf } from '@/shared/view-data'

export function ProfileHeader() {
  const [profile, setProfile] = useState<GetUserProfileData | null>(null)
  const [userInfo, setUserInfo] = useState<GetUserInfoData | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    void getUserProfile()
      .then((response) => setProfile(response.data.nickname ? response.data : null))
      .catch(() => setProfile(null))
    void getUserInfo()
      .then((response) => setUserInfo(response.data.id ? response.data : null))
      .catch(() => setUserInfo(null))
  }, [])

  async function handleLogin() {
    setIsLoggingIn(true)

    try {
      const loginResult = await Taro.login()
      await wxLogin({ code: loginResult.code })
      const response = await getUserProfile()
      setProfile(response.data.nickname ? response.data : null)
      Taro.showToast({ title: '登录成功', icon: 'success' })
    } finally {
      setIsLoggingIn(false)
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
          {textOrPlaceholder(profile?.company_name, '暂无企业信息')}
        </Text>
      </View>
      {profile ? (
        <View className="ml-auto rounded bg-white/15 px-2 py-1">
          <Text className="text-xs font-semibold text-white">
            {textOrPlaceholder(profile.certification_status_text, '未认证')}
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
