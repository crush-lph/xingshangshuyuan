import { Text, View } from '@tarojs/components'

interface ListLoadMoreProps {
  hasMore: boolean
  isLoadingMore: boolean
  hasItems?: boolean
}

export function ListLoadMore({ hasItems = true, hasMore, isLoadingMore }: ListLoadMoreProps) {
  if (!hasItems) {
    return null
  }

  return (
    <View className="py-2 text-center">
      <Text className={`text-[22rpx] leading-6 text-muted ${isLoadingMore ? 'app-skeleton-pulse' : ''}`}>
        {isLoadingMore ? '正在加载更多' : hasMore ? '上拉加载更多' : '没有更多了'}
      </Text>
    </View>
  )
}
