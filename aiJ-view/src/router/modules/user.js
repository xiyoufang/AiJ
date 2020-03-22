/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const userRouter = {
  path: '/user',
  component: Layout,
  redirect: 'noRedirect',
  name: 'userRouter',
  meta: {
    title: '用户管理',
    icon: 'component'
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
      name: '',
      meta: { title: '代理管理' }
    }
  ]
}

export default userRouter
