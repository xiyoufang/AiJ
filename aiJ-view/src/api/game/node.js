import request from '@/utils/request'

/**
 * 获取服务列表
 * @param query
 */
export function page(query) {
  return request({
    url: '/node/page',
    method: 'get',
    params: query
  })
}
