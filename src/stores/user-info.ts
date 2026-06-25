import Taro from '@tarojs/taro'
import { create } from 'zustand'
import {
  bindPhone,
  getUserInfo,
  getUserProfile,
  updateUserProfile,
  wxLogin,
  type GetUserInfoData,
  type GetUserProfileData
} from '@/services'
import { clearAuthToken, getAuthToken, onUnauthorized, setAuthToken } from '@/shared/auth-session'

interface SetUserInfoPayload {
  userInfo?: GetUserInfoData | null
  profile?: GetUserProfileData | null
  token?: string
}

export interface UserInfoState {
  userInfo: GetUserInfoData | null
  profile: GetUserProfileData | null
  token?: string
  isLoading: boolean
  isLoggingIn: boolean
  isLoggedIn: boolean
  isPhoneBound: boolean
  error?: string
  hydrateFromStorage: () => Promise<void>
  loadUserInfo: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  loginWithWechat: () => Promise<void>
  bindWechatPhone: (payload: { code?: string; encryptedData?: string; iv?: string }) => Promise<void>
  updateWechatProfile: (payload: { nickname?: string; avatar?: string }) => Promise<void>
  setUserInfo: (payload: SetUserInfoPayload) => void
  clearUserInfo: () => void
  logout: () => void
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '用户信息请求失败'
}

function hasUserInfo(value: GetUserInfoData | null) {
  return Boolean(value?.id || value?.nickname || value?.phone)
}

function hasUserProfile(value: GetUserProfileData | null) {
  return Boolean(value?.user_id || value?.nickname || value?.phone || value?.company_name)
}

function getIsLoggedIn(userInfo: GetUserInfoData | null, profile: GetUserProfileData | null, token?: string) {
  return Boolean(token || hasUserInfo(userInfo) || hasUserProfile(profile))
}

function getIsPhoneBound(userInfo: GetUserInfoData | null, profile: GetUserProfileData | null) {
  return Boolean(userInfo?.phone || profile?.phone)
}

let hasBoundUnauthorizedListener = false

export const useUserInfo = create<UserInfoState>()((set, get) => ({
  userInfo: null,
  profile: null,
  token: getAuthToken(),
  isLoading: false,
  isLoggingIn: false,
  isLoggedIn: Boolean(getAuthToken()),
  isPhoneBound: false,
  error: undefined,

  async hydrateFromStorage() {
    const token = getAuthToken()

    if (!hasBoundUnauthorizedListener) {
      hasBoundUnauthorizedListener = true
      onUnauthorized(() => {
        set({
          userInfo: null,
          profile: null,
          token: undefined,
          isLoggedIn: false,
          isPhoneBound: false,
          isLoading: false,
          isLoggingIn: false,
          error: '登录已失效，请重新登录'
        })
      })
    }

    if (!token) {
      set({ token: undefined, isLoggedIn: false, isPhoneBound: false })
      return
    }

    set({ token, isLoggedIn: true })
    await get().loadUserInfo()
  },

  async loadUserInfo() {
    set({ isLoading: true, error: undefined })

    const [userInfoResult, profileResult] = await Promise.allSettled([getUserInfo(), getUserProfile()])
    const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value.data : null
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
    const error =
      userInfoResult.status === 'rejected' && profileResult.status === 'rejected'
        ? getErrorMessage(userInfoResult.reason)
        : undefined
    const nextToken = getAuthToken()

    set({
      userInfo: hasUserInfo(userInfo) ? userInfo : null,
      profile: hasUserProfile(profile) ? profile : null,
      token: nextToken,
      isLoggedIn: getIsLoggedIn(userInfo, profile, nextToken),
      isPhoneBound: getIsPhoneBound(userInfo, profile),
      isLoading: false,
      error
    })
  },

  async refreshUserInfo() {
    await get().loadUserInfo()
  },

  async loginWithWechat() {
    set({ isLoggingIn: true, error: undefined })

    try {
      const loginResult = await Taro.login()
      const response = await wxLogin({ code: loginResult.code })
      const loginData = response.data
      const token = loginData.token
      const userInfo: GetUserInfoData | null = loginData.user_id
        ? {
            id: loginData.user_id,
            nickname: loginData.nickname,
            avatar: loginData.avatar,
            phone: loginData.phone
          }
        : null

      setAuthToken(token)

      set({
        token,
        userInfo,
        isLoggedIn: getIsLoggedIn(userInfo, get().profile, token),
        isPhoneBound: getIsPhoneBound(userInfo, get().profile)
      })

      await get().loadUserInfo()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isLoggingIn: false })
    }
  },

  async bindWechatPhone(payload) {
    if (!payload.code && (!payload.encryptedData || !payload.iv)) {
      throw new Error('未获取到手机号授权信息')
    }

    const response = await bindPhone(
      payload.code
        ? { code: payload.code }
        : {
            encrypted_data: payload.encryptedData,
            iv: payload.iv
          }
    )
    const phone = response.data.phone

    if (!phone) {
      throw new Error('未获取到绑定手机号')
    }

    const currentUserInfo = get().userInfo
    const currentProfile = get().profile
    const nextUserInfo = currentUserInfo
      ? { ...currentUserInfo, phone }
      : currentProfile
        ? currentUserInfo
        : ({ phone } as GetUserInfoData)
    const nextProfile = currentProfile ? { ...currentProfile, phone } : currentProfile

    set({
      userInfo: nextUserInfo,
      profile: nextProfile,
      isPhoneBound: getIsPhoneBound(nextUserInfo, nextProfile),
      error: undefined
    })
  },

  async updateWechatProfile(payload) {
    const nextProfilePayload = {
      ...(payload.nickname !== undefined ? { nickname: payload.nickname } : {}),
      ...(payload.avatar !== undefined ? { avatar: payload.avatar } : {})
    }

    if (!nextProfilePayload.nickname && !nextProfilePayload.avatar) {
      throw new Error('未获取到微信头像或昵称')
    }

    await updateUserProfile(nextProfilePayload)

    const currentUserInfo = get().userInfo
    const currentProfile = get().profile
    const nextUserInfo = currentUserInfo ? { ...currentUserInfo, ...nextProfilePayload } : currentUserInfo
    const nextProfile = currentProfile ? { ...currentProfile, ...nextProfilePayload } : currentProfile

    set({
      userInfo: nextUserInfo,
      profile: nextProfile,
      isLoggedIn: getIsLoggedIn(nextUserInfo, nextProfile, get().token),
      isPhoneBound: getIsPhoneBound(nextUserInfo, nextProfile),
      error: undefined
    })
  },

  setUserInfo(payload) {
    const nextUserInfo = payload.userInfo === undefined ? get().userInfo : payload.userInfo
    const nextProfile = payload.profile === undefined ? get().profile : payload.profile
    const nextToken = payload.token === undefined ? get().token : payload.token

    setAuthToken(nextToken)

    set({
      userInfo: nextUserInfo,
      profile: nextProfile,
      token: nextToken,
      isLoggedIn: getIsLoggedIn(nextUserInfo, nextProfile, nextToken),
      isPhoneBound: getIsPhoneBound(nextUserInfo, nextProfile),
      error: undefined
    })
  },

  clearUserInfo() {
    clearAuthToken()
    set({
      userInfo: null,
      profile: null,
      token: undefined,
      isLoggedIn: false,
      isPhoneBound: false,
      isLoading: false,
      isLoggingIn: false,
      error: undefined
    })
  },

  logout() {
    get().clearUserInfo()
  }
}))
