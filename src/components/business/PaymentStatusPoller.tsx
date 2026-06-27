import { useEffect, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar } from './ActionBar'
import { SectionCard } from './SectionCard'
import type { ActionItem } from './types'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface PaymentStatusResult {
  status: PaymentStatus
  message?: string
}

export interface PaymentStatusPollerProps<TResult extends PaymentStatusResult = PaymentStatusResult> {
  orderNo: string
  queryStatus: (orderNo: string) => Promise<TResult>
  intervalMs?: number
  timeoutMs?: number
  onSuccess: (result: TResult) => void
  onRetryPayment?: () => void | Promise<void>
  onBack?: () => void | Promise<void>
}

type PollerState = 'polling' | 'paid' | 'failed' | 'cancelled' | 'timeout'

const DEFAULT_INTERVAL_MS = 2000
const DEFAULT_TIMEOUT_MS = 30000

function getStatusTitle(state: PollerState) {
  if (state === 'paid') {
    return '支付成功'
  }

  if (state === 'failed') {
    return '支付失败'
  }

  if (state === 'cancelled') {
    return '支付已取消'
  }

  if (state === 'timeout') {
    return '查询超时'
  }

  return '支付处理中'
}

function getStatusDesc(state: PollerState, message?: string) {
  if (message) {
    return message
  }

  if (state === 'failed') {
    return '本次支付未完成，请重新查询或重新发起支付。'
  }

  if (state === 'cancelled') {
    return '订单支付已取消，可重新支付或返回权益页。'
  }

  if (state === 'timeout') {
    return '暂未确认支付结果，请重新查询或稍后再试。'
  }

  if (state === 'paid') {
    return '权益正在为你开通，请稍候。'
  }

  return '正在确认支付结果，请勿重复关闭页面。'
}

export function PaymentStatusPoller<TResult extends PaymentStatusResult = PaymentStatusResult>({
  orderNo,
  queryStatus,
  intervalMs = DEFAULT_INTERVAL_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onSuccess,
  onRetryPayment,
  onBack,
}: PaymentStatusPollerProps<TResult>) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<PollerState>('polling')
  const [message, setMessage] = useState<string>()
  const callbacksRef = useRef({ queryStatus, onSuccess, onRetryPayment, onBack })

  useEffect(() => {
    callbacksRef.current = { queryStatus, onSuccess, onRetryPayment, onBack }
  }, [queryStatus, onSuccess, onRetryPayment, onBack])

  useEffect(() => {
    let isActive = true
    let didTimeout = false
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined

    const clearPollTimer = () => {
      if (pollTimer) {
        clearTimeout(pollTimer)
        pollTimer = undefined
      }
    }

    const clearTimeoutTimer = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = undefined
      }
    }

    const poll = async () => {
      if (!isActive || didTimeout) return

      try {
        const result = await callbacksRef.current.queryStatus(orderNo)

        if (!isActive || didTimeout) return

        if (result.status === 'paid') {
          clearTimeoutTimer()
          setState('paid')
          setMessage(result.message)
          callbacksRef.current.onSuccess(result)
          return
        }

        if (result.status === 'failed' || result.status === 'cancelled') {
          clearTimeoutTimer()
          setState(result.status)
          setMessage(result.message)
          return
        }

        setMessage(result.message)
        if (didTimeout) return

        pollTimer = setTimeout(() => {
          void poll()
        }, intervalMs)
      } catch {
        if (!isActive || didTimeout) return

        setMessage('支付结果查询失败，请稍后重新查询。')
        pollTimer = setTimeout(() => {
          void poll()
        }, intervalMs)
      }
    }

    timeoutTimer = setTimeout(() => {
      if (!isActive) return

      didTimeout = true
      clearPollTimer()
      setState('timeout')
      setMessage(undefined)
    }, timeoutMs)

    setState('polling')
    setMessage(undefined)
    void poll()

    return () => {
      isActive = false
      clearPollTimer()
      clearTimeoutTimer()
    }
  }, [orderNo, attempt, intervalMs, timeoutMs])

  const restartPolling = () => {
    setMessage(undefined)
    setAttempt((current) => current + 1)
  }

  const actions: ActionItem[] = [{ label: '重新查询', variant: 'outline', onClick: restartPolling }]

  if (onRetryPayment) {
    actions.push({ label: '重新支付', variant: 'gold', onClick: onRetryPayment })
  }

  if (onBack) {
    actions.push({ label: '返回权益页', variant: 'primary', onClick: onBack })
  }

  const shouldShowActions = state === 'failed' || state === 'cancelled' || state === 'timeout'

  return (
    <SectionCard title="支付状态">
      <View className="flex flex-col gap-3">
        <View className="flex flex-col gap-1">
          <Text className="text-base font-bold text-ink">{getStatusTitle(state)}</Text>
          <Text className="text-sm leading-6 text-muted">{getStatusDesc(state, message)}</Text>
        </View>

        <View className="rounded-lg bg-canvas p-3">
          <Text className="text-xs text-muted">订单号</Text>
          <Text className="mt-1 text-sm font-semibold text-ink">{orderNo}</Text>
        </View>

        {state === 'polling' ? (
          <Text className="text-xs text-tech">系统会自动刷新支付结果</Text>
        ) : shouldShowActions ? (
          <ActionBar actions={actions} />
        ) : (
          <Text className="text-xs text-tech">系统已确认支付成功</Text>
        )}
      </View>
    </SectionCard>
  )
}
