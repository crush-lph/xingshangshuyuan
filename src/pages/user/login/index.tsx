import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Input, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { AuthShell } from '../components/AuthShell'
import { phoneLogin, sendSmsCode, type GetUserInfoData } from '@/services'
import { getSafeRedirectRoute, router } from '@/shared/router'
import { getPageParam } from '@/shared/view-data'
import { useUserInfo } from '@/stores/user-info'

export default function UserLoginPage() {
  const { isLoggingIn, loginWithWechat, setUserInfo } = useUserInfo()
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isPhoneLoggingIn, setIsPhoneLoggingIn] = useState(false)
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

  async function handleSendSmsCode() {
    if (!/^1\d{10}$/.test(phone.trim())) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    try {
      setIsSendingCode(true)
      await sendSmsCode({ phone: phone.trim(), scene: 'login' })
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
    } catch {
      Taro.showToast({ title: '验证码发送失败', icon: 'none' })
    } finally {
      setIsSendingCode(false)
    }
  }

  async function handlePhoneLogin() {
    if (!/^1\d{10}$/.test(phone.trim())) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    if (!smsCode.trim()) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    try {
      setIsPhoneLoggingIn(true)
      const response = await phoneLogin({ phone: phone.trim(), sms_code: smsCode.trim() })
      const loginData = response.data
      const userInfo: GetUserInfoData | null = loginData.user_id
        ? {
            id: loginData.user_id,
            nickname: loginData.nickname,
            avatar: loginData.avatar,
            phone: loginData.phone,
            role: loginData.role,
            role_text: loginData.role_text,
            vip_level: loginData.vip_level,
            vip_level_text: loginData.vip_level_text
          }
        : null

      setUserInfo({ token: loginData.token, userInfo })
      Taro.showToast({ title: '登录成功', icon: 'success' })
      router.open(redirectRoute)
    } catch (error) {
      const title = error instanceof Error && error.message ? error.message : '登录失败，请稍后重试'
      Taro.showToast({ title, icon: 'none' })
    } finally {
      setIsPhoneLoggingIn(false)
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

        <View className="my-5 flex items-center gap-3">
          <View className="h-px flex-1 bg-line" />
          <Text className="text-xs text-muted">或使用手机号登录</Text>
          <View className="h-px flex-1 bg-line" />
        </View>

        <View className="grid gap-3">
          <View className="rounded-lg bg-white px-4 py-3 shadow-soft">
            <Input
              type="number"
              maxlength={11}
              value={phone}
              placeholder="请输入手机号"
              className="text-sm"
              onInput={(event) => setPhone(event.detail.value)}
            />
          </View>
          <View className="flex gap-3">
            <View className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 shadow-soft">
              <Input
                type="number"
                value={smsCode}
                placeholder="请输入验证码"
                className="text-sm"
                onInput={(event) => setSmsCode(event.detail.value)}
              />
            </View>
            <TaroButton
              className="auth-primary-button flex h-12 min-w-[180rpx] items-center justify-center rounded-full border-0 bg-brand px-4 text-white"
              disabled={isSendingCode}
              onClick={handleSendSmsCode}
            >
              <Text className="text-sm font-semibold text-white">{isSendingCode ? '发送中' : '获取验证码'}</Text>
            </TaroButton>
          </View>
          <TaroButton
            className="auth-primary-button flex h-12 w-full items-center justify-center rounded-full border-0 bg-brand px-4 text-white"
            disabled={isPhoneLoggingIn}
            onClick={handlePhoneLogin}
          >
            <Text className="text-base font-semibold text-white">{isPhoneLoggingIn ? '登录中' : '手机号登录'}</Text>
          </TaroButton>
        </View>
      </View>
    </AuthShell>
  )
}
