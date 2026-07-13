import { routes } from '@/shared/router'
import type { MemberAction, MenuItem } from './types'

export const memberActions: MemberAction[] = [
  { label: '续费', path: routes.memberBenefit },
  { label: '升级领航', path: routes.memberBenefit },
  { label: '查看权益', path: routes.userBenefits }
]

export const serviceMenus: MenuItem[] = [
  {
    label: '我的权益',
    icon: 'vip-crown-line',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userBenefits
  },
  {
    label: '我的订单',
    icon: 'file-list-3-line',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userOrders
  },
  {
    label: '我的活动',
    icon: 'calendar-event-line',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.userEvents
  },
  {
    label: '我的资源',
    icon: 'archive-line',
    iconClass: 'bg-[#E8F0FE] text-tech',
    path: routes.resourceHome
  },
  {
    label: '我的商机',
    icon: 'briefcase-4-line',
    iconClass: 'bg-[#FFF3E0] text-[#C05621]',
    path: routes.opportunityHome
  },
  {
    label: '消息中心',
    icon: 'notification-3-line',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userMessages
  }
]

export const adminMenus: MenuItem[] = [
  {
    label: '核验门票',
    icon: 'ticket-line',
    iconClass: 'bg-[#E8F0FE] text-tech',
    path: routes.adminCheckin
  },
  {
    label: '认证审核',
    icon: 'building-2-line',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.adminCert
  },
  {
    label: '订单确认',
    icon: 'file-list-3-line',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.adminOrders
  },
  {
    label: '资源管理',
    icon: 'archive-line',
    iconClass: 'bg-[#E8F0FE] text-tech',
    path: routes.adminResource
  },
  {
    label: '商机撮合',
    icon: 'briefcase-4-line',
    iconClass: 'bg-[#FFF3E0] text-[#C05621]',
    path: routes.adminOpportunity
  }
]

export const accountMenus: MenuItem[] = [
  {
    label: '企业认证',
    icon: 'building-2-line',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.userCert
  },
  {
    label: '我的积分',
    icon: 'coins-line',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userPoints
  },
  {
    label: '我的评价',
    icon: 'star-line',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userReviews
  },
  {
    label: '设置',
    icon: 'settings-3-line',
    iconClass: 'bg-line text-muted',
    path: routes.userSettings
  }
]
