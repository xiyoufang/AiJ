import request from '@/utils/request'

/**
 * 分页获取用户
 * @param query
 */
export function page(query) {
  return request({
    url: '/user/player/page',
    method: 'get',
    params: query
  })
}

/**
 * 更新用户状态
 * @param data
 */
export function update(data) {
  return request({
    url: '/user/player/update',
    method: 'post',
    data
  })
}
