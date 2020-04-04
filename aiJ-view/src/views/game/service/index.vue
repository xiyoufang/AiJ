<template>
  <div class="app-container">
    <el-alert
      title="提示"
      type="warning"
      description="界面上不提供服务删除功能"
      show-icon
    />
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
      <el-table-column label="图标" align="center" width="80" fixed="left">
        <template slot-scope="{row}">
          <img v-if="row.icon" :src="baseURL+'/avatar?url=' + row.icon" alt="" class="service-icon">
        </template>
      </el-table-column>
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="类型" prop="type" align="center" width="160" />
      <el-table-column label="CODE" prop="code" align="center" width="160" />
      <el-table-column label="名称" prop="name" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="描述" prop="description" align="center" width="240" show-overflow-tooltip />
      <el-table-column label="数据保护" prop="protected" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="部署地址" prop="deployment" align="center" width="240" show-overflow-tooltip />
      <el-table-column label="顺序" prop="sort" align="center" width="80" />
      <el-table-column label="创建时间" prop="created_time" align="center" width="160" />
      <el-table-column label="修改时间" prop="modified_time" align="center" width="160" />
      <el-table-column label="操作" prop="id" align="center" width="160" fixed="right">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            :disabled="row.protected === 'Y'"
            @click="handleUpdate(row)"
          >编辑</el-button>
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
        <el-form-item label="图标" prop="icon">
          <el-input v-model="service.icon" />
        </el-form-item>
        <el-form-item label="部署地址" prop="deployment">
          <el-input v-model="service.deployment" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="service.sort" type="number" />
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
import { page, createService, updateService } from '@/api/game/service'
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
        type: undefined,
        code: undefined,
        name: undefined,
        description: undefined,
        icon: undefined,
        deployment: undefined,
        sort: undefined
      },
      statusOptions: ['published', 'draft', 'deleted'],
      typeOptions: [
        { key: 'ROOM', display_name: 'ROOM' },
        { key: 'PLAZA', display_name: 'PLAZA' },
        { key: 'PLATFORM', display_name: 'PLATFORM' },
        { key: 'CIRCLE', display_name: 'CIRCLE' }
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
      }).finally(() => {
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 1000)
      })
    },
    resetService() {
      this.service = {
        id: undefined,
        type: undefined,
        code: undefined,
        name: undefined,
        description: undefined,
        icon: undefined,
        deployment: undefined,
        sort: undefined
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleUpdate(row) {
      this.service = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreate() {
      this.resetService()
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createService(this.service).then((v) => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateService(this.service).then((v) => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Updated Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-select {
    width: 100%;
  }
  .el-alert {
    margin-bottom: 10px;
  }
  .service-icon {
    width: 36px;
    height: 36px;
    border-radius: 5px;
  }
</style>

