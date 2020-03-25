import defaultSettings from '@/settings'

const title = defaultSettings.title || 'AiJ游戏后台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
