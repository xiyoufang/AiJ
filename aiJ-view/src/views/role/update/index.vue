<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <role-card :role="role" />
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="菜单" name="menus">
              <menus :role="role" />
            </el-tab-pane>
            <el-tab-pane label="权限" name="permissions">
              <permissions :role="role" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-alert
          title="提示"
          type="success"
          effect="dark"
          description="权限更新完成后需要重新登录才能生效。"
          style="margin-top: 10px"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import RoleCard from './components/RoleCard'
import Permissions from './components/Permissions'
import Menus from './components/Menus'

export default {
  name: 'UpdateRole',
  components: { RoleCard, Permissions, Menus },
  data() {
    const defaultRole = {
      id: undefined,
      name: undefined,
      permissions: [],
      menus: [],
      description: undefined
    }
    return {
      role: this.$route.params.id === undefined ? defaultRole : this.$route.params,
      activeTab: 'menus'
    }
  },
  created() {
  },
  methods: {
  }
}
</script>
