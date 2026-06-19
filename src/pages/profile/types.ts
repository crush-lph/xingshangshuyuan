import type { RoutePath } from '@/shared/router'

export interface MetricItem {
  label: string
  value: string
  color: string
  path: RoutePath
}

export interface MemberAction {
  label: string
  path: RoutePath
}

export interface MenuItem {
  label: string
  icon: string
  iconClass: string
  path?: RoutePath
  badge?: string
  value?: string
}

export interface ManagerInfo {
  name: string
  phone: string
}
