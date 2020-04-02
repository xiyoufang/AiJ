/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const roleRouter = {
  path: '/role',
  component: Layout,
  redirect: '/role/index',
  children: [
    {
      path: 'index',
      component: () => import('@/views/role'),
      name: 'Role',
      meta: { title: '角色权限', icon: 'lock', noCache: true }
    }, {
      path: 'update',
      component: () => import('@/views/role/update'),
      name: 'UpdateRole',
      hidden: true,
      meta: { title: '权限管理', noCache: true }
    }
  ]
}
export default roleRouter
