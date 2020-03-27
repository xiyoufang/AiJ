/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const gameRouter = {
  path: '/game',
  component: Layout,
  redirect: 'noRedirect',
  name: 'gameRouter',
  meta: {
    title: '游戏管理',
    icon: 'component'
  },
  children: [
    {
      path: 'service',
      component: () => import('@/views/game/service'),
      name: 'service',
      meta: { title: '服务类型' }
    },
    {
      path: 'node',
      component: () => import('@/views/game/node'),
      name: 'node',
      meta: { title: '节点信息' }
    }
  ]
}

export default gameRouter
