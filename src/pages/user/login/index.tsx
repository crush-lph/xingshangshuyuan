import Taro from '@tarojs/taro'
import { Button as TaroButton, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { AuthShell } from '../components/AuthShell'
import { getSafeRedirectRoute, router } from '@/shared/router'
import { getPageParam } from '@/shared/view-data'
import { useUserInfo } from '@/stores/user-info'

export default function UserLoginPage() {
  const { isLoggingIn, loginWithWechat } = useUserInfo()
  const redirectRoute = getSafeRedirectRoute(getPageParam('redirect'))

  async function handleLogin() {
    try {
      await loginWithWechat()
      Taro.showToast({ title: '登录成功', icon: 'success' })
      router.open(redirectRoute)
    } catch (error) {
      const title = error instanceof Error && error.message ? error.message : '登录失败，请稍后重试'
      Taro.showToast({ title, icon: 'none' })
    }
  }

  return (
    <AuthShell title="微信授权登录" subtitle="登录后继续完成当前操作。">
      <View>
        <TaroButton
          className="auth-primary-button flex h-12 w-full items-center justify-center rounded-full border-0 bg-tech px-4 text-white"
          disabled={isLoggingIn}
          onClick={handleLogin}
        >
          <View className="flex items-center justify-center gap-2">
            <AppIcon name="wechat-fill" size={22} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">{isLoggingIn ? '登录中' : '快捷授权登录'}</Text>
          </View>
        </TaroButton>
      </View>
    </AuthShell>
  )
}
