import { Image, Text, View } from '@tarojs/components'

export interface ReviewDisplayItem {
  key: string
  title: string
  content: string
  rating?: number
  thumbnail?: string
  statusText?: string
  statusTone?: 'success' | 'neutral'
  meta?: string
  time?: string
}

function getRating(value?: number) {
  if (!value || value < 1) {
    return 5
  }

  if (value > 5) {
    return 5
  }

  return value
}

export function ReviewStars({ value }: { value?: number }) {
  const rating = getRating(value)

  return (
    <View className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Text key={index} className={`text-sm ${index < rating ? 'text-gold' : 'text-line'}`}>
          ★
        </Text>
      ))}
    </View>
  )
}

function getStatusClassName(tone: ReviewDisplayItem['statusTone']) {
  if (tone === 'neutral') {
    return 'bg-canvas text-muted'
  }

  return 'bg-[#E6F7F0] text-[#38A169]'
}

export function ReviewList({ items }: { items: ReviewDisplayItem[] }) {
  return (
    <View className="grid gap-2">
      {items.map((item) => (
        <View key={item.key} className="rounded-lg bg-white px-4 py-4 shadow-soft">
          <View className="flex items-start gap-3">
            {item.thumbnail ? (
              <Image className="h-12 w-12 shrink-0 rounded-lg bg-canvas" src={item.thumbnail} mode="aspectFill" />
            ) : (
              <View className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold-soft">
                <Text className="text-lg font-bold text-gold">评</Text>
              </View>
            )}
            <View className="min-w-0 flex-1">
              <View className="flex items-start justify-between gap-3">
                <Text className="text-base font-semibold text-ink">{item.title}</Text>
                {item.statusText ? (
                  <Text
                    className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${getStatusClassName(
                      item.statusTone
                    )}`}
                  >
                    {item.statusText}
                  </Text>
                ) : null}
              </View>
              <View className="mt-2">
                <ReviewStars value={item.rating} />
              </View>
              <Text className="mt-2 block text-sm leading-6 text-muted">{item.content}</Text>
              {item.meta || item.time ? (
                <View className="mt-3 flex items-center justify-between gap-3">
                  {item.meta ? <Text className="text-xs text-muted">{item.meta}</Text> : <View />}
                  {item.time ? <Text className="text-xs text-muted">{item.time}</Text> : null}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
