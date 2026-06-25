import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Text, View } from '@tarojs/components'
import Avatar from '@nutui/nutui-react-taro/dist/es/packages/avatar'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/avatar/style/css'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { useUserInfo } from '@/stores/user-info'
import { textOrPlaceholder, textOf } from '@/shared/view-data'

export function ProfileHeader() {
  const { bindWechatPhone, isLoggingIn, loadUserInfo, loginWithWechat, profile, userInfo } = useUserInfo()

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

  async function handleBindPhone(event: { detail?: { encryptedData?: string; iv?: string } }) {
    try {
      await bindWechatPhone({
        encryptedData: event.detail?.encryptedData,
        iv: event.detail?.iv
      })
      Taro.showToast({ title: '手机号已绑定', icon: 'success' })
    } catch {
      Taro.showToast({ title: '绑定失败', icon: 'none' })
    }
  }

  const nickname = textOf(profile?.nickname ?? userInfo?.nickname)
  const hasAccount = Boolean(profile || userInfo)
  const phone = textOf(profile?.phone ?? userInfo?.phone)
  const avatarText = nickname?.slice(0, 1)

  return (
    <View className="flex items-center gap-4">
      <Avatar size="large" className="bg-white text-brand">
        {hasAccount && avatarText ? avatarText : <AppIcon name="user-3-line" size={30} color="#9AA7BD" />}
      </Avatar>
      <View>
        <Text className="block text-xl font-bold text-white">{hasAccount ? (nickname ?? '用户') : '去登录'}</Text>
        <Text className="mt-1 block text-sm text-white/70">
          {hasAccount ? textOrPlaceholder(profile?.company_name, '暂无企业信息') : '登录后查看会员权益与企业认证'}
        </Text>
      </View>
      {hasAccount && phone ? (
        <View className="ml-auto rounded bg-white/15 px-2 py-1">
          <Text className="text-xs font-semibold text-white">
            {textOrPlaceholder(profile?.certification_status_text, '未认证')}
          </Text>
        </View>
      ) : hasAccount ? (
        <TaroButton
          className="ml-auto rounded border border-white bg-transparent px-2 py-1 text-xs font-semibold leading-5 text-white"
          openType="getPhoneNumber"
          onGetPhoneNumber={(event) => {
            void handleBindPhone(event)
          }}
        >
          绑定手机号
        </TaroButton>
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
            {isLoggingIn ? '登录中' : '去登录'}
          </Button>
        </View>
      )}
    </View>
  )
}
