import { Text, View } from '@tarojs/components'
import { ActionBar } from './ActionBar'
import { FieldList } from './FieldList'
import type { ActionItem, FieldItem } from './types'

interface FormPreviewProps {
  title: string
  desc: string
  fields: FieldItem[]
  actions: ActionItem[]
}

export function FormPreview({ title, desc, fields, actions }: FormPreviewProps) {
  return (
    <View className='grid gap-3'>
      <View className='rounded-lg bg-white p-4 shadow-soft'>
        <Text className='block text-base font-bold text-ink'>{title}</Text>
        <Text className='mt-2 block text-sm leading-6 text-muted'>{desc}</Text>
      </View>
      <FieldList fields={fields} />
      <ActionBar actions={actions} />
    </View>
  )
}
