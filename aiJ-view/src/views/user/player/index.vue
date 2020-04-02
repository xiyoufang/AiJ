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
      <el-table-column label="性别" prop="gender" align="center" width="80">
        <template slot-scope="{row}">
          <span v-if="row.gender === 1 ">男</span>
          <span v-else-if="row.gender === 2 ">女</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <el-table-column label="账号状态" prop="status" align="center" width="160">
        <template slot-scope="{row}">
          <span v-if="row.status === -1 "><el-tag type="danger">禁用</el-tag></span>
          <span v-if="row.status === 0 "><el-tag type="warning">待激活</el-tag></span>
          <span v-if="row.status === 1 "><el-tag type="success">正常</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="活跃时间" prop="activated_time" sortable="custom" align="center" width="160" />
      <el-table-column label="IP地址" prop="ip" align="center" width="160" />
      <el-table-column label="注册时间" prop="created_time" sortable="custom" align="center" width="160" />
      <el-table-column label="注册渠道" prop="created_source" align="center" width="120" />
      <el-table-column label="自我介绍" prop="introduction" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="备注" prop="remark" align="center" width="160" show-overflow-tooltip />
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
            v-if="row.status === 1"
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
        :model="user"
        label-position="left"
        label-width="70px"
      >
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="user.status"
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
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="user.user_name" />
        </el-form-item>
        <el-form-item label="昵称" prop="nick_name">
          <el-input v-model="user.nick_name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="user.gender" class="filter-item" placeholder="Please select">
            <el-option v-for="item in genderOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="自我介绍">
          <el-input
            v-model="user.introduction"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="用户自我介绍"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="user.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="用户备注"
          />
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
import { page, update } from '@/api/user/player'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserPlayer',
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
      statusOptions: [{ label: '禁用', key: -1 }, { label: '待激活', key: 0 }, { label: '正常', key: 1 }],
      genderOptions: [{ label: '男', key: 1 }, { label: '女', key: 2 }],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      user: {
        id: undefined,
        status: undefined,
        user_name: undefined,
        nick_name: undefined,
        gender: undefined,
        introduction: undefined,
        remark: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit'
      },
      rules: {
        status: [{ required: true, message: 'status is required', trigger: 'change' }],
        gender: [{ required: true, message: 'gender is required', trigger: 'change' }],
        user_name: [{ required: true, message: 'user name is required', trigger: 'blur' }],
        nick_name: [{ required: true, message: 'nick name is required', trigger: 'blur' }]
      }
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
    resetUser() {
      this.user = {
        id: undefined,
        status: undefined,
        user_name: undefined,
        nick_name: undefined,
        gender: undefined,
        introduction: undefined,
        remark: undefined
      }
    },
    handleUpdateStatus(row) {
      this.resetUser()
      this.$alert(row['status'] === 1 ? '确定禁用玩家账号?' : '确定启用账号?', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          if (action === 'confirm') {
            this.user.id = row.id
            this.user.status = row['status'] === 1 ? -1 : 1
            update(this.user).then(value => {
              this.getList()
            })
          }
        }
      })
    },
    handleUpdate(row) {
      this.resetUser()
      this.user = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          update(this.user).then(value => {
            this.resetUser()
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
