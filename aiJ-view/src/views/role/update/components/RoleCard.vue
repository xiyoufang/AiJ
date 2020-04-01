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
          <el-button v-if="role.id !== undefined" type="primary" @click="handleUpdate">Update</el-button>
          <el-button v-else type="primary" @click="handleCreate">Create</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script>
import { createRole, updateRole } from '@/api/role'
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
  methods: {
    handleCreate() {
      this.$alert('确定创建角色?', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          if (action === 'confirm') {
            createRole(this.role).then(value => {
              console.log(value)
              this.role.id = value.data.id // 更新ID
              this.$notify({
                title: 'Success',
                message: 'Create Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    handleUpdate() {
      this.$alert('确定更新角色?', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          if (action === 'confirm') {
            updateRole(this.role).then(value => {
              console.log(value)
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    }
  }
}
</script>
