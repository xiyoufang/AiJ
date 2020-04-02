<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.nick_name"
        placeholder="昵称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="状态"
        clearable
        style="width: 90px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="头像" align="center" width="80" fixed="left">
        <template slot-scope="{row}">
          <img :src="baseURL+'/avatar?url=' + row.avatar" alt="" class="user-avatar">
        </template>
      </el-table-column>
      <el-table-column label="显示ID" prop="id" align="center" width="100" fixed="left" show-overflow-tooltip>
        <template slot-scope="{row}">
          <span>{{ row.id | idFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" prop="user_id" align="center" width="200" show-overflow-tooltip />
      <el-table-column label="用户名称" prop="user_name" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="昵称" prop="nick_name" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="平台权限" prop="status" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.role_status === -1 "><el-tag type="danger">禁用</el-tag></span>
          <span v-if="row.role_status === 1 "><el-tag type="success">正常</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="平台角色" prop="roles" align="center" width="240" show-overflow-tooltip />
      <el-table-column label="账号状态" prop="status" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.status === -1 "><el-tag type="danger">禁用</el-tag></span>
          <span v-if="row.status === 0 "><el-tag type="warning">待激活</el-tag></span>
          <span v-if="row.status === 1 "><el-tag type="success">正常</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="活跃时间" prop="activated_time" sortable="custom" align="center" width="160" />
      <el-table-column label="操作" prop="id" align="center" width="210" fixed="right">
        <template slot-scope="{row}">
          <router-link to="/profile/index">
            <el-button size="mini">资料</el-button>
          </router-link>
          <el-button
            size="mini"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            v-if="row.role_status === 1"
            size="mini"
            type="danger"
            @click="handleUpdateStatus(row)"
          >禁用
          </el-button>
          <el-button
            v-else
            size="mini"
            type="success"
            @click="handleUpdateStatus(row)"
          >启用
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="administrator"
        label-position="left"
        label-width="70px"
      >
        <el-form-item label="用户" prop="user_id">
          <el-select
            v-model="administrator.user_id"
            filterable
            remote
            reserve-keyword
            placeholder="请输入玩家名称"
            :remote-method="remotePlayers"
            :loading="loading"
          >
            <el-option
              v-for="item in playerOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="administrator.status"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select
            v-model="administrator.roles"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteRoles"
            :loading="loading"
          >
            <el-option
              v-for="item in rolesOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, update, create } from '@/api/user/administrator'
import { page as getPlayerOptions } from '@/api/user/player'
import { page as getRoleOptions } from '@/api/role'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserAdministrator',
  components: { Pagination },
  directives: { waves },
  filters: {
    idFilter(id) {
      return ('' + id).padStart(8, '0')
    }
  },
  data() {
    return {
      baseURL: process.env.VUE_APP_BASE_API,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        nick_name: undefined,
        status: undefined,
        type: undefined,
        sort: '+id'
      },
      statusOptions: [{ label: '禁用', key: -1 }, { label: '正常', key: 1 }],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      administrator: {
        id: undefined,
        user_id: undefined,
        status: undefined,
        roles: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit'
      },
      rules: {
        status: [{ required: true, message: 'status is required', trigger: 'change' }],
        roles: [{ required: true, message: 'nick name is required', trigger: 'change' }],
        user_id: [{ required: true, message: 'nick name is required', trigger: 'change' }]
      },
      loading: false,
      rolesOptions: [],
      playerOptions: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
      }).finally(() => {
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    remotePlayers(query) {
      this.loading = true
      getPlayerOptions({
        page: 1,
        limit: 100,
        nick_name: query
      }).then(response => {
        this.playerOptions = response.data.items.map(item => {
          return { key: item['user_id'], label: item['id'] + ':' + item['nick_name'] }
        })
        console.log(this.playerOptions)
        this.loading = false
      })
    },
    remoteRoles(query) {
      this.loading = true
      getRoleOptions({
        page: 1,
        limit: 100,
        name: query
      }).then(response => {
        this.rolesOptions = response.data.items.map(item => { return { key: item['name'], label: item['name'] } })
        this.loading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetAdministrator() {
      this.administrator = {
        id: undefined,
        user_id: undefined,
        status: undefined,
        roles: undefined
      }
      this.playerOptions = []
      this.rolesOptions = []
    },
    handleCreate() {
      this.resetAdministrator()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdateStatus(row) {
      this.resetAdministrator()
      this.$alert(row.role_status === 1 ? '确定禁用管理平台账号?' : '确定启用账号?', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          if (action === 'confirm') {
            this.administrator.user_id = row.user_id
            this.administrator.status = row.role_status === 1 ? -1 : 1
            update(this.administrator).then(value => {
              this.getList()
            })
          }
        }
      })
    },
    handleUpdate(row) {
      this.resetAdministrator()
      this.administrator.roles = JSON.parse(row.roles)
      this.administrator.user_id = row.user_id
      this.administrator.status = row.role_status
      this.rolesOptions = JSON.parse(row.roles).map(item => { return { key: item, label: item } })
      this.playerOptions.push({ key: row.user_id, label: row.id + ':' + row.nick_name })
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.administrator.roles = JSON.stringify(this.administrator.roles)
          update(this.administrator).then(value => {
            this.resetAdministrator()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.administrator.roles = JSON.stringify(this.administrator.roles)
          create(this.administrator).then(value => {
            this.resetAdministrator()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Create Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-avatar {
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }
</style>
