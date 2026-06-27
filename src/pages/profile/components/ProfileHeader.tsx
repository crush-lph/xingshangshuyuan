import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Image, Input, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { IdentityBadge } from '@/components/business'
import { uploadUserAvatar } from '@/services'
import { readImageFileAsDataUri } from '@/shared/image-file'
import { router, routes } from '@/shared/router'
import { getUserIdentity } from '@/shared/user-identity'
import { useUserInfo } from '@/stores/user-info'
import { textOrPlaceholder, textOf } from '@/shared/view-data'

export function ProfileHeader() {
  const { bindWechatPhone, isPhoneBound, loadUserInfo, profile, updateWechatProfile, userInfo } = useUserInfo()
  const nickname = textOf(profile?.nickname ?? userInfo?.nickname)
  const avatar = textOf(profile?.avatar ?? userInfo?.avatar)
  const hasAccount = Boolean(profile || userInfo)
  const identity = hasAccount ? getUserIdentity(profile) : undefined
  const avatarText = nickname?.slice(0, 1)
  const [draftNickname, setDraftNickname] = useState<string>()
  const [draftAvatar, setDraftAvatar] = useState<string>()
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    void loadUserInfo()
  }, [loadUserInfo])

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

  async function saveWechatProfile(payload: { nickname?: string; avatar?: string }) {
    if (!hasAccount || isSavingProfile) {
      return
    }

    try {
      setIsSavingProfile(true)
      await updateWechatProfile(payload)
      setDraftNickname(undefined)
      setDraftAvatar(undefined)
      Taro.showToast({ title: '资料已更新', icon: 'success' })
    } catch {
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
      setDraftNickname(undefined)
      setDraftAvatar(undefined)
    } finally {
      setIsSavingProfile(false)
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
      const image = readImageFileAsDataUri(nextAvatar)
      const response = await uploadUserAvatar({ image })
      const uploadedAvatar = textOf(response.data.url)

      if (!uploadedAvatar) {
        throw new Error('上传头像接口未返回地址')
      }

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

  async function handleNicknameSave(value?: string) {
    const nextNickname = textOf(value)

    if (!nextNickname || nextNickname === nickname) {
      return
    }

    await saveWechatProfile({ nickname: nextNickname })
  }

  const goLogin = () => {
    router.to(routes.userLogin, { redirect: routes.profile })
  }
  const displayAvatar = draftAvatar || avatar
  const displayNickname = draftNickname ?? nickname ?? ''
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
          <Input
            className="h-8 min-w-0 text-xl font-bold text-white"
            confirmType="done"
            disabled={isSavingProfile}
            placeholder="填写微信昵称"
            placeholderStyle="color: rgba(255,255,255,0.72)"
            type="nickname"
            value={displayNickname}
            onBlur={(event) => {
              void handleNicknameSave(event.detail.value)
            }}
            onConfirm={(event) => {
              void handleNicknameSave(event.detail.value)
            }}
            onInput={(event) => {
              setDraftNickname(event.detail.value)
            }}
          />
        ) : (
          <Text className="block text-xl font-bold text-white">去登录</Text>
        )}
        {hasAccount ? (
          <Text className="mt-1 block text-sm text-white/70">
            {isPhoneBound ? textOrPlaceholder(profile?.company_name, '暂无企业信息') : '绑定手机号，便于活动和订单沟通'}
          </Text>
        ) : null}
        {identity ? (
          <View className="mt-2">
            <IdentityBadge identity={identity} size="sm" variant="soft" />
          </View>
        ) : null}
      </View>
      {hasAccount && isPhoneBound ? (
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
      ) : null}
    </View>
  )
}
