import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { getUserInfo, getUserProfile, wxLogin, type GetUserInfoData, type GetUserProfileData } from '@/services'

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
  error?: string
  loadUserInfo: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  loginWithWechat: () => Promise<void>
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

export const useUserInfo = create<UserInfoState>()((set, get) => ({
  userInfo: null,
  profile: null,
  token: undefined,
  isLoading: false,
  isLoggingIn: false,
  isLoggedIn: false,
  error: undefined,

  async loadUserInfo() {
    set({ isLoading: true, error: undefined })

    const [userInfoResult, profileResult] = await Promise.allSettled([getUserInfo(), getUserProfile()])
    const userInfo = userInfoResult.status === 'fulfilled' ? userInfoResult.value.data : null
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
    const currentToken = get().token
    const error =
      userInfoResult.status === 'rejected' && profileResult.status === 'rejected'
        ? getErrorMessage(userInfoResult.reason)
        : undefined

    set({
      userInfo: hasUserInfo(userInfo) ? userInfo : null,
      profile: hasUserProfile(profile) ? profile : null,
      isLoggedIn: getIsLoggedIn(userInfo, profile, currentToken),
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

      set({
        token,
        userInfo,
        isLoggedIn: getIsLoggedIn(userInfo, get().profile, token)
      })

      await get().loadUserInfo()
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    } finally {
      set({ isLoggingIn: false })
    }
  },

  setUserInfo(payload) {
    const nextUserInfo = payload.userInfo === undefined ? get().userInfo : payload.userInfo
    const nextProfile = payload.profile === undefined ? get().profile : payload.profile
    const nextToken = payload.token === undefined ? get().token : payload.token

    set({
      userInfo: nextUserInfo,
      profile: nextProfile,
      token: nextToken,
      isLoggedIn: getIsLoggedIn(nextUserInfo, nextProfile, nextToken),
      error: undefined
    })
  },

  clearUserInfo() {
    set({
      userInfo: null,
      profile: null,
      token: undefined,
      isLoggedIn: false,
      isLoading: false,
      isLoggingIn: false,
      error: undefined
    })
  },

  logout() {
    get().clearUserInfo()
  }
}))
