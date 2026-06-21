import Taro from '@tarojs/taro'
import { wxLogin } from '@/services'
import { api } from './request'

export type PaymentMethod = 'wechat' | 'transfer'
export type OrderStatus = 'pending' | 'paid' | 'transfer_pending'

export interface UserProfile {
  id: string
  name: string
  companyName: string
  avatarText: string
  verified: boolean
}

export interface AuthSession {
  token: string
  openid: string
  loginCode: string
  profile: UserProfile
}

export interface CreateMemberOrderPayload {
  planId: string
  paymentMethod: PaymentMethod
}

export interface MemberOrder {
  id: string
  title: string
  amount: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  createdAt: string
  paidAt?: string
  voucherFilename?: string
}

export interface WechatPaymentParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType?: 'MD5' | 'HMAC-SHA256' | 'RSA'
  paySign: string
}

export interface PaymentResult {
  channel: 'wechat'
  order: MemberOrder
}

export interface TransferVoucherPayload {
  filename: string
}

const AUTH_STORAGE_KEY = 'xs_frontend_test_auth'
const ORDERS_STORAGE_KEY = 'xs_frontend_test_orders'

let frontendMockEnabled = true

const mockProfile: UserProfile = {
  id: 'u_mock_001',
  name: '陈总',
  companyName: '鑫财财税有限公司',
  avatarText: '陈',
  verified: true
}

function createNowIso() {
  return new Date().toISOString()
}

function createOrderId() {
  const timestamp = Date.now().toString().slice(-8)
  return `XS${timestamp}`
}

function delay(ms = 350) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = Taro.getStorageSync<T | ''>(key)
    return value || fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    Taro.setStorageSync(key, value)
  } catch {
    // Storage can be unavailable in some test runtimes; keep the mock flow usable.
  }
}

function saveOrder(order: MemberOrder) {
  const orders = readStorage<MemberOrder[]>(ORDERS_STORAGE_KEY, [])
  const nextOrders = [order, ...orders.filter((item) => item.id !== order.id)]
  writeStorage(ORDERS_STORAGE_KEY, nextOrders)
  return order
}

function updateOrder(orderId: string, updater: (order: MemberOrder) => MemberOrder) {
  const orders = readStorage<MemberOrder[]>(ORDERS_STORAGE_KEY, [])
  const target = orders.find((order) => order.id === orderId)

  if (!target) {
    throw new Error(`Order ${orderId} not found`)
  }

  const updated = updater(target)
  writeStorage(
    ORDERS_STORAGE_KEY,
    orders.map((order) => (order.id === orderId ? updated : order))
  )
  return updated
}

export function setFrontendMockEnabled(enabled: boolean) {
  frontendMockEnabled = enabled
}

export function isFrontendMockEnabled() {
  return frontendMockEnabled
}

export async function getCurrentAuthSession() {
  return readStorage<AuthSession | null>(AUTH_STORAGE_KEY, null)
}

export async function loginWithWechat(): Promise<AuthSession> {
  if (!frontendMockEnabled) {
    const loginResult = await Taro.login()
    const response = await wxLogin({
      code: loginResult.code
    })
    const nickname = response.data.nickname || '用户'
    const session: AuthSession = {
      token: response.data.token || '',
      openid: '',
      loginCode: loginResult.code,
      profile: {
        id: String(response.data.user_id || ''),
        name: nickname,
        companyName: '',
        avatarText: nickname.slice(0, 1),
        verified: false
      }
    }

    writeStorage(AUTH_STORAGE_KEY, session)
    return session
  }

  await delay()

  const session: AuthSession = {
    token: 'mock-token-xs-2026',
    openid: 'mock-openid-xs-001',
    loginCode: 'mock-wx-login-code',
    profile: mockProfile
  }

  writeStorage(AUTH_STORAGE_KEY, session)
  return session
}

export async function createMemberOrder(payload: CreateMemberOrderPayload): Promise<MemberOrder> {
  if (!frontendMockEnabled) {
    return api.post<MemberOrder, CreateMemberOrderPayload>('/member/orders', payload)
  }

  await delay()

  const order: MemberOrder = {
    id: createOrderId(),
    title: payload.planId === 'elite-yearly' ? '行尚·菁英会员' : '会员订单',
    amount: 4980,
    paymentMethod: payload.paymentMethod,
    status: 'pending',
    createdAt: createNowIso()
  }

  return saveOrder(order)
}

export async function payMemberOrder(orderId: string): Promise<PaymentResult> {
  if (!frontendMockEnabled) {
    const paymentParams = await api.post<WechatPaymentParams, { orderId: string }>('/payments/wechat/prepay', {
      orderId
    })
    await Taro.requestPayment(paymentParams)
    const order = await api.post<MemberOrder, { orderId: string }>('/payments/wechat/confirm', {
      orderId
    })
    return { channel: 'wechat', order }
  }

  await delay()

  const order = updateOrder(orderId, (item) => ({
    ...item,
    status: 'paid',
    paidAt: createNowIso()
  }))

  return { channel: 'wechat', order }
}

export async function submitTransferVoucher(orderId: string, voucher: TransferVoucherPayload): Promise<MemberOrder> {
  if (!frontendMockEnabled) {
    return api.post<MemberOrder, { orderId: string } & TransferVoucherPayload>('/payments/transfer/voucher', {
      orderId,
      ...voucher
    })
  }

  await delay()

  return updateOrder(orderId, (item) => ({
    ...item,
    paymentMethod: 'transfer',
    status: 'transfer_pending',
    voucherFilename: voucher.filename
  }))
}

export async function getMockOrders() {
  return readStorage<MemberOrder[]>(ORDERS_STORAGE_KEY, [])
}
