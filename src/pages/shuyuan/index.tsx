import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import {
  ActionBar,
  ItemList,
  SectionCard,
  StatGrid,
  StateNotice,
  type ListItem,
  type StatItem
} from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCourseCategories, getCourses, getEvents, getUserLearningStats } from '@/services'
import { openEventSignupIfAvailable } from '@/shared/event-registration'
import { routes } from '@/shared/router'
import { compactJoin, priceOf, textOrPlaceholder, textOf } from '@/shared/view-data'

export default function ShuyuanPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [recommendation, setRecommendation] = useState<{
    id?: number
    title: string
    desc: string
    eyebrow?: string
    status?: number
    status_text?: string
  } | null>(null)
  const [stats, setStats] = useState<StatItem[]>([])
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadShuyuanData() {
      setIsLoading(true)
      setHasError(false)

      const [categoriesResult, coursesResult, eventsResult, statsResult] = await Promise.allSettled([
        getCourseCategories(),
        getCourses({ page: 1, page_size: 3 }),
        getEvents({ page: 1, page_size: 1 }),
        getUserLearningStats()
      ])

      setHasError(
        categoriesResult.status === 'rejected' &&
          coursesResult.status === 'rejected' &&
          eventsResult.status === 'rejected' &&
          statsResult.status === 'rejected'
      )

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data.map((item) => textOrPlaceholder(item.name, '未命名分类')))
      }

      if (eventsResult.status === 'fulfilled') {
        const event = eventsResult.value.data.list?.[0]
        setRecommendation(
          event
            ? {
                id: event.id,
                eyebrow: textOf(event.status_text),
                title: textOrPlaceholder(event.title, '未命名活动'),
                desc: compactJoin([event.city, event.location, event.start_time]) || '接口未返回推荐活动信息',
                status: event.status,
                status_text: event.status_text
              }
            : null
        )
      }

      if (statsResult.status === 'fulfilled') {
        const data = statsResult.value.data
        const nextStats = [
          { label: '课程专题', value: data.total_courses, tone: 'brand' as const },
          { label: '已完成', value: data.completed_courses, tone: 'success' as const },
          { label: '证书', value: data.certificates_count, tone: 'gold' as const }
        ]
          .filter((item) => item.value !== undefined && item.value !== null)
          .map((item) => ({ ...item, value: String(item.value) }))
        setStats(nextStats)
      }

      if (coursesResult.status === 'fulfilled') {
        setItems(
          (coursesResult.value.data.list ?? []).slice(0, 3).map((course) => ({
            title: textOrPlaceholder(course.title, '未命名课程'),
            desc: textOrPlaceholder(course.description, '接口未返回课程描述'),
            meta:
              compactJoin([
                course.teacher_name,
                course.student_count ? `${course.student_count}人学习` : '',
                priceOf(course.price)
              ]) || undefined,
            tag: textOf(course.course_type_text),
            icon: 'book-open-line',
            tone: course.price ? 'gold' : 'brand',
            path: routes.eventDetail,
            query: course.id ? { course_id: course.id } : undefined,
            action: '查看'
          }))
        )
      }

      setIsLoading(false)
    }

    void loadShuyuanData()
  }, [])

  return (
    <PageShell title="行商书苑" subtitle="财税机构课程、活动和服务标准沉淀。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            {recommendation ? (
              <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
                {recommendation.eyebrow ? (
                  <Text className="block text-xs font-semibold text-gold-light">{recommendation.eyebrow}</Text>
                ) : null}
                <Text className="mt-2 block text-xl font-bold text-white">{recommendation.title}</Text>
                <Text className="mt-2 block text-sm leading-5 text-white/65">{recommendation.desc}</Text>
                <View className="mt-3">
                  <ActionBar
                    actions={[
                      {
                        label: '立即报名',
                        variant: 'gold',
                        onClick: () => openEventSignupIfAvailable(recommendation)
                      }
                    ]}
                  />
                </View>
              </View>
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无推荐活动', desc: '当前接口没有返回推荐活动。' }} />
            )}

            {stats.length ? (
              <StatGrid items={stats} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无学习统计', desc: '当前接口没有返回学习统计。' }} />
            )}

            <SectionCard title="学习分类">
              {categories.length ? (
                <View className="grid grid-cols-3 gap-2">
                  {categories.map((item) => (
                    <View key={item} className="rounded-lg bg-brand-soft px-3 py-3 text-center">
                      <Text className="text-xs font-semibold text-brand">{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无课程分类', desc: '当前接口没有返回课程分类。' }} />
              )}
            </SectionCard>

            {items.length ? (
              <ItemList items={items} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无课程', desc: '当前接口没有返回课程列表。' }} />
            )}

            <SectionCard title="服务标准">
              <Text className="block text-sm leading-6 text-muted">
                课程资料与资源模板优先向会员开放，具体权益以接口返回的会员配置为准。
              </Text>
            </SectionCard>
          </>
        ) : null}
      </View>
    </PageShell>
  )
}
