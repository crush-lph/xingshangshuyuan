import { Text, View } from '@tarojs/components'
import { router } from '@/shared/router'
import type { ListItem } from './types'

interface ItemListProps {
  items: ListItem[]
}

export function ItemList({ items }: ItemListProps) {
  return (
    <View className='overflow-hidden rounded-lg bg-white shadow-soft'>
      {items.map((item, index) => (
        <View
          key={`${item.title}-${index}`}
          className={`px-4 py-4 ${index === items.length - 1 ? '' : 'border-b border-line'}`}
          onClick={() => {
            if (item.path) {
              router.to(item.path)
            }
          }}
        >
          <View className='flex items-start justify-between gap-3'>
            <View className='flex-1'>
              <View className='flex items-center gap-2'>
                <Text className='text-base font-semibold text-ink'>{item.title}</Text>
                {item.tag ? (
                  <Text className='rounded bg-gold-soft px-2 py-1 text-xs font-medium text-gold'>
                    {item.tag}
                  </Text>
                ) : null}
              </View>
              {item.desc ? <Text className='mt-2 block text-sm leading-5 text-muted'>{item.desc}</Text> : null}
              {item.meta ? <Text className='mt-2 block text-xs text-muted'>{item.meta}</Text> : null}
            </View>
            <View className='items-end'>
              {item.price ? <Text className='block text-base font-bold text-gold'>{item.price}</Text> : null}
              {item.action ? <Text className='mt-2 block text-xs font-medium text-tech'>{item.action}</Text> : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
