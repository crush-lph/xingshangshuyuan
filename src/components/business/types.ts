import type { Query, RoutePath } from '@/shared/router'

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
  desc?: string
  meta?: string
  price?: string
  tag?: string
  path?: RoutePath
  query?: Query
  action?: string
  onClick?: () => void | Promise<void>
}

export interface FieldItem {
  label: string
  value: string
}
