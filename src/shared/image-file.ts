import Taro from '@tarojs/taro'

function getImageMimeType(filePath: string) {
  const normalizedPath = filePath.toLowerCase()

  if (normalizedPath.endsWith('.png')) {
    return 'image/png'
  }

  if (normalizedPath.endsWith('.webp')) {
    return 'image/webp'
  }

  if (normalizedPath.endsWith('.gif')) {
    return 'image/gif'
  }

  return 'image/jpeg'
}

export function readImageFileAsDataUri(filePath: string) {
  const content = Taro.getFileSystemManager().readFileSync(filePath, 'base64')

  if (typeof content !== 'string' || !content) {
    throw new Error('读取图片失败')
  }

  return `data:${getImageMimeType(filePath)};base64,${content}`
}
