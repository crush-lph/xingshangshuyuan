import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { AuthShell } from '../components/AuthShell'
import { buildUrl, getSafeRedirectRoute, routes, router } from '@/shared/router'
import { getPageParam } from '@/shared/view-data'
import { useUserInfo } from '@/stores/user-info'

export default function UserBindPhonePage() {
  const { bindWechatPhone, isLoggedIn, isPhoneBound, loadUserInfo } = useUserInfo()
  const [isBindingPhone, setIsBindingPhone] = useState(false)
  const redirectRoute = getSafeRedirectRoute(getPageParam('redirect'))

  useEffect(() => {
    void loadUserInfo().catch(() => undefined)
  }, [loadUserInfo])

  function finishBinding() {
    router.open(redirectRoute)
  }

  async function handleBindPhone(event: { detail?: { code?: string; errMsg?: string } }) {
    if (isBindingPhone) {
      return
    }

    const errMsg = event.detail?.errMsg

    if (errMsg && !errMsg.includes(':ok')) {
      Taro.showToast({ title: '未授权手机号，暂不能继续', icon: 'none' })
      return
    }

    try {
      setIsBindingPhone(true)
      await bindWechatPhone({
        code: event.detail?.code
      })
      Taro.showToast({ title: '手机号已绑定', icon: 'success' })
      finishBinding()
    } catch (error) {
      const title = error instanceof Error && error.message ? error.message : '绑定失败，请稍后重试'
      Taro.showToast({ title, icon: 'none' })
    } finally {
      setIsBindingPhone(false)
    }
  }

  return (
    <AuthShell title="绑定手机号" subtitle="使用微信官方组件授权手机号。">
      <View>
        {!isLoggedIn ? (
          <Button
            block
            type="primary"
            className="h-11"
            onClick={() => {
              router.redirect(routes.userLogin, { redirect: buildUrl(redirectRoute.path, redirectRoute.query) })
            }}
          >
            先去登录
          </Button>
        ) : isPhoneBound ? (
          <Button block type="primary" className="h-11" onClick={finishBinding}>
            继续
          </Button>
        ) : (
          <TaroButton
            className="auth-primary-button flex h-12 items-center justify-center rounded-lg border-0 bg-tech px-4 text-base font-semibold text-white"
            disabled={isBindingPhone}
            openType="getPhoneNumber"
            onGetPhoneNumber={(event) => {
              void handleBindPhone(event)
            }}
          >
            <View className="flex items-center justify-center gap-2">
              <AppIcon name="phone-line" size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white">{isBindingPhone ? '绑定中' : '绑定微信手机号'}</Text>
            </View>
          </TaroButton>
        )}

        <Text className="mt-3 block text-center text-xs leading-5 text-muted">绑定完成后自动返回原页面。</Text>
      </View>
    </AuthShell>
  )
}
