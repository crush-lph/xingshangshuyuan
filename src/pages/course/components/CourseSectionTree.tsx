import { Text, View } from '@tarojs/components'
import type { CourseSectionData } from '@/services'
import { router, routes } from '@/shared/router'
import { compactJoin, textOrPlaceholder } from '@/shared/view-data'

export interface CourseSectionNode extends CourseSectionData {
  children?: CourseSectionNode[]
}

interface CourseSectionTreeProps {
  activeSectionId?: number
  courseId?: string | number
  sections: CourseSectionNode[]
  onSelect?: (section: CourseSectionNode) => void
}

function formatDuration(value: unknown) {
  const duration = Number(value)

  if (!Number.isFinite(duration) || duration <= 0) {
    return undefined
  }

  return duration < 60 ? `${duration}分钟` : `${Math.floor(duration / 60)}小时${duration % 60}分钟`
}

function sortSections(sections: CourseSectionNode[]) {
  return [...sections].sort((first, second) => {
    const firstOrder = Number(first.sort_order ?? first.id ?? 0)
    const secondOrder = Number(second.sort_order ?? second.id ?? 0)

    return firstOrder - secondOrder
  })
}

function normalizeNestedSections(sections: CourseSectionData[]): CourseSectionNode[] {
  return sortSections(
    sections.map((section) => ({
      ...section,
      children: section.children?.length ? normalizeNestedSections(section.children) : undefined
    }))
  )
}

export function normalizeCourseSectionTree(sections: CourseSectionData[]): CourseSectionNode[] {
  const hasNestedChildren = sections.some((section) => section.children?.length)

  if (hasNestedChildren) {
    return normalizeNestedSections(sections)
  }

  const nodeMap = new Map<number, CourseSectionNode>()
  const roots: CourseSectionNode[] = []

  sections.forEach((section) => {
    if (section.id === undefined) {
      roots.push({ ...section })
      return
    }

    nodeMap.set(section.id, { ...section })
  })

  nodeMap.forEach((node) => {
    const parentId = node.parent_id
    const parent = parentId === undefined || parentId === 0 ? undefined : nodeMap.get(parentId)

    if (parent) {
      parent.children = [...(parent.children ?? []), node]
      return
    }

    roots.push(node)
  })

  nodeMap.forEach((node) => {
    if (node.children?.length) {
      node.children = sortSections(node.children)
    }
  })

  return sortSections(roots)
}

export function flattenPlayableSections(sections: CourseSectionNode[]): CourseSectionNode[] {
  return sections.flatMap((section) => {
    const children = section.children ?? []
    const isPlayable = Boolean(section.video_url) || !children.length

    return [...(isPlayable ? [section] : []), ...flattenPlayableSections(children)]
  })
}

function getSectionMeta(section: CourseSectionNode) {
  return compactJoin([
    section.is_free ? '免费试看' : '会员或购买后学习',
    formatDuration(section.duration),
    section.duration_text
  ])
}

function getSectionStatus(section: CourseSectionNode, isActive: boolean) {
  if (isActive) {
    return { text: '当前学习', className: 'bg-[#E8F3FF] text-tech' }
  }

  if (section.is_completed) {
    return { text: '已学完', className: 'bg-[#E6F7F0] text-[#2F855A]' }
  }

  if (section.is_free) {
    return { text: '试看', className: 'bg-gold-soft text-gold' }
  }

  return undefined
}

export function CourseSectionTree({ activeSectionId, courseId, sections, onSelect }: CourseSectionTreeProps) {
  function openSection(section: CourseSectionNode) {
    if (onSelect) {
      onSelect(section)
      return
    }

    if (courseId && section.id) {
      router.to(routes.courseLearn, { course_id: courseId, section_id: section.id })
    }
  }

  function renderSection(section: CourseSectionNode, index: number, level = 0) {
    const children = section.children ?? []
    const isActive = activeSectionId !== undefined && section.id === activeSectionId
    const isChapter = children.length > 0
    const canOpen = Boolean(onSelect || (courseId && section.id))
    const status = getSectionStatus(section, isActive)
    const title = textOrPlaceholder(section.title, `${isChapter ? '章节' : '课时'}${index + 1}`)
    const meta = isChapter ? `${children.length} 个课时` : getSectionMeta(section)

    return (
      <View
        key={`${section.id ?? section.title}-${level}-${index}`}
        className={level === 0 ? 'border-b border-line pb-3 last:border-b-0 last:pb-0' : ''}
      >
        <View
          className={`${
            isChapter
              ? 'py-2'
              : `relative overflow-hidden rounded-[12px] border px-3 py-3 ${
                  isActive ? 'border-[#CFE2FF] bg-[#F4F8FF] shadow-soft' : 'border-transparent bg-white'
                }`
          }`}
          onClick={() => {
            if (canOpen && (!isChapter || section.video_url)) {
              openSection(section)
            }
          }}
        >
          {isActive && !isChapter ? (
            <View className="absolute bottom-3 left-0 top-3 w-[6rpx] rounded-r bg-tech" />
          ) : null}
          <View className="flex items-start gap-3">
            {!isChapter && !isActive ? (
              <View className="flex w-3 shrink-0 justify-center pt-[12rpx]">
                <View className="h-[12rpx] w-[12rpx] rounded-full bg-line" />
              </View>
            ) : null}
            <View className="min-w-0 flex-1">
              <View className="flex items-start justify-between gap-2">
                <Text
                  className={`${isChapter ? 'text-[30rpx]' : 'text-[28rpx]'} min-w-0 flex-1 font-bold leading-5 text-ink`}
                >
                  {title}
                </Text>
                {status ? (
                  <Text
                    className={`shrink-0 rounded-full px-2 py-[3px] text-[20rpx] font-semibold leading-[28rpx] ${status.className}`}
                  >
                    {status.text}
                  </Text>
                ) : null}
              </View>
              {meta ? <Text className="mt-1 block text-[24rpx] leading-[34rpx] text-muted">{meta}</Text> : null}
            </View>
          </View>
        </View>

        {children.length ? (
          <View className="mt-1 grid gap-1 pl-3">
            {children.map((child, childIndex) => renderSection(child, childIndex, level + 1))}
          </View>
        ) : null}
      </View>
    )
  }

  return <View className="grid gap-3">{sections.map((section, index) => renderSection(section, index))}</View>
}
