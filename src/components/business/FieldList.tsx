import { Text, View } from '@tarojs/components'
import type { FieldItem } from './types'

interface FieldListProps {
  fields: FieldItem[]
}

export function FieldList({ fields }: FieldListProps) {
  return (
    <View className='overflow-hidden rounded-lg bg-white shadow-soft'>
      {fields.map((field, index) => (
        <View
          key={field.label}
          className={`flex items-center justify-between gap-4 px-4 py-3 ${
            index === fields.length - 1 ? '' : 'border-b border-line'
          }`}
        >
          <Text className='text-sm text-muted'>{field.label}</Text>
          <Text className='text-right text-sm font-semibold text-ink'>{field.value}</Text>
        </View>
      ))}
    </View>
  )
}
