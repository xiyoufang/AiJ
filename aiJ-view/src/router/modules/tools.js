/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const toolsRouter = {
  path: '/tools',
  component: Layout,
  redirect: 'noRedirect',
  name: 'ToolsRouter',
  meta: {
    title: '工具箱',
    icon: 'tools'
  },
  children: [
    {
      path: 'recharge',
      component: () => import('@/views/user/player'),
      name: 'RechargeTool',
      meta: { title: '充值' }
    },
    {
      path: 'backup',
      component: () => import('@/views/user/distributor'),
      name: 'BackupTool',
      meta: { title: '备份' }
    }
  ]
}

export default toolsRouter
