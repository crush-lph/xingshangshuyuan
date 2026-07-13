import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { RichText, Text, View } from '@tarojs/components'
import { ActionBar, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCourseDetail, getCourseSections, type GetCourseDetailData, type GetCourseSectionsData } from '@/services'
import { router, routes } from '@/shared/router'
import { compactJoin, getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import {
  CourseSectionTree,
  flattenPlayableSections,
  normalizeCourseSectionTree,
  type CourseSectionNode
} from '../components/CourseSectionTree'
import { CourseInstructorCard } from '../components/CourseInstructorCard'

function formatDuration(value: unknown) {
  const duration = Number(value)

  if (!Number.isFinite(duration) || duration <= 0) {
    return undefined
  }

  if (duration < 60) {
    return `${duration}分钟`
  }

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return minutes ? `${hours}小时${minutes}分钟` : `${hours}小时`
}

export default function CourseDetailPage() {
  const [course, setCourse] = useState<GetCourseDetailData | null>(null)
  const [sections, setSections] = useState<CourseSectionNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const isAccessPromptVisibleRef = useRef(false)

  useEffect(() => {
    async function loadCourse() {
      setIsLoading(true)
      setHasError(false)

      const courseId = getPageParam('course_id')

      if (!courseId) {
        setCourse(null)
        setSections([])
        return
      }

      const [detailResult, sectionsResult] = await Promise.allSettled([
        getCourseDetail({ course_id: courseId }),
        getCourseSections({ course_id: courseId })
      ])

      if (detailResult.status === 'fulfilled') {
        setCourse(detailResult.value.data.id ? detailResult.value.data : null)
      } else {
        setCourse(null)
      }

      if (sectionsResult.status === 'fulfilled') {
        setSections(normalizeCourseSectionTree((sectionsResult.value.data ?? []) as GetCourseSectionsData))
      } else {
        setSections([])
      }

      setHasError(detailResult.status === 'rejected' && sectionsResult.status === 'rejected')
    }

    void loadCourse()
      .catch(() => {
        setCourse(null)
        setSections([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSelectSection(section: CourseSectionNode) {
    const courseId = course?.id ?? getPageParam('course_id')

    if (courseId === undefined || section.id === undefined) {
      Taro.showToast({ title: '课时信息不完整', icon: 'none' })
      return
    }

    if (course?.is_bought || section.is_free) {
      await router.to(routes.courseLearn, { course_id: courseId, section_id: section.id })
      return
    }

    if (isAccessPromptVisibleRef.current) {
      return
    }

    isAccessPromptVisibleRef.current = true

    try {
      const result = await Taro.showModal({
        title: '课时未解锁',
        content: '购买课程后即可学习该课时。',
        confirmText: '去购买',
        cancelText: '暂不购买'
      })

      if (result.confirm) {
        await router.to(routes.coursePurchase, { course_id: courseId })
      }
    } finally {
      isAccessPromptVisibleRef.current = false
    }
  }

  return (
    <PageShell
      showHeader={false}
      title="课程详情"
      subtitle={course ? compactJoin([course.teacher_name, course.course_type_text]) || '课程接口详情' : '课程接口详情'}
    >
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : course ? (
        <View className="grid gap-3">
          <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
            <Text className="block text-xs font-semibold text-gold-light">
              {textOrPlaceholder(course.course_type_text, '课程')}
            </Text>
            <Text className="mt-2 block text-xl font-bold text-white">
              {textOrPlaceholder(course.title, '未命名课程')}
            </Text>
            <Text className="mt-2 block text-sm leading-5 text-white/65">
              {textOrPlaceholder(course.description, '接口未返回课程简介')}
            </Text>
            <View className="mt-4 grid grid-cols-3 overflow-hidden rounded-lg bg-white/10">
              <View className="min-w-0 px-2 py-3 text-center">
                <Text className="block text-[20rpx] leading-4 text-white/55">课程价格</Text>
                <Text className="mt-1 block min-w-0 truncate text-[22rpx] font-semibold text-white">
                  {priceOf(course.price) ?? '免费'}
                </Text>
              </View>
              <View className="min-w-0 border-l border-white/15 px-2 py-3 text-center">
                <Text className="block text-[20rpx] leading-4 text-white/55">学习人数</Text>
                <Text className="mt-1 block min-w-0 truncate text-[22rpx] font-semibold text-white">
                  {course.student_count === undefined ? '暂无数据' : `${course.student_count}人`}
                </Text>
              </View>
              <View className="min-w-0 border-l border-white/15 px-2 py-3 text-center">
                <Text className="block text-[20rpx] leading-4 text-white/55">课程时长</Text>
                <Text className="mt-1 block min-w-0 truncate text-[22rpx] font-semibold text-white">
                  {formatDuration(course.total_duration) ?? `${course.section_count ?? 0}课时`}
                </Text>
              </View>
            </View>
          </View>

          {textOf(course.teacher_name) || textOf(course.teacher_avatar) || textOf(course.teacher_intro) ? (
            <CourseInstructorCard
              avatar={course.teacher_avatar}
              intro={course.teacher_intro}
              name={course.teacher_name}
            />
          ) : null}

          <SectionCard title="课程介绍">
            {textOf(course.detail) ? (
              <RichText className="block text-sm leading-6 text-muted" nodes={textOf(course.detail) ?? ''} />
            ) : (
              <Text className="block text-sm leading-6 text-muted">
                {textOrPlaceholder(course.description, '接口未返回课程详情')}
              </Text>
            )}
          </SectionCard>

          <SectionCard title="课程目录">
            {sections.length ? (
              <CourseSectionTree sections={sections} onSelect={(section) => void handleSelectSection(section)} />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无课程目录', desc: '当前接口没有返回课程章节。' }} />
            )}
          </SectionCard>

          <ActionBar
            actions={
              course.is_bought
                ? [
                    {
                      label: '开始学习',
                      variant: 'gold',
                      path: routes.courseLearn,
                      query: course.id ? { course_id: course.id } : undefined
                    },
                    { label: '返回书苑', variant: 'outline', path: routes.shuyuan }
                  ]
                : [
                    ...(flattenPlayableSections(sections).some((section) => section.is_free)
                      ? [
                          {
                            label: '试看课程',
                            variant: 'outline' as const,
                            path: routes.courseLearn,
                            query: course.id ? { course_id: course.id } : undefined
                          }
                        ]
                      : []),
                    {
                      label: '购买课程',
                      variant: 'gold',
                      path: routes.coursePurchase,
                      query: course.id ? { course_id: course.id } : undefined
                    }
                  ]
            }
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无课程详情', desc: '当前接口没有返回课程详情。' }} />
      )}
    </PageShell>
  )
}
