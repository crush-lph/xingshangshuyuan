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
    icon: '权',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userBenefits
  },
  {
    label: '我的订单',
    icon: '单',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userOrders
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
    path: routes.opportunityHome
  }
]

export const accountMenus: MenuItem[] = [
  {
    label: '企业认证',
    icon: '企',
    iconClass: 'bg-[#E8F9F0] text-[#2F855A]',
    path: routes.userCert
  },
  {
    label: '我的积分',
    icon: '积',
    iconClass: 'bg-gold-soft text-gold',
    path: routes.userPoints
  },
  {
    label: '我的评价',
    icon: '评',
    iconClass: 'bg-brand-soft text-brand',
    path: routes.userReviews
  },
  {
    label: '设置',
    icon: '设',
    iconClass: 'bg-line text-muted',
    path: routes.userSettings
  }
]
