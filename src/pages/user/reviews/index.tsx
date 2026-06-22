import { useEffect, useState } from 'react'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCourseProgress, getUserCourses } from '@/services'
import { getPageParam, textOrPlaceholder, textOf } from '@/shared/view-data'

export default function UserReviewsPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadProgress() {
      const courseId = getPageParam('course_id')

      if (courseId) {
        const response = await getUserCourseProgress({ course_id: courseId })
        setItems([
          {
            title: `课程 ${textOrPlaceholder(response.data.course_id, courseId)}`,
            desc: response.data.total_learn_duration_text ?? '接口未返回学习时长',
            tag: response.data.is_completed ? '已完成' : '学习中',
            action: '查看'
          }
        ])
        return
      }

      const response = await getUserCourses({ is_completed: 1, page: 1, page_size: 20 })
      setItems(
        (response.data.list ?? []).map((item) => ({
          title: textOrPlaceholder(item.title, '未命名课程'),
          desc: item.progress !== undefined ? `学习进度 ${item.progress}%` : '接口未返回学习进度',
          meta: textOf(item.bought_at),
          tag: item.is_completed ? '已完成' : '学习中',
          action: '查看'
        }))
      )
    }

    void loadProgress().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="我的评价" subtitle="对已完成的资源、活动和商机服务进行评价。">
      {items.length ? (
        <ItemList items={items} />
      ) : (
        <EmptyState title="暂无评价对象" desc="Apifox mock 未返回已完成课程或进度数据。" />
      )}
    </PageShell>
  )
}
