export type OrderPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface OrderPaymentSnapshot {
  status?: number
  status_text?: string
  pay_time?: string | null
}

export interface NormalizedOrderPaymentStatus<TData extends OrderPaymentSnapshot = OrderPaymentSnapshot> {
  status: OrderPaymentStatus
  message: string
  data: TData
}

export function normalizeOrderPaymentStatus<TData extends OrderPaymentSnapshot>(
  data: TData
): NormalizedOrderPaymentStatus<TData> {
  const statusText = data.status_text?.trim() ?? ''

  if (data.pay_time || data.status === 1 || data.status === 2 || /已支付|支付成功|已完成|待服务/.test(statusText)) {
    return { status: 'paid', message: statusText || '支付成功', data }
  }

  if (data.status === 3 || /取消|关闭|失效|过期/.test(statusText)) {
    return { status: 'cancelled', message: statusText || '订单已取消', data }
  }

  if (/失败|异常|错误/.test(statusText)) {
    return { status: 'failed', message: statusText || '支付失败', data }
  }

  return { status: 'pending', message: statusText || '支付结果确认中', data }
}
