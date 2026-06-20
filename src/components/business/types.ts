import type { RoutePath } from '@/shared/router'

export interface StatItem {
  label: string
  value: string
  tone?: 'brand' | 'gold' | 'success' | 'danger'
}

export interface ActionItem {
  label: string
  path?: RoutePath
  variant?: 'primary' | 'gold' | 'outline'
  disabled?: boolean
  onClick?: () => void | Promise<void>
}

export interface ListItem {
  title: string
  desc?: string
  meta?: string
  price?: string
  tag?: string
  path?: RoutePath
  action?: string
}

export interface FieldItem {
  label: string
  value: string
}
