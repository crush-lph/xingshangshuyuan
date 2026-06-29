import type { CSSProperties } from 'react'
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

function getButtonClassName(variant: ActionItem['variant'], isPaired: boolean) {
  const shapeClassName = isPaired
    ? 'app-action-button-paired rounded-xl'
    : 'app-action-button-stacked h-12 rounded-full'

  if (variant === 'gold') {
    return `app-action-button app-action-button-gold ${shapeClassName} border-0 bg-gold text-white`
  }

  if (variant === 'outline') {
    return `app-action-button app-action-button-outline ${shapeClassName} border-brand text-brand`
  }

  return `app-action-button app-action-button-primary ${shapeClassName}`
}

function getButtonStyle(isPaired: boolean): CSSProperties | undefined {
  return isPaired
    ? {
        height: '96rpx',
        minHeight: '96rpx',
        borderRadius: '24rpx'
      }
    : {
        height: '96rpx',
        minHeight: '96rpx',
        borderRadius: '9999px'
      }
}

export function ActionBar({ actions }: ActionBarProps) {
  const isPaired = actions.length === 2
  const layoutClassName = isPaired ? 'grid w-full grid-cols-2 gap-[22rpx]' : 'grid w-full gap-2'

  return (
    <View className={layoutClassName}>
      {actions.map((action) => (
        <Button
          key={action.label}
          block
          className={getButtonClassName(action.variant, isPaired)}
          disabled={action.disabled}
          style={getButtonStyle(isPaired)}
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
