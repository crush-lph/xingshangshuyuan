import Taro from '@tarojs/taro'

const wechatSignTypes = ['MD5', 'HMAC-SHA256', 'RSA'] as const

type WechatSignType = (typeof wechatSignTypes)[number]
type RequestPaymentOption = Parameters<typeof Taro.requestPayment>[0]

export interface WechatPaymentParams {
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
  paySign?: string
}

function isWechatSignType(value: string): value is WechatSignType {
  return wechatSignTypes.includes(value as WechatSignType)
}

export function createWechatPaymentOption(params?: WechatPaymentParams): RequestPaymentOption {
  const timeStamp = params?.timeStamp
  const nonceStr = params?.nonceStr
  const packageValue = params?.package
  const paySign = params?.paySign
  const signType = params?.signType
  let validatedSignType: WechatSignType | undefined

  if (!timeStamp || !nonceStr || !packageValue || !paySign) {
    throw new Error('支付参数不完整')
  }

  if (signType) {
    if (!isWechatSignType(signType)) {
      throw new Error('支付签名类型不支持')
    }
    validatedSignType = signType
  }

  return {
    timeStamp,
    nonceStr,
    package: packageValue,
    paySign,
    ...(validatedSignType ? { signType: validatedSignType } : {})
  }
}

export function getWechatPaymentErrorMessage(error: unknown) {
  const errMsg =
    typeof error === 'object' && error && 'errMsg' in error
      ? String((error as { errMsg?: unknown }).errMsg ?? '')
      : error instanceof Error
        ? error.message
        : ''

  if (/cancel/i.test(errMsg) || errMsg.includes('取消')) {
    return '支付已取消'
  }

  return errMsg || '支付失败，请稍后重试'
}

export function requestWechatPayment(params?: WechatPaymentParams) {
  return Taro.requestPayment(createWechatPaymentOption(params))
}
