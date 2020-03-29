<template>
  <el-card>
    <div slot="header" class="clearfix">
      <span>角色信息</span>
    </div>
    <div>
      <el-form>
        <el-form-item label="名称">
          <el-input v-model.trim="role.name" :disabled="role.protected === 'Y'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 4, maxRows: 8}"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item>
          <el-button v-if="role.id !== undefined" type="primary">Update</el-button>
          <el-button v-else type="primary">Create</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script>
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
      name: ''
    }
  }
}
</script>
