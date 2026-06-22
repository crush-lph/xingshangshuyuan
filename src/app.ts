import { PropsWithChildren } from 'react'
import { configureApi } from '@/shared/api-config'
import './app.scss'

configureApi()

function App({ children }: PropsWithChildren) {
  return children
}

export default App
