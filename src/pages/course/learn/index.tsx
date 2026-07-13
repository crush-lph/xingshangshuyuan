import { useEffect, useMemo, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, Video, View, type VideoProps } from '@tarojs/components'
import { ActionBar, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  getCourseDetail,
  getUserCourseProgress,
  getCourseSections,
  updateUserCourseProgress,
  type GetCourseDetailData,
  type GetCourseSectionsData
} from '@/services'
import { router, routes } from '@/shared/router'
import { compactJoin, getPageParam, textOf, textOrPlaceholder } from '@/shared/view-data'
import {
  CourseSectionTree,
  flattenPlayableSections,
  normalizeCourseSectionTree,
  type CourseSectionNode
} from '../components/CourseSectionTree'

type VideoTimeUpdateEvent = Parameters<NonNullable<VideoProps['onTimeUpdate']>>[0]

const PROGRESS_REPORT_INTERVAL_SECONDS = 30
const COMPLETION_THRESHOLD = 0.95

function findInitialSection(sections: CourseSectionNode[], sectionId?: string) {
  const playableSections = flattenPlayableSections(sections)

  return (
    playableSections.find((section) => String(section.id) === String(sectionId)) ??
    playableSections.find((section) => section.is_free) ??
    playableSections[0] ??
    null
  )
}

function normalizeDuration(value: unknown) {
  const duration = Number(value)

  return Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : undefined
}

export default function CourseLearnPage() {
  const [course, setCourse] = useState<GetCourseDetailData | null>(null)
  const [sections, setSections] = useState<CourseSectionNode[]>([])
  const [activeSection, setActiveSection] = useState<CourseSectionNode | null>(null)
  const [accessNotice, setAccessNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const lastReportedRef = useRef<{ sectionId?: number | string; position: number }>({ position: 0 })
  const isReportingRef = useRef(false)
  const isAccessPromptVisibleRef = useRef(false)

  useEffect(() => {
    async function loadLearningData() {
      setIsLoading(true)
      setHasError(false)

      const courseId = getPageParam('course_id')
      const sectionId = getPageParam('section_id')

      if (!courseId) {
        setCourse(null)
        setSections([])
        setActiveSection(null)
        setAccessNotice('')
        return
      }

      const [detailResult, sectionsResult, progressResult] = await Promise.allSettled([
        getCourseDetail({ course_id: courseId }),
        getCourseSections({ course_id: courseId }),
        getUserCourseProgress({ course_id: courseId })
      ])

      const nextSections =
        sectionsResult.status === 'fulfilled'
          ? normalizeCourseSectionTree((sectionsResult.value.data ?? []) as GetCourseSectionsData)
          : []
      const progressSectionId =
        progressResult.status === 'fulfilled' ? progressResult.value.data.last_section_id : undefined
      const progressErrorMessage =
        progressResult.status === 'rejected' && progressResult.reason instanceof Error
          ? progressResult.reason.message
          : ''
      const initialSectionId = sectionId ?? (progressSectionId === undefined ? undefined : String(progressSectionId))

      const nextCourse =
        detailResult.status === 'fulfilled' && detailResult.value.data.id ? detailResult.value.data : null
      const initialSection = findInitialSection(nextSections, initialSectionId)
      const freeSection = flattenPlayableSections(nextSections).find((section) => Boolean(section.is_free)) ?? null
      const accessibleSection = nextCourse?.is_bought || initialSection?.is_free ? initialSection : freeSection

      setCourse(nextCourse)
      setSections(nextSections)
      setActiveSection(accessibleSection)
      setAccessNotice(
        nextCourse && !nextCourse.is_bought
          ? progressErrorMessage || (freeSection ? '未购买此课程，当前仅可试看免费章节' : '未购买此课程')
          : ''
      )
      setHasError(
        detailResult.status === 'rejected' &&
          sectionsResult.status === 'rejected' &&
          progressResult.status === 'rejected'
      )
    }

    void loadLearningData()
      .catch(() => {
        setCourse(null)
        setSections([])
        setActiveSection(null)
        setAccessNotice('')
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const playableSections = useMemo(() => flattenPlayableSections(sections), [sections])
  const videoUrl = textOf(activeSection?.video_url)
  const canPlayActiveSection = Boolean(course?.is_bought || activeSection?.is_free)
  const hasFreeTrial = playableSections.some((section) => Boolean(section.is_free))

  useEffect(() => {
    lastReportedRef.current = { sectionId: activeSection?.id, position: 0 }
    isReportingRef.current = false
  }, [activeSection?.id])

  function markSectionCompleted(sectionId: CourseSectionNode['id']) {
    function updateSections(items: CourseSectionNode[]): CourseSectionNode[] {
      return items.map((item) => ({
        ...item,
        is_completed: item.id === sectionId ? true : item.is_completed,
        children: item.children ? updateSections(item.children) : item.children
      }))
    }

    setSections(updateSections)
    setActiveSection((current) => (current?.id === sectionId ? { ...current, is_completed: true } : current))
  }

  async function reportLearningProgress(options: {
    currentTime?: number
    duration?: number
    force?: boolean
    isCompleted?: boolean
    showToast?: boolean
  }) {
    if (!course?.id || !course.is_bought || !activeSection?.id) {
      return
    }

    const sectionId = activeSection.id
    const duration = normalizeDuration(options.duration) ?? normalizeDuration(activeSection.duration)
    const currentTime = normalizeDuration(options.currentTime) ?? duration ?? lastReportedRef.current.position
    const position = Math.max(0, currentTime ?? 0)
    const lastReported = lastReportedRef.current

    if (isReportingRef.current && !options.force) {
      return
    }

    if (!options.force && options.isCompleted && activeSection.is_completed) {
      return
    }

    if (
      !options.force &&
      !options.isCompleted &&
      lastReported.sectionId === sectionId &&
      position - lastReported.position < PROGRESS_REPORT_INTERVAL_SECONDS
    ) {
      return
    }

    try {
      isReportingRef.current = true
      await updateUserCourseProgress({
        course_id: course.id,
        section_id: sectionId,
        watched_duration: position || undefined,
        last_position: position || undefined,
        is_completed: options.isCompleted ? 1 : undefined
      })

      lastReportedRef.current = { sectionId, position }

      if (options.isCompleted) {
        markSectionCompleted(sectionId)
      }

      if (options.showToast) {
        Taro.showToast({ title: '学习进度已更新', icon: 'success' })
      }
    } catch {
      if (options.showToast) {
        Taro.showToast({ title: '进度更新失败', icon: 'none' })
      }
    } finally {
      isReportingRef.current = false
    }
  }

  function handleTimeUpdate(event: VideoTimeUpdateEvent) {
    const currentTime = normalizeDuration(event.detail.currentTime)
    const duration = normalizeDuration(event.detail.duration) ?? normalizeDuration(activeSection?.duration)

    if (currentTime === undefined) {
      return
    }

    const isCompleted = Boolean(duration && currentTime / duration >= COMPLETION_THRESHOLD)

    void reportLearningProgress({
      currentTime,
      duration,
      isCompleted
    })
  }

  function handleEnded() {
    const duration = normalizeDuration(activeSection?.duration) ?? lastReportedRef.current.position

    void reportLearningProgress({
      currentTime: duration,
      duration,
      force: true,
      isCompleted: true,
      showToast: true
    })
  }

  async function handleSelectSection(section: CourseSectionNode) {
    if (course?.is_bought || section.is_free) {
      if (!section.children?.length || section.video_url) {
        setActiveSection(section)
      }
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

      if (result.confirm && course?.id !== undefined) {
        await router.to(routes.coursePurchase, { course_id: course.id })
      }
    } finally {
      isAccessPromptVisibleRef.current = false
    }
  }

  return (
    <PageShell
      title="课程学习"
      subtitle={course ? compactJoin([course.title, activeSection?.title]) || '课程学习' : '课程学习'}
    >
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : course ? (
        <View className="grid gap-3">
          {accessNotice ? (
            <SectionCard title="课程未购买">
              <Text className="block text-sm font-semibold leading-6 text-ink">{accessNotice}</Text>
              <Text className="block text-sm leading-6 text-muted">
                {hasFreeTrial
                  ? '你还没有购买此课程，当前仅开放免费试看章节。购买后可学习完整目录并记录学习进度。'
                  : '你还没有购买此课程，购买后可学习完整内容并记录学习进度。'}
              </Text>
              <View className="mt-3">
                <ActionBar
                  actions={[
                    {
                      label: '购买课程',
                      variant: 'gold',
                      path: routes.coursePurchase,
                      query: { course_id: course.id }
                    }
                  ]}
                />
              </View>
            </SectionCard>
          ) : null}

          <View className="overflow-hidden rounded-lg bg-black shadow-medium">
            {videoUrl && canPlayActiveSection ? (
              <Video
                className="h-[420rpx] w-full"
                controls
                duration={Number(activeSection?.duration) || undefined}
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
                poster={textOf(course.thumbnail)}
                src={videoUrl}
              />
            ) : (
              <View className="flex h-[420rpx] items-center justify-center bg-brand-deep px-6 text-center">
                <Text className="text-sm leading-6 text-white/70">
                  {!course.is_bought || (!canPlayActiveSection && activeSection)
                    ? '当前章节购买课程后可学习'
                    : '当前章节暂未配置视频地址'}
                </Text>
              </View>
            )}
          </View>

          <SectionCard title={textOrPlaceholder(activeSection?.title, '课程章节')}>
            <Text className="block text-sm leading-6 text-muted">
              {textOrPlaceholder(course.description, '接口未返回课程说明')}
            </Text>
          </SectionCard>

          <SectionCard title="课程目录">
            {playableSections.length ? (
              <CourseSectionTree
                activeSectionId={activeSection?.id}
                sections={sections}
                onSelect={(section) => void handleSelectSection(section)}
              />
            ) : (
              <StateNotice state="empty" copy={{ title: '暂无课程目录', desc: '当前接口没有返回课程章节。' }} />
            )}
          </SectionCard>

          <ActionBar
            actions={
              course.is_bought
                ? [
                    {
                      label: '课程详情',
                      variant: 'outline',
                      path: routes.courseDetail,
                      query: { course_id: course.id }
                    }
                  ]
                : [
                    {
                      label: '购买课程',
                      variant: 'gold',
                      path: routes.coursePurchase,
                      query: { course_id: course.id }
                    },
                    {
                      label: '课程详情',
                      variant: 'outline',
                      path: routes.courseDetail,
                      query: { course_id: course.id }
                    }
                  ]
            }
          />
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无课程', desc: '当前接口没有返回课程信息。' }} />
      )}
    </PageShell>
  )
}
