import { setRequestConfig } from './request'

export const API_BASE_URL = 'http://152.136.125.82/'

export function configureApi() {
  setRequestConfig({
    baseURL: API_BASE_URL
  })
}
