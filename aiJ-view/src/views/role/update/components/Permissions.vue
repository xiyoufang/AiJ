<template>
  <el-form :model="role" label-position="left">
    <el-form-item>
      <el-tree
        ref="tree"
        :check-strictly="checkStrictly"
        :data="permissions"
        :props="defaultProps"
        show-checkbox
        node-key="name"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import { permissions } from '@/api/role'

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
      permissions: [],
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },
  created() {
    this.getPermissions()
  },
  mounted() {
    this.setCheckedKeys()
  },
  methods: {
    getPermissions() {
      permissions().then(response => {
        console.log(response)
        this.permissions = response.data.map(item => { return { name: item, title: item } })
      })
    },
    setCheckedKeys() {
      this.$refs.tree.setCheckedKeys(this.role.permissions)
    }
  }
}
</script>
