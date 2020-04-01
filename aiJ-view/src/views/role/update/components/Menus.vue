<template>
  <div>
    <el-alert
      title="提示"
      type="info"
      description="所有菜单列表从前端路由中读取"
      show-icon
      style="margin-bottom: 10px"
    />
    <el-form :model="role" label-position="left">
      <el-form-item>
        <el-tree
          ref="tree"
          :check-strictly="checkStrictly"
          :data="menus"
          :props="defaultProps"
          show-checkbox
          node-key="name"
          @check-change="handleCheckChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { constantRoutes } from '@/router'

export default {
  props: {
    role: {
      type: Object,
      default: () => {
        return {
          id: undefined,
          name: undefined,
          permissions: undefined,
          menus: undefined,
          description: undefined
        }
      }
    }
  },
  data() {
    return {
      checkStrictly: false,
      menus: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  created() {
    this.getMenus()
  },
  mounted() {
    this.setCheckedKeys()
  },
  methods: {
    getMenus() {
      this.menus = this.generateRoutes(constantRoutes)
    },
    generateRoutes(routes) {
      const res = []
      for (let route of routes) {
        if (route.hidden) { continue }
        const onlyOneShowingChild = this.onlyOneShowingChild(route.children, route)
        if (route.children && onlyOneShowingChild && !route.alwaysShow) {
          route = onlyOneShowingChild
        }
        const data = {
          name: route.name,
          title: route.meta && route.meta.title
        }
        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children)
        }
        res.push(data)
      }
      return res
    },
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        return onlyOneChild
      }
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, name: parent.name, noShowingChildren: true }
        return onlyOneChild
      }
      return false
    },
    setCheckedKeys() {
      this.$refs.tree.setCheckedKeys(this.role.menus)
    },
    handleCheckChange() {
      this.role.menus = this.$refs.tree.getCheckedKeys()
    }
  }
}
</script>
