import request from '@/utils/request'


/**
 * 获取用户信息
 * @param token
 */
export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

/**
 * 分页获取用户
 * @param query
 */
export function page(query) {
  return request({
    url: '/user/page',
    method: 'get',
    params: query
  })
}
