import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserMessages, markAllUserMessagesRead, markUserMessageRead } from '@/services'
import { firstRecordList, textOf, textOrPlaceholder } from '@/shared/view-data'

interface MessageItem extends ListItem {
  id?: number
  type?: number
  isRead?: boolean
}

const messageTabs = [
  { label: '全部' },
  { label: '系统', type: 1 },
  { label: '订单', type: 2 },
  { label: '商机', type: 3 },
  { label: '课程', type: 4 },
  { label: '互动', type: 5 }
] as const

function numberValue(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function booleanValue(value: unknown) {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false
  }

  return undefined
}

function mapMessage(value: Record<string, unknown>, onRead: (messageId: number) => Promise<void>): MessageItem {
  const id = numberValue(value.id ?? value.message_id)
  const type = numberValue(value.type)
  const isRead = booleanValue(value.is_read ?? value.read ?? value.has_read)

  return {
    id,
    type,
    isRead,
    title: textOrPlaceholder(value.title ?? value.message_title ?? value.subject, '未命名消息'),
    desc: textOrPlaceholder(value.content ?? value.message ?? value.body ?? value.summary, '接口未返回消息内容'),
    meta: textOf(value.created_at ?? value.time ?? value.updated_at),
    tag: textOf(value.type_text ?? value.category_text) ?? (isRead ? '已读' : '未读'),
    icon: 'notification-3-line',
    tone: isRead ? 'neutral' : 'brand',
    action: isRead ? '查看' : '标记已读',
    onClick: id && !isRead ? () => onRead(id) : undefined
  }
}

export default function UserMessagesPage() {
  const [activeTab, setActiveTab] = useState<(typeof messageTabs)[number]['label']>('全部')
  const [items, setItems] = useState<MessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const requestIdRef = useRef(0)

  async function handleMarkRead(messageId: number) {
    try {
      await markUserMessageRead({ message_id: messageId })
      setItems((current) =>
        current.map((item) =>
          item.id === messageId
            ? { ...item, isRead: true, tag: '已读', tone: 'neutral', action: '查看', onClick: undefined }
            : item
        )
      )
    } catch {
      Taro.showToast({ title: '标记已读失败', icon: 'none' })
    }
  }

  async function loadMessages() {
    const currentRequestId = requestIdRef.current + 1
    const activeItem = messageTabs.find((item) => item.label === activeTab)
    const activeType = activeItem && 'type' in activeItem ? activeItem.type : undefined

    requestIdRef.current = currentRequestId
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await getUserMessages({
        ...(activeType !== undefined ? { type: activeType } : {}),
        page: 1,
        page_size: 30
      })

      if (requestIdRef.current !== currentRequestId) {
        return
      }

      setItems(firstRecordList(response.data).map((item) => mapMessage(item, handleMarkRead)))
    } catch {
      if (requestIdRef.current !== currentRequestId) {
        return
      }

      setItems([])
      setHasError(true)
    } finally {
      if (requestIdRef.current === currentRequestId) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadMessages()
  }, [activeTab])

  async function handleMarkAllRead() {
    try {
      setIsSubmitting(true)
      await markAllUserMessagesRead()
      Taro.showToast({ title: '已全部标记已读', icon: 'success' })
      await loadMessages()
    } catch {
      Taro.showToast({ title: '操作失败，请稍后重试', icon: 'none' })
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  return (
    <PageShell title="消息中心" subtitle="查看系统、订单、商机、课程和互动通知。">
      <View className="grid gap-3">
        <View className="flex gap-2 overflow-x-auto">
          {messageTabs.map((item) => {
            const isActive = activeTab === item.label

            return (
              <View
                key={item.label}
                className={`shrink-0 rounded-full px-4 py-2 ${isActive ? 'bg-brand' : 'border border-line bg-white'}`}
                onClick={() => setActiveTab(item.label)}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-muted'}`}>{item.label}</Text>
              </View>
            )
          })}
        </View>

        <ActionBar actions={[{ label: isSubmitting ? '处理中' : '全部标记已读', onClick: handleMarkAllRead }]} />

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载消息', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '消息加载失败', desc: '请稍后重试。' }} />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无消息', desc: '当前筛选条件下没有消息。' }} />
        )}
      </View>
    </PageShell>
  )
}
