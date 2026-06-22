import type { RoutePath } from '@/shared/router'
import type { AppIconName } from '@/shared/app-icons'

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
  icon: AppIconName
  iconClass: string
  path?: RoutePath
  badge?: string
  value?: string
}

export interface ManagerInfo {
  name: string
  phone: string
}
