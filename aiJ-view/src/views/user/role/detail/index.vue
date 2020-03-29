<template>
  <div class="app-container">
    <el-row :gutter="20">

      <el-col :span="6" :xs="24">
        <role-card :role="role" />
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="Permissions" name="permissions">
              <permissions />
            </el-tab-pane>
            <el-tab-pane label="Menus" name="menus">
              <menus :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
import RoleCard from './components/RoleCard'
import Permissions from './components/Permissions'
import Menus from './components/Menus'

export default {
  name: 'RoleDetail',
  components: { RoleCard, Permissions, Menus },
  data() {
    return {
      role: this.$route.params,
      activeTab: 'permissions'
    }
  },
  created() {
  },
  methods: {
  }
}
</script>
