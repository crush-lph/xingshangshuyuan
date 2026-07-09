import { useEffect, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCourses, type GetUserCoursesData } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, textOf, textOrPlaceholder } from '@/shared/view-data'

type UserCourseRecord = NonNullable<GetUserCoursesData['list']>[number]

interface UserCourseItem extends ListItem {
  isCompleted?: number
}

const courseTabs = [
  { label: '全部' },
  { label: '学习中', isCompleted: 0 },
  { label: '已完成', isCompleted: 1 }
] as const

function formatDuration(value: unknown) {
  const duration = Number(value)

  if (!Number.isFinite(duration) || duration <= 0) {
    return undefined
  }

  if (duration < 60) {
    return `${duration}秒`
  }

  const minutes = Math.floor(duration / 60)

  if (minutes < 60) {
    return `${minutes}分钟`
  }

  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60

  return restMinutes ? `${hours}小时${restMinutes}分钟` : `${hours}小时`
}

function mapUserCourse(item: UserCourseRecord): UserCourseItem {
  const progress = Number(item.progress)
  const progressText = Number.isFinite(progress) ? `${Math.round(progress)}%` : undefined

  return {
    title: textOrPlaceholder(item.title, '未命名课程'),
    desc: compactJoin([item.teacher_name, progressText ? `进度 ${progressText}` : '']) || '接口未返回学习进度',
    meta:
      compactJoin([
        formatDuration(item.learned_duration),
        item.expire_at ? `到期 ${item.expire_at}` : '',
        item.bought_at ? `购买于 ${item.bought_at}` : ''
      ]) || undefined,
    tag: item.is_completed ? '已完成' : '学习中',
    icon: 'book-open-line',
    tone: item.is_completed ? 'success' : 'brand',
    isCompleted: item.is_completed,
    path: routes.courseLearn,
    query: {
      course_id: item.course_id,
      section_id: item.last_section_id
    },
    action: item.is_completed ? '复习' : '继续学习'
  }
}

export default function UserCoursesPage() {
  const [activeTab, setActiveTab] = useState<(typeof courseTabs)[number]['label']>('全部')
  const [items, setItems] = useState<UserCourseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const currentRequestId = requestIdRef.current + 1
    const activeItem = courseTabs.find((item) => item.label === activeTab)
    const activeStatus = activeItem && 'isCompleted' in activeItem ? activeItem.isCompleted : undefined

    requestIdRef.current = currentRequestId

    async function loadUserCourses() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await getUserCourses({
          ...(activeStatus !== undefined ? { is_completed: activeStatus } : {}),
          page: 1,
          page_size: 20
        })

        if (requestIdRef.current !== currentRequestId) {
          return
        }

        setItems((response.data.list ?? []).map(mapUserCourse))
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

    void loadUserCourses()
  }, [activeTab])

  return (
    <PageShell title="我的课程" subtitle="查看已购买课程、学习进度和继续学习入口。">
      <View className="grid gap-3">
        <View className="flex gap-2 overflow-x-auto">
          {courseTabs.map((item) => {
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

        {isLoading ? (
          <StateNotice state="loading" copy={{ title: '正在加载课程记录', desc: '请稍候。' }} />
        ) : hasError ? (
          <StateNotice state="error" copy={{ title: '课程记录加载失败', desc: '请稍后重试。' }} />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无课程记录', desc: '当前筛选条件下没有课程。' }} />
        )}
      </View>
    </PageShell>
  )
}
