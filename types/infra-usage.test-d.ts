import {
  api,
  request,
  setRequestConfig,
  type RequestOptions,
  type HttpMethod
} from '../src/shared/request'
import { buildUrl, router, routes, type RoutePath } from '../src/shared/router'

interface UserProfile {
  id: string
  name: string
}

const method: HttpMethod = 'POST'
const options: RequestOptions<{ id: string }> = {
  url: '/user/profile',
  method,
  data: { id: 'u_1' }
}

setRequestConfig({
  baseURL: 'https://api.example.com',
  header: {
    Authorization: 'Bearer token'
  }
})

void request<UserProfile, { id: string }>(options).then((profile) => {
  profile.id.toUpperCase()
  profile.name.trim()
})

const userProfileByGet: Promise<UserProfile> = api.get<UserProfile>('/user/profile', {
  data: { id: 'u_1' }
})

void api.post<UserProfile, { id: string }>('/user/profile', { id: 'u_1' }).then((profile) => {
  profile.id.toUpperCase()
  profile.name.trim()
  // @ts-expect-error UserProfile does not expose an age field.
  profile.age
})

// @ts-expect-error post data should keep the caller-provided payload type.
void api.post<UserProfile, { id: string }>('/user/profile', { id: 1001 })

const homePath: RoutePath = routes.home
const serviceUrl = buildUrl(routes.services, { tab: 'tools', from: 'home' })

void router.to(homePath)
void router.redirect('/pages/order/detail/index', { id: 1001 })
void router.reLaunch(routes.home)
void router.switchTab(routes.profile)
void router.switchTab(routes.shuyuan)
void router.back()

serviceUrl.toLowerCase()
