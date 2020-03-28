import request from '@/utils/request'

/**
 * 分页获取用户
 * @param query
 */
export function page(query) {
  return request({
    url: '/user/administrator/page',
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
    url: '/user/administrator/update',
    method: 'post',
    data
  })
}

/**
 * 新增后台用户
 * @param data
 */
export function create(data) {
  return request({
    url: '/user/administrator/create',
    method: 'post',
    data
  })
}
