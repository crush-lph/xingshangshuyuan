import { Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { AppIcon } from '@/components/AppIcon'
import { getPageStateCopy, type PageStateCopy, type PageStateKind } from '@/shared/page-state'

export interface StateNoticeProps {
  state: PageStateKind
  copy?: Partial<PageStateCopy>
  actionText?: string
  onAction?: () => void
}

function SkeletonLine({ className }: { className: string }) {
  return <View className={`app-skeleton-pulse rounded-full bg-[#EEF3F8] ${className}`} />
}

function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <View className="overflow-hidden rounded-lg border border-line bg-white px-4 py-4 shadow-soft">
      <View className="flex items-start gap-3">
        <View className="app-skeleton-pulse h-10 w-10 shrink-0 rounded-lg bg-[#E9F2FB]" />
        <View className="min-w-0 flex-1">
          <View className="flex items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <SkeletonLine className="h-4 w-[58%]" />
              <SkeletonLine className="mt-3 h-3 w-[86%]" />
              {!compact ? <SkeletonLine className="mt-2 h-3 w-[66%]" /> : null}
            </View>
            <SkeletonLine className="h-6 w-[96rpx] shrink-0 rounded" />
          </View>
        </View>
      </View>
      <View className="mt-4 h-px bg-line" />
      <View className="mt-3 flex items-center justify-between gap-3">
        <SkeletonLine className="h-3 w-[42%]" />
        <SkeletonLine className="h-4 w-[130rpx]" />
      </View>
    </View>
  )
}

function LoadingSkeleton() {
  return (
    <View className="grid gap-3">
      <SkeletonCard />
      <SkeletonCard compact />
      <SkeletonCard compact />
    </View>
  )
}

export function StateNotice({ state, copy, actionText, onAction }: StateNoticeProps) {
  if (state === 'loading') {
    return <LoadingSkeleton />
  }

  const displayCopy = getPageStateCopy(state, copy)

  return (
    <View className="rounded-lg bg-white px-4 py-6 text-center shadow-soft">
      {state === 'empty' ? (
        <View className="flex flex-col items-center justify-center gap-2">
          <AppIcon name="archive-line" size={40} color="#8090AC" />
          <Text className="block text-sm font-semibold leading-5 text-muted">暂无数据</Text>
        </View>
      ) : (
        <>
          <Text className="block text-base font-bold text-ink">{displayCopy.title}</Text>
          <Text className="mt-2 block text-sm leading-5 text-muted">{displayCopy.desc}</Text>
        </>
      )}
      {actionText && onAction ? (
        <View className="mt-4">
          <Button type="primary" size="small" className="h-10 rounded-full border-0 px-4" onClick={onAction}>
            {actionText}
          </Button>
        </View>
      ) : null}
    </View>
  )
}
