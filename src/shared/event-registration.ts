import Taro from '@tarojs/taro'
import { router, routes } from './router'
import { textOf } from './view-data'

export interface EventRegistrationState {
  id?: number
  status?: number | string | boolean | null
  status_text?: string | null
}

const REGISTERING_STATUS = 1

function normalizeStatus(status: EventRegistrationState['status']) {
  if (status === null || status === undefined || status === '') {
    return undefined
  }

  const value = Number(status)
  return Number.isNaN(value) ? undefined : value
}

function normalizeStatusText(event: EventRegistrationState) {
  return textOf(event.status_text)
}

export function isEventRegistrationOpen(event: EventRegistrationState) {
  const status = normalizeStatus(event.status)

  if (status !== undefined) {
    return status === REGISTERING_STATUS
  }

  const statusText = normalizeStatusText(event)

  if (!statusText) {
    return true
  }

  if (/已满|满员|结束|截止|关闭|未开始/.test(statusText)) {
    return false
  }

  return /报名中|开放报名|可报名/.test(statusText)
}

export function getEventRegistrationUnavailableMessage(event: EventRegistrationState) {
  const status = normalizeStatus(event.status)

  if (status === 2) {
    return '活动名额已满'
  }

  return '活动不在报名期'
}

export function showEventRegistrationUnavailable(event: EventRegistrationState) {
  Taro.showToast({
    title: getEventRegistrationUnavailableMessage(event),
    icon: 'none'
  })
}

export function openEventSignupIfAvailable(event: EventRegistrationState) {
  if (!event.id) {
    Taro.showToast({ title: '暂无活动数据', icon: 'none' })
    return
  }

  if (!isEventRegistrationOpen(event)) {
    showEventRegistrationUnavailable(event)
    return
  }

  router.to(routes.eventSignup, { event_id: event.id })
}
