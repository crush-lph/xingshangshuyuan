import { useUserInfo } from '../src/stores/user-info'

const state = useUserInfo.getState()

void state.loadUserInfo().then(() => {
  state.userInfo?.nickname?.trim()
  state.profile?.company_name?.trim()
})

void state.loginWithWechat().then(() => {
  state.token?.trim()
})

state.setUserInfo({
  userInfo: {
    id: 1,
    nickname: '测试用户'
  }
})

state.clearUserInfo()
state.logout()

// @ts-expect-error user id must remain numeric when provided.
state.setUserInfo({ userInfo: { id: '1' } })
