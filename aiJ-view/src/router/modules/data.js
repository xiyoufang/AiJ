/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dataRouter = {
  path: '/data',
  component: Layout,
  redirect: 'noRedirect',
  name: 'dataRouter',
  meta: {
    title: '数据中心',
    icon: 'money'
  },
  children: [
    {
      path: 'player',
      component: () => import('@/views/user/player'),
      name: 'player',
      meta: { title: '用户数据' }
    },
    {
      path: 'administrator',
      component: () => import('@/views/user/administrator'),
      name: 'administrator',
      meta: { title: '运营数据' }
    },
    {
      path: 'distributor',
      component: () => import('@/views/user/distributor'),
      name: '',
      meta: { title: '游戏数据' }
    }
  ]
}

export default dataRouter
