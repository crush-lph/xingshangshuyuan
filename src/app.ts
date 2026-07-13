import { PropsWithChildren, useEffect } from 'react'
import { configureApi } from '@/shared/api-config'
import { bindUnauthorizedLoginPrompt } from '@/shared/auth-guard'
import { loadAppIconFont, loadIconfont } from '@/shared/app-icon-font'
import { useUserInfo } from '@/stores/user-info'
import './app.scss'

loadAppIconFont()
loadIconfont()
configureApi()

function App({ children }: PropsWithChildren) {
  const hydrateFromStorage = useUserInfo((state) => state.hydrateFromStorage)

  useEffect(() => {
    const unbindUnauthorizedLoginPrompt = bindUnauthorizedLoginPrompt()
    void hydrateFromStorage()

    return unbindUnauthorizedLoginPrompt
  }, [hydrateFromStorage])

  return children
}

export default App
