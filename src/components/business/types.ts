import type { Query, RoutePath } from '@/shared/router'
import type { AppIconName } from '@/shared/app-icons'

export interface StatItem {
  label: string
  value: string
  tone?: 'brand' | 'gold' | 'success' | 'danger'
}

export interface ActionItem {
  label: string
  path?: RoutePath
  query?: Query
  variant?: 'primary' | 'gold' | 'outline'
  disabled?: boolean
  onClick?: () => void | Promise<void>
}

export interface ListItem {
  title: string
  titleSize?: 'normal' | 'small'
  desc?: string
  meta?: string
  price?: string
  tag?: string
  icon?: AppIconName
  tone?: 'brand' | 'gold' | 'success' | 'danger' | 'tech' | 'neutral'
  path?: RoutePath
  query?: Query
  action?: string
  onClick?: () => void | Promise<void>
}

export interface FieldItem {
  label: string
  value: string
}
