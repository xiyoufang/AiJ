import request from '@/utils/request'

/**
 * 登录
 * @param data
 */
export function login(data) {
  return request({
    url: '/authorization/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @param token
 */
export function getInfo(token) {
  return request({
    url: '/authorization/info',
    method: 'get',
    params: { token }
  })
}

/**
 * 注销
 */
export function logout() {
  return request({
    url: '/authorization/logout',
    method: 'post'
  })
}
