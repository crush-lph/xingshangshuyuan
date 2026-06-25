import { View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { router } from '@/shared/router'
import type { ActionItem } from './types'

interface ActionBarProps {
  actions: ActionItem[]
}

function getButtonProps(variant: ActionItem['variant']) {
  if (variant === 'outline') {
    return { fill: 'outline' as const }
  }

  return { type: 'primary' as const }
}

function getButtonClassName(variant: ActionItem['variant']) {
  if (variant === 'gold') {
    return 'h-12 border-gold bg-gold text-white'
  }

  if (variant === 'outline') {
    return 'app-action-button app-action-button-outline h-12 border-brand text-brand'
  }

  return 'app-action-button app-action-button-primary h-12'
}

export function ActionBar({ actions }: ActionBarProps) {
  const layoutClassName = actions.length === 2 ? 'grid grid-cols-2 gap-2' : 'grid gap-2'

  return (
    <View className={layoutClassName}>
      {actions.map((action) => (
        <Button
          key={action.label}
          block
          className={getButtonClassName(action.variant)}
          disabled={action.disabled}
          {...getButtonProps(action.variant)}
          onClick={() => {
            if (action.disabled) {
              return
            }

            if (action.onClick) {
              void action.onClick()
              return
            }

            if (action.path) {
              router.to(action.path, action.query)
            }
          }}
        >
          {action.label}
        </Button>
      ))}
    </View>
  )
}
