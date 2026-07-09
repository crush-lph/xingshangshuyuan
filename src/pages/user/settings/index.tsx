import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button as TaroButton, Image, Text, View } from '@tarojs/components'
import { ActionBar, FieldList, FormTextField, SectionCard, StateNotice } from '@/components/business'
import { AppIcon } from '@/components/AppIcon'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'
import { uploadWechatAvatarFromLocalFile } from '@/shared/user-avatar'
import { useUserInfo } from '@/stores/user-info'
import { textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserSettingsPage() {
  const { isLoggedIn, logout, profile, updateWechatProfile, userInfo } = useUserInfo()
  const currentNickname = textOf(profile?.nickname ?? userInfo?.nickname) ?? ''
  const currentAvatar = textOf(profile?.avatar ?? userInfo?.avatar)
  const avatarText = currentNickname.slice(0, 1)
  const [nicknameDraft, setNicknameDraft] = useState({ value: '', isDirty: false })
  const [draftAvatar, setDraftAvatar] = useState<string>()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const nickname = nicknameDraft.isDirty ? nicknameDraft.value : currentNickname

  async function handleChooseAvatar(event: { detail?: { avatarUrl?: string; errMsg?: string } }) {
    const errMsg = event.detail?.errMsg

    if (errMsg && !errMsg.includes(':ok')) {
      return
    }

    const nextAvatar = textOf(event.detail?.avatarUrl)

    if (!nextAvatar || nextAvatar === currentAvatar) {
      return
    }

    setDraftAvatar(nextAvatar)

    try {
      setIsSavingAvatar(true)
      const uploadedAvatar = await uploadWechatAvatarFromLocalFile(nextAvatar)
      await updateWechatProfile({ avatar: uploadedAvatar })
      setDraftAvatar(undefined)
      Taro.showToast({ title: '头像已更新', icon: 'success' })
    } catch (error) {
      const title = error instanceof Error && error.message ? error.message : '头像上传失败'
      Taro.showToast({ title, icon: 'none' })
      setDraftAvatar(undefined)
    } finally {
      setIsSavingAvatar(false)
    }
  }

  async function handleSaveProfile() {
    if (!isLoggedIn) {
      Taro.showToast({ title: '当前未登录', icon: 'none' })
      return
    }

    const nextNickname = nickname.trim()

    if (!nextNickname) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    if (nextNickname === currentNickname) {
      Taro.showToast({ title: '资料没有变化', icon: 'none' })
      return
    }

    try {
      setIsSavingProfile(true)
      await updateWechatProfile({ nickname: nextNickname })
      setNicknameDraft({ value: nextNickname, isDirty: false })
      Taro.showToast({ title: '资料已保存', icon: 'success' })
    } catch {
      Taro.showToast({ title: '资料保存失败', icon: 'none' })
    } finally {
      setIsSavingProfile(false)
    }
  }

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

  const displayAvatar = draftAvatar || currentAvatar
  const renderAvatarContent = () =>
    displayAvatar ? (
      <Image className="h-full w-full rounded-full" mode="aspectFill" src={displayAvatar} />
    ) : avatarText ? (
      <Text className="text-xl font-bold text-brand">{avatarText}</Text>
    ) : (
      <AppIcon name="user-3-line" size={30} color="#9AA7BD" />
    )

  return (
    <PageShell title="用户信息设置" subtitle="更换头像、修改昵称和管理当前账号状态。">
      <View className="grid gap-3">
        {isLoggedIn ? (
          <>
            <SectionCard title="个人资料">
              <View className="flex items-center gap-3">
                <TaroButton
                  className="profile-avatar-button flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-canvas p-0 text-brand"
                  disabled={isSavingAvatar}
                  openType="chooseAvatar"
                  onChooseAvatar={(event) => {
                    void handleChooseAvatar(event)
                  }}
                >
                  {renderAvatarContent()}
                </TaroButton>
                <View className="min-w-0 flex-1">
                  <Text className="block text-sm font-bold text-ink">头像</Text>
                  <Text className="mt-1 block text-[20rpx] text-muted">
                    {isSavingAvatar ? '头像上传中' : '点击左侧头像更换'}
                  </Text>
                </View>
              </View>

              <View className="mt-3">
                <FormTextField
                  label="昵称"
                  value={nickname}
                  placeholder="请输入昵称"
                  required
                  onChange={(value) => setNicknameDraft({ value, isDirty: true })}
                />
              </View>

              <View
                className={`mt-3 rounded-full py-3 text-center ${
                  isSavingProfile || isSavingAvatar ? 'bg-brand/45' : 'bg-brand'
                }`}
                onClick={() => {
                  if (!isSavingProfile && !isSavingAvatar) {
                    void handleSaveProfile()
                  }
                }}
              >
                <Text className="text-sm font-bold text-white">{isSavingProfile ? '保存中' : '保存资料'}</Text>
              </View>
            </SectionCard>

            <FieldList
              fields={[
                { label: '手机号', value: textOrPlaceholder(profile?.phone ?? userInfo?.phone) },
                { label: '企业', value: textOrPlaceholder(profile?.company_name) },
                { label: '认证状态', value: textOrPlaceholder(profile?.certification_status_text) }
              ]}
            />
          </>
        ) : (
          <StateNotice state="loginRequired" copy={{ title: '当前未登录', desc: '登录后可在这里管理账号信息。' }} />
        )}

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
