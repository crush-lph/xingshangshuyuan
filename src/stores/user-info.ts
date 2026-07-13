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
  isAdmin: boolean
  refreshVersion: number
  error?: string
  hydrateFromStorage: () => Promise<void>
  loadUserInfo: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  loginWithWechat: () => Promise<void>
  bindWechatPhone: (payload: { code?: string }) => Promise<void>
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

function getIsLoggedIn(token?: string) {
  return Boolean(token)
}

function getIsPhoneBound(userInfo: GetUserInfoData | null, profile: GetUserProfileData | null) {
  return Boolean(userInfo?.phone || profile?.phone)
}

function getIsAdmin(userInfo: GetUserInfoData | null, profile: GetUserProfileData | null) {
  return Number(profile?.role ?? userInfo?.role) === 3
}

let hasBoundUnauthorizedListener = false
let sessionGeneration = 0

export const useUserInfo = create<UserInfoState>()((set, get) => ({
  userInfo: null,
  profile: null,
  token: getAuthToken(),
  isLoading: false,
  isLoggingIn: false,
  isLoggedIn: Boolean(getAuthToken()),
  isPhoneBound: false,
  isAdmin: false,
  refreshVersion: 0,
  error: undefined,

  async hydrateFromStorage() {
    const token = getAuthToken()

    if (!hasBoundUnauthorizedListener) {
      hasBoundUnauthorizedListener = true
      onUnauthorized(() => {
        sessionGeneration += 1
        const current = get()
        const hadSession = Boolean(current.token || current.isLoggedIn || current.userInfo || current.profile)

        if (!hadSession) {
          return
        }

        set({
          userInfo: null,
          profile: null,
          token: undefined,
          isLoggedIn: false,
          isPhoneBound: false,
          isAdmin: false,
          refreshVersion: get().refreshVersion + 1,
          isLoading: false,
          isLoggingIn: false,
          error: '登录已失效，请重新登录'
        })
      })
    }

    if (!token) {
      set({ token: undefined, isLoggedIn: false, isPhoneBound: false, isAdmin: false })
      return
    }

    set({ token, isLoggedIn: true })
    await get().loadUserInfo()
  },

  async loadUserInfo() {
    const requestToken = getAuthToken()
    const requestGeneration = sessionGeneration
    set({ isLoading: true, error: undefined })

    const [userInfoResult, profileResult] = await Promise.allSettled([getUserInfo(), getUserProfile()])
    const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value.data : null
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
    const error =
      userInfoResult.status === 'rejected' && profileResult.status === 'rejected'
        ? getErrorMessage(userInfoResult.reason)
        : undefined
    const nextToken = getAuthToken()

    if (requestGeneration !== sessionGeneration || requestToken !== nextToken) {
      return
    }

    const hasIdentity = hasUserInfo(userInfo) || hasUserProfile(profile)

    set({
      userInfo: hasUserInfo(userInfo) ? userInfo : null,
      profile: hasUserProfile(profile) ? profile : null,
      token: nextToken,
      isLoggedIn: getIsLoggedIn(nextToken),
      isPhoneBound: getIsPhoneBound(userInfo, profile),
      isAdmin: getIsAdmin(userInfo, profile),
      refreshVersion: get().refreshVersion + 1,
      isLoading: false,
      error: error ?? (!hasIdentity ? '未获取到用户身份信息' : undefined)
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

      if (!token) {
        throw new Error('登录接口未返回有效凭证')
      }
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

      sessionGeneration += 1
      setAuthToken(token)

      set({
        token,
        userInfo,
        profile: null,
        isLoggedIn: getIsLoggedIn(token),
        isPhoneBound: getIsPhoneBound(userInfo, null),
        isAdmin: getIsAdmin(userInfo, null),
        isLoading: false
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
    if (!payload.code) {
      throw new Error('未获取到手机号授权信息')
    }

    const response = await bindPhone({ code: payload.code })
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
      isAdmin: getIsAdmin(nextUserInfo, nextProfile),
      error: undefined
    })
    await get().loadUserInfo()
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

    await get().loadUserInfo()
  },

  setUserInfo(payload) {
    const nextToken = payload.token === undefined ? get().token : payload.token
    const isReplacingSession = nextToken !== get().token
    const nextUserInfo =
      payload.userInfo === undefined ? (isReplacingSession ? null : get().userInfo) : payload.userInfo
    const nextProfile = payload.profile === undefined ? (isReplacingSession ? null : get().profile) : payload.profile

    if (isReplacingSession) {
      sessionGeneration += 1
    }
    setAuthToken(nextToken)

    set({
      userInfo: nextUserInfo,
      profile: nextProfile,
      token: nextToken,
      isLoggedIn: getIsLoggedIn(nextToken),
      isPhoneBound: getIsPhoneBound(nextUserInfo, nextProfile),
      isAdmin: getIsAdmin(nextUserInfo, nextProfile),
      refreshVersion: get().refreshVersion + 1,
      isLoading: false,
      error: undefined
    })
  },

  clearUserInfo() {
    sessionGeneration += 1
    clearAuthToken()
    set({
      userInfo: null,
      profile: null,
      token: undefined,
      isLoggedIn: false,
      isPhoneBound: false,
      isAdmin: false,
      refreshVersion: get().refreshVersion + 1,
      isLoading: false,
      isLoggingIn: false,
      error: undefined
    })
  },

  logout() {
    get().clearUserInfo()
  }
}))
