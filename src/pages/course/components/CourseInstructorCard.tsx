import { useState, type ReactNode } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { SectionCard } from '@/components/business'
import { textOf, textOrPlaceholder } from '@/shared/view-data'

interface CourseInstructorCardProps {
  avatar?: string
  children?: ReactNode
  intro?: string
  name?: string
}

export function CourseInstructorCard({ avatar, children, intro, name }: CourseInstructorCardProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string>()
  const avatarUrl = textOf(avatar)

  return (
    <SectionCard title="讲师介绍">
      <View className="flex min-w-0 items-start gap-3">
        {avatarUrl && avatarUrl !== failedAvatarUrl ? (
          <Image
            className="h-14 w-14 shrink-0 rounded-full border-2 border-gold-soft bg-canvas"
            mode="aspectFill"
            src={avatarUrl}
            onError={() => setFailedAvatarUrl(avatarUrl)}
          />
        ) : (
          <View className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <AppIcon name="user-3-line" size={26} />
          </View>
        )}
        <View className="min-w-0 flex-1 pt-1">
          <View className="flex min-w-0 items-center gap-2">
            <Text className="min-w-0 truncate text-base font-bold text-ink">{textOrPlaceholder(name, '课程讲师')}</Text>
            <Text className="shrink-0 rounded-full bg-gold-soft px-2 py-1 text-[20rpx] font-semibold text-gold">
              讲师
            </Text>
          </View>
          <Text className="mt-2 block break-all text-sm leading-6 text-muted">
            {textOrPlaceholder(intro, '暂无讲师简介')}
          </Text>
        </View>
      </View>
      {children}
    </SectionCard>
  )
}
