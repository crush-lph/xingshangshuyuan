import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { ActionBar, ListLoadMore, SectionCard, StatGrid, StateNotice, type StatItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCourseCategories, getCourses, getEvents, getUserLearningStats } from '@/services'
import { openEventSignupIfAvailable } from '@/shared/event-registration'
import { router, routes, type Query } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { compactJoin, dateTimeRangeOf, priceOf, textOrPlaceholder, textOf } from '@/shared/view-data'

interface CourseCardItem {
  title: string
  desc: string
  meta?: string
  price?: string
  tag?: string
  query?: Query
}

interface CourseCategoryItem {
  id?: number
  name: string
}

type CourseRecord = NonNullable<Awaited<ReturnType<typeof getCourses>>['data']['list']>[number]

function getCourseCategoryChipId(categoryId?: number) {
  return `course-category-${categoryId ?? 'all'}`
}

function mapCourseItems(list: CourseRecord[]): CourseCardItem[] {
  return list.map((course) => ({
    title: textOrPlaceholder(course.title, '未命名课程'),
    desc: textOrPlaceholder(course.description, '接口未返回课程描述'),
    meta: compactJoin([course.teacher_name, course.student_count ? `${course.student_count}人学习` : '']) || undefined,
    price: priceOf(course.price),
    tag: textOf(course.course_type_text),
    query: course.id ? { course_id: course.id } : undefined
  }))
}

function CourseCard({ item }: { item: CourseCardItem }) {
  return (
    <View
      className="max-w-full overflow-hidden rounded-lg border border-line bg-white px-4 py-4 shadow-soft"
      onClick={() => router.to(routes.courseDetail, item.query)}
    >
      <View className="flex items-start gap-3">
        <View className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-gold">
          <AppIcon name="book-open-line" size={21} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex items-start justify-between gap-2">
            <Text className="min-w-0 flex-1 break-all text-base font-bold leading-6 text-ink">{item.title}</Text>
            {item.tag ? (
              <Text className="shrink-0 rounded bg-gold-soft px-2 py-1 text-[20rpx] font-semibold text-gold">
                {item.tag}
              </Text>
            ) : null}
          </View>
          <Text className="mt-2 block break-all text-sm leading-6 text-muted">{item.desc}</Text>
        </View>
      </View>

      <View className="mt-3 h-px bg-line" />

      <View className="mt-3 flex items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 break-all text-xs leading-5 text-muted">{item.meta || '课程信息待完善'}</Text>
        {item.price ? <Text className="shrink-0 text-lg font-bold leading-6 text-gold">{item.price}</Text> : null}
        <View className="flex shrink-0 items-center gap-1">
          <Text className="text-xs font-semibold text-tech">查看</Text>
          <AppIcon name="arrow-right-s-line" size={18} color="#1677FF" />
        </View>
      </View>
    </View>
  )
}

export default function ShuyuanPage() {
  const [categories, setCategories] = useState<CourseCategoryItem[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<number | undefined>()
  const [recommendation, setRecommendation] = useState<{
    id?: number
    title: string
    desc: string
    eyebrow?: string
    status?: number
    status_text?: string
  } | null>(null)
  const [stats, setStats] = useState<StatItem[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const {
    hasError: hasCoursesError,
    hasMore,
    isLoading: isCoursesLoading,
    isLoadingMore,
    items
  } = usePaginatedList<CourseRecord, CourseCardItem>({
    deps: [activeCategoryId],
    fetchPage: ({ page, page_size }) =>
      getCourses({
        ...(activeCategoryId !== undefined ? { category_id: activeCategoryId } : {}),
        page,
        page_size
      }),
    mapItems: mapCourseItems
  })
  const isLoading = isPageLoading && isCoursesLoading

  function handleCategoryChange(categoryId?: number) {
    if (activeCategoryId === categoryId) {
      return
    }

    setActiveCategoryId(categoryId)
  }

  useEffect(() => {
    async function loadShuyuanData() {
      setIsPageLoading(true)
      setHasError(false)

      const [categoriesResult, eventsResult, statsResult] = await Promise.allSettled([
        getCourseCategories(),
        getEvents({ page: 1, page_size: 1 }),
        getUserLearningStats()
      ])

      setHasError(
        categoriesResult.status === 'rejected' &&
          eventsResult.status === 'rejected' &&
          statsResult.status === 'rejected'
      )

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          categoriesResult.value.data.map((item) => ({
            id: item.id,
            name: textOrPlaceholder(item.name, '未命名分类')
          }))
        )
      }

      if (eventsResult.status === 'fulfilled') {
        const event = eventsResult.value.data.list?.[0]
        setRecommendation(
          event
            ? {
                id: event.id,
                eyebrow: textOf(event.status_text),
                title: textOrPlaceholder(event.title, '未命名活动'),
                desc:
                  compactJoin([
                    event.city,
                    event.location,
                    dateTimeRangeOf(event.event_date, event.start_time, event.end_time)
                  ]) || '接口未返回推荐活动信息',
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

      setIsPageLoading(false)
    }

    void loadShuyuanData()
  }, [])

  return (
    <PageShell showHeader={false} title="行商书苑" subtitle="财税机构课程、活动和服务标准沉淀。">
      <View className="grid max-w-full gap-3 overflow-hidden">
        {isLoading ? <StateNotice state="loading" /> : null}
        {!isLoading && hasError ? <StateNotice state="error" /> : null}

        {!isLoading && !hasError ? (
          <>
            {recommendation ? (
              <View className="max-w-full overflow-hidden rounded-lg bg-brand-deep p-4 shadow-medium">
                {recommendation.eyebrow ? (
                  <Text className="block text-xs font-semibold text-gold-light">{recommendation.eyebrow}</Text>
                ) : null}
                <Text className="mt-2 block break-all text-xl font-bold leading-7 text-white">
                  {recommendation.title}
                </Text>
                <Text className="mt-2 block break-all text-sm leading-5 text-white/65">{recommendation.desc}</Text>
                <View className="mt-3 max-w-full overflow-hidden">
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
                <ScrollView scrollX enhanced showScrollbar={false} className="w-full max-w-full overflow-hidden">
                  <View className="inline-flex gap-2 px-1">
                    {[{ id: undefined, name: '全部课程' }, ...categories].map((item) => {
                      const isActive = activeCategoryId === item.id

                      return (
                        <View
                          id={getCourseCategoryChipId(item.id)}
                          key={item.id ?? 'all'}
                          className={`shrink-0 rounded-full border px-4 py-2 ${
                            isActive ? 'border-brand bg-brand' : 'border-transparent bg-brand-soft'
                          }`}
                          onClick={() => handleCategoryChange(item.id)}
                        >
                          <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-brand'}`}>
                            {item.name}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                </ScrollView>
              ) : (
                <StateNotice state="empty" copy={{ title: '暂无课程分类', desc: '当前接口没有返回课程分类。' }} />
              )}
            </SectionCard>

            {isCoursesLoading ? (
              <StateNotice state="loading" copy={{ title: '正在筛选课程', desc: '请稍候。' }} />
            ) : hasCoursesError ? (
              <StateNotice state="error" copy={{ title: '课程加载失败', desc: '请稍后重试。' }} />
            ) : items.length ? (
              <View className="grid max-w-full gap-3 overflow-hidden">
                {items.map((item, index) => (
                  <CourseCard key={`${item.title}-${index}`} item={item} />
                ))}
                <ListLoadMore hasItems={items.length > 0} hasMore={hasMore} isLoadingMore={isLoadingMore} />
              </View>
            ) : (
              <StateNotice
                state="empty"
                copy={{
                  title: '暂无课程',
                  desc: activeCategoryId ? '当前分类下没有课程。' : '当前接口没有返回课程列表。'
                }}
              />
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
