export type PageStateKind =
  | 'loading'
  | 'empty'
  | 'error'
  | 'unauthorized'
  | 'loginRequired'
  | 'certificationPending'
  | 'reviewPending'
  | 'expired'
  | 'cancelled'
  | 'completed'

export interface PageStateCopy {
  title: string
  desc: string
}

export const pageStateCopy: Record<PageStateKind, PageStateCopy> = {
  loading: {
    title: '加载中',
    desc: '正在获取最新数据'
  },
  empty: {
    title: '暂无数据',
    desc: '当前没有可展示的记录'
  },
  error: {
    title: '加载失败',
    desc: '请稍后重试'
  },
  unauthorized: {
    title: '暂无权限',
    desc: '当前账号不能访问该功能'
  },
  loginRequired: {
    title: '请先登录',
    desc: '登录后可继续操作'
  },
  certificationPending: {
    title: '认证审核中',
    desc: '平台正在审核企业资料'
  },
  reviewPending: {
    title: '审核中',
    desc: '平台将在处理后更新状态'
  },
  expired: {
    title: '已失效',
    desc: '该记录已过有效期'
  },
  cancelled: {
    title: '已取消',
    desc: '该记录已取消'
  },
  completed: {
    title: '已完成',
    desc: '当前流程已处理完成'
  }
}

export function getPageStateCopy(kind: PageStateKind, copy?: Partial<PageStateCopy>): PageStateCopy {
  return {
    ...pageStateCopy[kind],
    ...copy
  }
}
