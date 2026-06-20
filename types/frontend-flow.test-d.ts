import {
  createMemberOrder,
  getCurrentAuthSession,
  getMockOrders,
  loginWithWechat,
  payMemberOrder,
  submitTransferVoucher,
  type AuthSession,
  type MemberOrder,
  type PaymentResult
} from '../src/shared/frontend-test-flow'

void getCurrentAuthSession().then((session) => {
  if (session) {
    session.token.toUpperCase()
    session.profile.companyName.trim()
  }
})

const authSession: Promise<AuthSession> = loginWithWechat()

const memberOrder: Promise<MemberOrder> = createMemberOrder({
  planId: 'elite-yearly',
  paymentMethod: 'wechat'
})

void memberOrder.then((order) => {
  order.id.toUpperCase()
  order.amount.toFixed(2)
  // @ts-expect-error status is a constrained union.
  order.status = 'unknown'
})

const paymentResult: Promise<PaymentResult> = payMemberOrder('XS20260620001')

void paymentResult.then((result) => {
  result.order.status === 'paid'
  result.channel.toUpperCase()
})

void submitTransferVoucher('XS20260620001', {
  filename: 'bank-receipt.png'
}).then((order) => {
  order.status === 'transfer_pending'
})

void getMockOrders().then((orders) => {
  orders.map((order) => order.title)
})

void authSession
