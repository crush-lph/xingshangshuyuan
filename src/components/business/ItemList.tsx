import { Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { getAppIconName } from '@/shared/app-icons'
import { router } from '@/shared/router'
import type { ListItem } from './types'

interface ItemListProps {
  items: ListItem[]
  variant?: 'default' | 'embedded'
}

const toneClassName: Record<NonNullable<ListItem['tone']>, { bg: string; text: string; tag: string }> = {
  brand: { bg: 'bg-brand-soft', text: 'text-brand', tag: 'bg-brand-soft text-brand' },
  gold: { bg: 'bg-gold-soft', text: 'text-gold', tag: 'bg-gold-soft text-gold' },
  success: { bg: 'bg-[#E6F7F0]', text: 'text-[#38A169]', tag: 'bg-[#E6F7F0] text-[#38A169]' },
  danger: { bg: 'bg-[#FFF0F0]', text: 'text-[#E53E3E]', tag: 'bg-[#FFF0F0] text-[#E53E3E]' },
  tech: { bg: 'bg-[#E8F3FF]', text: 'text-tech', tag: 'bg-[#E8F3FF] text-tech' },
  neutral: { bg: 'bg-canvas', text: 'text-muted', tag: 'bg-canvas text-muted' }
}

function extractPriceFromMeta(meta: string | undefined) {
  if (!meta) {
    return { meta, price: undefined }
  }

  const parts = meta
    .split(' · ')
    .map((part) => part.trim())
    .filter(Boolean)
  const priceIndex = parts.findIndex((part) => /^(¥|￥|免费|面议)/u.test(part))

  if (priceIndex < 0) {
    return { meta, price: undefined }
  }

  const [price] = parts.splice(priceIndex, 1)
  return {
    meta: parts.join(' · ') || undefined,
    price: price?.replace(/^￥/u, '¥')
  }
}

export function ItemList({ items, variant = 'default' }: ItemListProps) {
  const isEmbedded = variant === 'embedded'

  return (
    <View className={`grid ${isEmbedded ? 'gap-2' : 'gap-3'}`}>
      {items.map((item, index) => {
        const extracted = extractPriceFromMeta(item.meta)
        const displayMeta = extracted.meta
        const displayPrice = item.price ?? extracted.price
        const hasInfoRow = Boolean(displayMeta || displayPrice || item.action)

        return (
          <View
            key={`${item.title}-${index}`}
            className={
              isEmbedded
                ? 'rounded-[14px] bg-canvas px-3 py-3'
                : 'rounded-lg border border-line bg-white px-4 py-4 shadow-soft'
            }
            onClick={() => {
              if (item.onClick) {
                void item.onClick()
                return
              }

              if (item.path) {
                router.to(item.path, item.query)
              }
            }}
          >
            <View className="flex items-start gap-3">
              <View
                className={`flex shrink-0 items-center justify-center rounded-lg ${
                  toneClassName[item.tone ?? 'brand'].bg
                } ${isEmbedded ? 'h-9 w-9' : 'h-10 w-10'}`}
              >
                <AppIcon
                  name={item.icon ?? getAppIconName(`${item.title}${item.tag ?? ''}`, undefined, item.path)}
                  size={isEmbedded ? 19 : 21}
                  className={toneClassName[item.tone ?? 'brand'].text}
                />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex items-start justify-between gap-2">
                  <Text
                    className={`block min-w-0 flex-1 break-all font-bold text-ink ${
                      item.titleSize === 'small' ? 'text-xs leading-5' : 'text-base leading-6'
                    }`}
                  >
                    {item.title}
                  </Text>
                  {item.tag ? (
                    <Text
                      className={`shrink-0 rounded px-2 py-1 text-[20rpx] font-semibold ${
                        toneClassName[item.tone ?? 'gold'].tag
                      }`}
                    >
                      {item.tag}
                    </Text>
                  ) : null}
                </View>
                {item.desc ? (
                  <Text className={`${isEmbedded ? 'mt-1' : 'mt-2'} block text-sm leading-6 text-muted`}>
                    {item.desc}
                  </Text>
                ) : null}
              </View>
            </View>

            {hasInfoRow ? (
              <>
                <View className="mt-3 h-px bg-line" />
                <View className="mt-3 flex items-center gap-3">
                  {displayMeta ? (
                    <Text className="min-w-0 flex-1 break-all text-xs leading-5 text-muted">{displayMeta}</Text>
                  ) : displayPrice ? (
                    <Text className="min-w-0 flex-1 break-all text-left text-lg font-bold leading-6 text-gold">
                      {displayPrice}
                    </Text>
                  ) : (
                    <View className="min-w-0 flex-1" />
                  )}
                  {displayMeta && displayPrice ? (
                    <Text className="max-w-[280rpx] shrink-0 break-all text-lg font-bold leading-6 text-gold">
                      {displayPrice}
                    </Text>
                  ) : null}
                  {item.action ? (
                    <View className="ml-auto flex max-w-[180rpx] shrink-0 items-center justify-end gap-1">
                      <Text className="break-all text-right text-xs font-semibold leading-4 text-tech">
                        {item.action}
                      </Text>
                      <AppIcon name="arrow-right-s-line" size={18} color="#1677FF" />
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}
