import { useEffect, type ReactNode } from 'react'
import { StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { router, routes } from '@/shared/router'
import { useUserInfo } from '@/stores/user-info'

interface AdminGuardProps {
  title: string
  children: ReactNode
}

export function AdminGuard({ title, children }: AdminGuardProps) {
  const { userInfo, profile, error, isLoggedIn, isAdmin, isLoading, loadUserInfo } = useUserInfo()
  const hasLoadedIdentity = Boolean(userInfo || profile || error)

  useEffect(() => {
    if (isLoggedIn && !hasLoadedIdentity) {
      void loadUserInfo().catch(() => undefined)
    }
  }, [hasLoadedIdentity, isLoggedIn, loadUserInfo])

  if (isLoggedIn && (!hasLoadedIdentity || isLoading)) {
    return (
      <PageShell title={title} subtitle="正在确认后台访问权限。">
        <StateNotice state="loading" copy={{ title: '权限校验中', desc: '正在确认后台访问权限。' }} />
      </PageShell>
    )
  }

  if (!isLoggedIn) {
    return (
      <PageShell title={title} subtitle="登录管理员账号后才能访问后台功能。">
        <StateNotice
          state="loginRequired"
          copy={{ title: '需要登录', desc: '登录管理员账号后才能访问后台功能。' }}
          actionText="去登录"
          onAction={() => {
            void router.to(routes.userLogin)
          }}
        />
      </PageShell>
    )
  }

  if (!isAdmin) {
    return (
      <PageShell title={title} subtitle="仅管理员可访问后台功能。">
        <StateNotice state="unauthorized" copy={{ title: '暂无权限', desc: '仅管理员可访问后台功能。' }} />
      </PageShell>
    )
  }

  return children
}
