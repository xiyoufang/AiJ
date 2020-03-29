/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const userRouter = {
  path: '/user',
  component: Layout,
  redirect: 'noRedirect',
  name: 'userRouter',
  meta: {
    title: '用户管理',
    icon: 'peoples'
  },
  children: [
    {
      path: 'player',
      component: () => import('@/views/user/player'),
      name: 'player',
      meta: { title: '玩家管理' }
    },
    {
      path: 'administrator',
      component: () => import('@/views/user/administrator'),
      name: 'administrator',
      meta: { title: '平台用户' }
    },
    {
      path: 'distributor',
      component: () => import('@/views/user/distributor'),
      name: 'distributor',
      meta: { title: '代理管理' }
    },
    {
      path: 'role',
      component: () => import('@/views/user/role'),
      name: 'role',
      meta: { title: '角色权限' }
    }
  ]
}

export default userRouter
