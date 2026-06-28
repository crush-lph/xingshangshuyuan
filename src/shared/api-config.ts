import { setRequestConfig } from './request'

export const API_BASE_URL = __API_BASE_URL__

export function configureApi() {
  setRequestConfig({
    baseURL: API_BASE_URL
  })
}
