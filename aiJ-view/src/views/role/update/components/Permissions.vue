<template>
  <div>
    <el-alert
      title="提示"
      type="info"
      description="所有权限从后端@RequiresPermissions注解读取"
      show-icon
      style="margin-bottom: 10px"
    />
    <el-form :model="role" label-position="left">
      <el-form-item>
        <el-tree
          ref="tree"
          :check-strictly="checkStrictly"
          :data="permissions"
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
        this.permissions = response.data.map(item => { return { name: item, title: item } })
      })
    },
    setCheckedKeys() {
      this.$refs.tree.setCheckedKeys(this.role.permissions)
    },
    handleCheckChange() {
      this.role.permissions = this.$refs.tree.getCheckedKeys()
    }
  }
}
</script>
