/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dataRouter = {
  path: '/data',
  component: Layout,
  redirect: 'noRedirect',
  name: 'DataRouter',
  meta: {
    title: '数据中心',
    icon: 'money'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/user/player'),
      name: 'DataUser',
      meta: { title: '用户数据' }
    },
    {
      path: 'business',
      component: () => import('@/views/user/administrator'),
      name: 'DataBusiness',
      meta: { title: '运营数据' }
    },
    {
      path: 'game',
      component: () => import('@/views/user/distributor'),
      name: 'DataGame',
      meta: { title: '游戏数据' }
    }
  ]
}

export default dataRouter
