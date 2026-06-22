import { PropsWithChildren } from 'react'
import { configureApi } from '@/shared/api-config'
import { loadAppIconFont } from '@/shared/app-icon-font'
import './app.scss'

loadAppIconFont()
configureApi()

function App({ children }: PropsWithChildren) {
  return children
}

export default App
