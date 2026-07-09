import { uploadUserAvatar } from '@/services'
import { readImageFileAsDataUri } from './image-file'
import { textOf } from './view-data'

export async function uploadWechatAvatarFromLocalFile(filePath: string) {
  const image = readImageFileAsDataUri(filePath)
  const response = await uploadUserAvatar({ image })
  const uploadedAvatar = textOf(response.data.url)

  if (!uploadedAvatar) {
    throw new Error('上传头像接口未返回地址')
  }

  return uploadedAvatar
}
