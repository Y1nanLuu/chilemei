export const TARO_CLOUD_ENV = 'chilemei-backend-5fyl0ivfcc9347f'
export const TARO_CLOUD_BUCKET = '6368-chilemei-backend-5fyl0ivfcc9347f-1328995507'
export const TARO_CLOUD_SERVICE = 'chilemei'

export const getCloudEnv = () => {
  if (typeof process !== 'undefined' && process.env?.TARO_APP_CLOUD_ENV) {
    return process.env.TARO_APP_CLOUD_ENV
  }

  return TARO_CLOUD_ENV
}

export const getCloudBucket = () => {
  if (typeof process !== 'undefined' && process.env?.TARO_APP_CLOUD_BUCKET) {
    return process.env.TARO_APP_CLOUD_BUCKET
  }

  return TARO_CLOUD_BUCKET
}

export const getCloudMediaBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.TARO_APP_MEDIA_BASE_URL) {
    return process.env.TARO_APP_MEDIA_BASE_URL
  }

  return `https://${getCloudBucket()}.tcb.qcloud.la`
}

export const getCloudService = () => {
  if (typeof process !== 'undefined' && process.env?.TARO_APP_CLOUD_SERVICE) {
    return process.env.TARO_APP_CLOUD_SERVICE
  }

  return TARO_CLOUD_SERVICE
}
