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
