import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/authorization/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/authorization/logout',
    method: 'post'
  })
}
