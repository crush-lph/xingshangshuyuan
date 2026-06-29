import Taro from '@tarojs/taro'
import { ICONFONT_FONT_FAMILY, ICONFONT_FONT_SOURCE } from '@/assets/iconfont'
import { REMIXICON_FONT_BASE64 } from '@/assets/remixicon-font'

interface LocalFontFaceConfig {
  key: string
  family: string
  source: string
}

const loadingFontKeys = new Set<string>()
const loadedFontKeys = new Set<string>()

function loadLocalFontFace({ key, family, source }: LocalFontFaceConfig) {
  if (loadedFontKeys.has(key) || loadingFontKeys.has(key)) {
    return
  }

  loadingFontKeys.add(key)

  Taro.loadFontFace({
    family,
    source,
    global: true,
    success() {
      loadedFontKeys.add(key)
    },
    fail() {
      loadedFontKeys.delete(key)
    },
    complete() {
      loadingFontKeys.delete(key)
    }
  })
}

export function loadAppIconFont() {
  loadLocalFontFace({
    key: 'remixicon',
    family: 'remixicon',
    source: `url("data:font/woff;charset=utf-8;base64,${REMIXICON_FONT_BASE64}")`
  })
}

export function loadIconfont() {
  loadLocalFontFace({
    key: ICONFONT_FONT_FAMILY,
    family: ICONFONT_FONT_FAMILY,
    source: ICONFONT_FONT_SOURCE
  })
}
