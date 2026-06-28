import { Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'
import { getAppIconName } from '@/shared/app-icons'
import { router } from '@/shared/router'
import type { ListItem } from './types'

interface ItemListProps {
  items: ListItem[]
}

const toneClassName: Record<NonNullable<ListItem['tone']>, { bg: string; text: string; tag: string }> = {
  brand: { bg: 'bg-brand-soft', text: 'text-brand', tag: 'bg-brand-soft text-brand' },
  gold: { bg: 'bg-gold-soft', text: 'text-gold', tag: 'bg-gold-soft text-gold' },
  success: { bg: 'bg-[#E6F7F0]', text: 'text-[#38A169]', tag: 'bg-[#E6F7F0] text-[#38A169]' },
  danger: { bg: 'bg-[#FFF0F0]', text: 'text-[#E53E3E]', tag: 'bg-[#FFF0F0] text-[#E53E3E]' },
  tech: { bg: 'bg-[#E8F3FF]', text: 'text-tech', tag: 'bg-[#E8F3FF] text-tech' },
  neutral: { bg: 'bg-canvas', text: 'text-muted', tag: 'bg-canvas text-muted' }
}

export function ItemList({ items }: ItemListProps) {
  return (
    <View className="grid gap-2">
      {items.map((item, index) => (
        <View
          key={`${item.title}-${index}`}
          className="rounded-lg bg-white px-4 py-4 shadow-soft"
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
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                toneClassName[item.tone ?? 'brand'].bg
              }`}
            >
              <AppIcon
                name={item.icon ?? getAppIconName(`${item.title}${item.tag ?? ''}`, undefined, item.path)}
                size={22}
                className={toneClassName[item.tone ?? 'brand'].text}
              />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex items-start justify-between gap-2">
                <Text className="block min-w-0 flex-1 break-all text-base font-semibold text-ink">{item.title}</Text>
                {item.tag ? (
                  <Text
                    className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                      toneClassName[item.tone ?? 'gold'].tag
                    }`}
                  >
                    {item.tag}
                  </Text>
                ) : null}
              </View>
              {item.desc ? <Text className="mt-2 block text-sm leading-5 text-muted">{item.desc}</Text> : null}
              <View className="mt-3 flex items-center justify-between gap-3">
                {item.meta ? (
                  <Text className="min-w-0 flex-1 break-all text-xs text-muted">{item.meta}</Text>
                ) : (
                  <View className="flex-1" />
                )}
                <View className="shrink-0 items-end">
                  {item.price ? <Text className="block text-base font-bold text-gold">{item.price}</Text> : null}
                  {item.action ? (
                    <Text className="mt-1 block text-xs font-semibold text-tech">{item.action} ›</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
