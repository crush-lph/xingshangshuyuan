import Taro from '@tarojs/taro'
import { REMIXICON_FONT_BASE64 } from '@/assets/remixicon-font'

let isAppIconFontLoading = false

export function loadAppIconFont() {
  if (isAppIconFontLoading) {
    return
  }

  isAppIconFontLoading = true

  Taro.loadFontFace({
    family: 'remixicon',
    source: `url("data:font/woff;charset=utf-8;base64,${REMIXICON_FONT_BASE64}")`,
    global: true,
    fail() {
      isAppIconFontLoading = false
    }
  })
}
