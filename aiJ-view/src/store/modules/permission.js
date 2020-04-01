import { constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param menus
 * @param route
 */
function hasPermission(menus, route) {
  return menus.indexOf(route.name) !== -1
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param menus menu names
 */
export function filterRoutes(routes, menus) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(menus, tmp)) {
      if (tmp.children) {
        tmp.children = filterRoutes(tmp.children, menus)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: []
}

const mutations = {
  SET_ROUTES: (state, _filterRoutes) => {
    state.routes = _filterRoutes
  }
}

const actions = {
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      const _filterRoutes = filterRoutes(constantRoutes, menus)
      commit('SET_ROUTES', _filterRoutes)
      resolve(_filterRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
