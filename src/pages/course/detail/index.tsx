import { useEffect, useState } from 'react'
import { RichText, Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getCourseDetail, getCourseSections, type GetCourseDetailData, type GetCourseSectionsData } from '@/services'
import { routes } from '@/shared/router'
import { compactJoin, getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { CourseSectionTree, normalizeCourseSectionTree, type CourseSectionNode } from '../components/CourseSectionTree'

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

  return (
    <PageShell
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
              {compactJoin([course.course_type_text, course.teacher_name]) || '接口未返回课程分类'}
            </Text>
            <Text className="mt-2 block text-xl font-bold text-white">
              {textOrPlaceholder(course.title, '未命名课程')}
            </Text>
            <Text className="mt-2 block text-sm leading-5 text-white/65">
              {textOrPlaceholder(course.description, '接口未返回课程简介')}
            </Text>
          </View>

          <FieldList
            fields={[
              { label: '授课老师', value: textOrPlaceholder(course.teacher_name) },
              { label: '课程价格', value: priceOf(course.price) ?? '免费' },
              { label: '学习人数', value: course.student_count === undefined ? '未提供' : `${course.student_count}人` },
              {
                label: '课程时长',
                value: formatDuration(course.total_duration) ?? textOrPlaceholder(course.section_count, '未提供')
              }
            ]}
          />

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
              <CourseSectionTree courseId={course.id ?? getPageParam('course_id')} sections={sections} />
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
                    {
                      label: '试看课程',
                      variant: 'outline',
                      path: routes.courseLearn,
                      query: course.id ? { course_id: course.id } : undefined
                    },
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
