import { routes } from '@/shared/router'
import type { ManagerInfo, MemberAction, MenuItem, MetricItem } from './types'

export const metrics: MetricItem[] = [
  { label: '我的订单', value: '3', color: 'text-brand', path: routes.userOrders },
  { label: '我的活动', value: '2', color: 'text-brand', path: routes.userEvents },
  { label: '我的积分', value: '380', color: 'text-gold', path: routes.userPoints },
  { label: '待评价', value: '5', color: 'text-[#38A169]', path: routes.userReviews }
]

export const memberActions: MemberAction[] = [
  { label: '续费', path: routes.memberBenefit },
  { label: '升级领航', path: routes.memberBenefit },
  { label: '查看权益', path: routes.userBenefits }
]

export const serviceMenus: MenuItem[] = [
  {
    label: '我的权益',
    icon: '权',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userBenefits,
    badge: '3项可用'
  },
  {
    label: '我的订单',
    icon: '单',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userOrders,
    badge: '2待支付'
  },
  {
    label: '我的活动',
    icon: '活',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.userEvents
  },
  {
    label: '我的资源',
    icon: '资',
    iconClass: 'bg-[#E8F0FE] text-tech',
    path: routes.resourceHome
  },
  {
    label: '我的商机',
    icon: '商',
    iconClass: 'bg-[#FFF3E0] text-[#C05621]',
    path: routes.opportunityHome,
    badge: '1待跟进'
  }
]

export const accountMenus: MenuItem[] = [
  {
    label: '企业认证',
    icon: '企',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.userCert,
    badge: '已认证'
  },
  {
    label: '我的积分',
    icon: '积',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userPoints,
    value: '380分'
  },
  {
    label: '我的评价',
    icon: '评',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userReviews,
    badge: '5待评'
  },
  {
    label: '设置',
    icon: '设',
    iconClass: 'bg-line text-muted'
  }
]

export const managerInfo: ManagerInfo = {
  name: '张晓慧',
  phone: '13800008888'
}
