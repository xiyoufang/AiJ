<template>
  <el-form :model="role" label-position="left">
    <el-form-item>
      <el-tree
        ref="tree"
        :check-strictly="checkStrictly"
        :data="menusData"
        :props="defaultProps"
        show-checkbox
        node-key="name"
        class="permission-tree"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import router from '@/router'

export default {
  props: {
    role: {
      type: Object,
      default: () => {
        return {
          name: '',
          permissions: [],
          menus: [],
          description: ''
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
  computed: {
    menusData() {
      return this.menus
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
      this.menus = this.generateRoutes(router.options.routes)
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
    }
  }
}
</script>
