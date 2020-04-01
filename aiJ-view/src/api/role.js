import request from '@/utils/request'

export function page(query) {
  return request({
    url: '/role/page',
    method: 'get',
    params: query
  })
}

export function permissions() {
  return request({
    url: '/role/permissions',
    method: 'get'
  })
}

/**
 * 创建角色
 * @param data
 */
export function createRole(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data: data
  })
}

/**
 * 更新角色
 * @param data
 */
export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'post',
    data: data
  })
}
