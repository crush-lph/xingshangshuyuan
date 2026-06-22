import type { CSSProperties } from 'react'
import { Text } from '@tarojs/components'
import type { AppIconName } from '@/shared/app-icons'

interface AppIconProps {
  name: AppIconName
  size?: number
  color?: string
  className?: string
}

function getIconName(name: AppIconName) {
  return name.replace(/^ri-/, '')
}

export function AppIcon({ name, size = 20, color, className = '' }: AppIconProps) {
  const style: CSSProperties = {
    color,
    fontSize: `${size}px`,
    lineHeight: 1
  }

  return <Text className={`ri-${getIconName(name)} leading-none ${className}`} style={style} />
}
