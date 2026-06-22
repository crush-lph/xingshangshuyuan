import { setRequestConfig } from './request'

export const API_MOCK_BASE_URL = 'http://127.0.0.1:4523/m1/8464015-8236035-default'

export function configureApi() {
  setRequestConfig({
    baseURL: API_MOCK_BASE_URL
  })
}
