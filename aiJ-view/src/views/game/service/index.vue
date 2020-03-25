<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="服务名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves class="filter-item" type="success" icon="el-icon-plus" @click="handleCreate">
        创建
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
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="类型" prop="type" align="center" width="120" />
      <el-table-column label="CODE" prop="code" align="center" width="120" />
      <el-table-column label="名称" prop="name" align="center" width="160" show-overflow-tooltip />
      <el-table-column
        label="描述"
        prop="description"
        align="center"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column label="创建时间" prop="created_time" align="center" width="160" />
      <el-table-column label="修改时间" prop="modified_time" align="center" width="160" />
      <el-table-column label="操作" prop="id" align="center" width="160" fixed="right">
        <template slot-scope="{row}">
          <el-button size="mini" @click="handleModifyStatus(row)">编辑</el-button>
          <el-button size="mini" type="danger">删除</el-button>
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
    <!-- 添加OR修改的弹出层-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="service"
        label-position="left"
        label-width="70px"
      >
        <el-form-item label="类型" prop="type">
          <el-select v-model="service.type" placeholder="Please select">
            <el-option
              v-for="item in typeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="service.code" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="service.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="service.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
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
import { page } from '@/api/game/service'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ServiceTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
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
        name: undefined
      },
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogStatus: '',
      dialogFormVisible: false,
      service: {
        id: undefined,
        type: '',
        code: '',
        name: '',
        description: ''
      },
      statusOptions: ['published', 'draft', 'deleted'],
      typeOptions: [
        { key: 'PLAZA', display_name: '游戏大厅服' },
        { key: 'ROOM', display_name: '游戏房间服' },
        { key: 'PLATFORM', display_name: '管理平台服' }
      ],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        code: [{ required: true, message: 'code is required', trigger: 'blur' }],
        name: [{ required: true, message: 'name is required', trigger: 'blur' }],
        description: [{ required: true, message: 'description is required', trigger: 'blur' }]
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
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    resetService() {
      this.service = {
        id: undefined,
        type: '',
        code: '',
        name: '',
        description: ''
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    handleCreate() {
      this.resetService()
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
    }
  }
}
</script>
<style lang="scss" scoped>
    .el-select {
      width: 100%;
    }
</style>

