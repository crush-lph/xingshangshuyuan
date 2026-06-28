import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCourses } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'

export default function UserEventsPage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadUserCourses() {
      setIsLoading(true)
      setHasError(false)

      const response = await getUserCourses({ page: 1, page_size: 20 })
      setItems(
        (response.data.list ?? []).map((item) => ({
          title: textOrPlaceholder(item.title, '未命名课程'),
          desc: item.progress !== undefined ? `学习进度 ${item.progress}%` : '接口未返回学习进度',
          meta: compactJoin([item.teacher_name, item.bought_at, item.expire_at ? `有效期至 ${item.expire_at}` : '']),
          tag: item.is_completed ? '已完成' : '学习中',
          icon: 'calendar-event-line',
          tone: item.is_completed ? 'success' : 'brand',
          path: routes.userPoints,
          query: item.course_id ? { course_id: item.course_id } : undefined,
          action: '继续学习'
        }))
      )
    }

    void loadUserCourses()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="我的活动" subtitle="活动报名记录接口暂未接入，当前不展示电子票或活动评价入口。">
      <View className="grid gap-3">
        <StateNotice
          state="empty"
          copy={{
            title: '活动报名记录接口暂未接入',
            desc: '当前没有稳定接口返回我的活动报名、电子票或核销状态，因此不展示活动动作。'
          }}
        />
        {isLoading ? (
          <StateNotice
            state="loading"
            copy={{ title: '正在加载学习记录', desc: '仅作为学习记录展示，不代表活动报名。' }}
          />
        ) : hasError ? (
          <StateNotice
            state="error"
            copy={{ title: '学习记录加载失败', desc: '活动报名记录接口暂未接入，学习记录也暂时无法加载。' }}
          />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无学习记录', desc: '当前课程接口没有返回学习记录。' }} />
        )}
      </View>
    </PageShell>
  )
}
