import request from '@/utils/request'

/**
 * 分页获取代理
 * @param query
 */
export function page(query) {
  return request({
    url: '/user/distributor/page',
    method: 'get',
    params: query
  })
}

/**
 * 更新代理信息
 * @param data
 */
export function update(data) {
  return request({
    url: '/user/distributor/update',
    method: 'post',
    data
  })
}

/**
 * 新增代理
 * @param data
 */
export function create(data) {
  return request({
    url: '/user/distributor/create',
    method: 'post',
    data
  })
}
