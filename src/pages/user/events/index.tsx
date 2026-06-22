import { useEffect, useState } from 'react'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserCourses } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'

export default function UserEventsPage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadUserCourses() {
      const response = await getUserCourses({ page: 1, page_size: 20 })
      setItems(
        (response.data.list ?? []).map((item) => ({
          title: textOrPlaceholder(item.title, '未命名课程'),
          desc: item.progress !== undefined ? `学习进度 ${item.progress}%` : '接口未返回学习进度',
          meta: compactJoin([item.teacher_name, item.bought_at, item.expire_at ? `有效期至 ${item.expire_at}` : '']),
          tag: item.is_completed ? '已完成' : '学习中',
          path: routes.userPoints,
          query: item.course_id ? { course_id: item.course_id } : undefined,
          action: '继续学习'
        }))
      )
    }

    void loadUserCourses().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="我的活动" subtitle="管理报名记录、电子票和活动评价。">
      {items.length ? (
        <ItemList items={items} />
      ) : (
        <EmptyState title="暂无学习记录" desc="Apifox mock 未返回我的课程数据。" />
      )}
    </PageShell>
  )
}
