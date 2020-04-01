import request from '@/utils/request'

/**
 * 获取服务列表
 * @param query
 */
export function page(query) {
  return request({
    url: '/service/page',
    method: 'get',
    params: query
  })
}

/**
 * 创建服务
 * @param data
 */
export function createService(data) {
  return request({
    url: '/service/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新服务
 * @param data
 */
export function updateService(data) {
  return request({
    url: '/service/update',
    method: 'post',
    data: data
  })
}
