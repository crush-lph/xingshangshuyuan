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
  return variant === 'gold' ? 'bg-gold border-gold' : ''
}

export function ActionBar({ actions }: ActionBarProps) {
  return (
    <View className="flex gap-2">
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
