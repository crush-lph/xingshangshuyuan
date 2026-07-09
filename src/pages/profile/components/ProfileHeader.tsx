import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Image, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import adminIcon from '@/assets/identity/identity-admin.png'
import { router, routes } from '@/shared/router'
import { uploadWechatAvatarFromLocalFile } from '@/shared/user-avatar'
import { useUserInfo } from '@/stores/user-info'
import { textOrPlaceholder, textOf } from '@/shared/view-data'

export function ProfileHeader() {
  const { bindWechatPhone, isAdmin, isPhoneBound, loadUserInfo, profile, token, updateWechatProfile, userInfo } =
    useUserInfo()
  const nickname = textOf(profile?.nickname ?? userInfo?.nickname)
  const avatar = textOf(profile?.avatar ?? userInfo?.avatar)
  const hasAccount = Boolean(profile || userInfo)
  const avatarText = nickname?.slice(0, 1)
  const [draftAvatar, setDraftAvatar] = useState<string>()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const certificationText = textOf(profile?.certification_status_text)
  const isCertified =
    profile?.certification_status === 2 ||
    Boolean(
      certificationText && ['已认证', '认证通过', '已通过', '通过'].some((text) => certificationText.includes(text))
    )

  useEffect(() => {
    if (!token) {
      return
    }

    void loadUserInfo()
  }, [loadUserInfo, token])

  async function handleBindPhone(event: { detail?: { code?: string; errMsg?: string } }) {
    const errMsg = event.detail?.errMsg

    if (errMsg && !errMsg.includes(':ok')) {
      Taro.showToast({ title: '未授权手机号，暂不能继续', icon: 'none' })
      return
    }

    try {
      await bindWechatPhone({
        code: event.detail?.code
      })
      Taro.showToast({ title: '手机号已绑定', icon: 'success' })
    } catch {
      Taro.showToast({ title: '绑定失败', icon: 'none' })
    }
  }

  async function handleChooseAvatar(event: { detail?: { avatarUrl?: string; errMsg?: string } }) {
    const errMsg = event.detail?.errMsg

    if (errMsg && !errMsg.includes(':ok')) {
      return
    }

    const nextAvatar = textOf(event.detail?.avatarUrl)

    if (!nextAvatar || nextAvatar === avatar) {
      return
    }

    setDraftAvatar(nextAvatar)

    try {
      setIsSavingProfile(true)
      const uploadedAvatar = await uploadWechatAvatarFromLocalFile(nextAvatar)
      await updateWechatProfile({ avatar: uploadedAvatar })
      setDraftAvatar(undefined)
      Taro.showToast({ title: '头像已更新', icon: 'success' })
    } catch (error) {
      const title = error instanceof Error && error.message ? error.message : '头像上传失败'
      Taro.showToast({ title, icon: 'none' })
      setDraftAvatar(undefined)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const goLogin = () => {
    router.to(routes.userLogin, { redirect: routes.profile })
  }
  const goSettings = () => {
    router.to(routes.userSettings)
  }
  const displayAvatar = draftAvatar || avatar
  const renderAvatarContent = () =>
    displayAvatar ? (
      <Image className="h-full w-full rounded-full" mode="aspectFill" src={displayAvatar} />
    ) : hasAccount && avatarText ? (
      <Text className="text-xl font-bold text-brand">{avatarText}</Text>
    ) : (
      <AppIcon name="user-3-line" size={30} color="#9AA7BD" />
    )

  return (
    <View className="flex items-center gap-4" onClick={hasAccount ? undefined : goLogin}>
      {hasAccount ? (
        <TaroButton
          className="profile-avatar-button flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white p-0 text-brand"
          disabled={isSavingProfile}
          openType="chooseAvatar"
          onChooseAvatar={(event) => {
            void handleChooseAvatar(event)
          }}
        >
          {renderAvatarContent()}
        </TaroButton>
      ) : (
        <View className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand">
          {renderAvatarContent()}
        </View>
      )}
      <View className="min-w-0 flex-1">
        {hasAccount ? (
          <View className="flex min-w-0 items-center gap-1.5">
            <Text className="min-w-0 max-w-[320rpx] truncate text-xl font-bold text-white">
              {nickname ?? '微信用户'}
            </Text>
            {isCertified ? (
              <View className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Text className="iconfont icon-qiyerenzheng text-xl leading-none text-[#007EFF]" />
              </View>
            ) : null}
            {isAdmin ? <Image className="h-5 w-5 shrink-0" src={adminIcon} mode="aspectFit" /> : null}
          </View>
        ) : (
          <Text className="block text-xl font-bold text-white">去登录</Text>
        )}
        {hasAccount ? (
          <Text className="mt-1 block text-sm text-white/70">
            {isPhoneBound ? textOrPlaceholder(profile?.company_name, '暂无企业信息') : '绑定手机号，便于活动和订单沟通'}
          </Text>
        ) : null}
      </View>
      {hasAccount ? (
        <View className="shrink-0 px-1 py-1" onClick={goSettings}>
          <AppIcon name="settings-3-line" size={18} color="rgba(255,255,255,0.82)" />
        </View>
      ) : null}
      {hasAccount && !isPhoneBound ? (
        <TaroButton
          className="ml-auto rounded border border-white bg-transparent px-2 py-1 text-xs font-semibold leading-5 text-white"
          openType="getPhoneNumber"
          onGetPhoneNumber={(event) => {
            void handleBindPhone(event)
          }}
        >
          绑定手机号
        </TaroButton>
      ) : null}
    </View>
  )
}
