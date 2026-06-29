import { Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { getPageStateCopy, type PageStateCopy, type PageStateKind } from '@/shared/page-state'

export interface StateNoticeProps {
  state: PageStateKind
  copy?: Partial<PageStateCopy>
  actionText?: string
  onAction?: () => void
}

export function StateNotice({ state, copy, actionText, onAction }: StateNoticeProps) {
  const displayCopy = getPageStateCopy(state, copy)

  return (
    <View className="rounded-lg bg-white px-4 py-6 text-center shadow-soft">
      <Text className="block text-base font-bold text-ink">{displayCopy.title}</Text>
      <Text className="mt-2 block text-sm leading-5 text-muted">{displayCopy.desc}</Text>
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
