<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="服务名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
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
    >
      <el-table-column label="图标" align="center" width="80" fixed="left">
        <template slot-scope="{row}">
          <img v-if="row.serviceIcon" :src="baseURL+'/avatar?url=' + row.serviceIcon" alt="" class="service-icon">
        </template>
      </el-table-column>
      <el-table-column label="服务CODE" prop="serviceCode" align="center" width="120" />
      <el-table-column label="类型" prop="serviceType" align="center" width="160" />
      <el-table-column label="状态" prop="enable" align="center" width="120">
        <template slot-scope="{row}">
          <span v-if="row.enable"><el-tag type="success">启用</el-tag></span>
          <span v-else><el-tag type="danger">停用</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="服务名" prop="serviceName" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="节点名称" prop="nodeName" align="center" width="160" show-overflow-tooltip fixed="left" />
      <el-table-column label="节点描述" prop="nodeDescription" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="节点TOKEN" prop="nodeToken" align="center" width="240" show-overflow-tooltip />
      <el-table-column label="IP" prop="address" align="center" width="160" />
      <el-table-column label="端口" prop="port" align="center" width="120" />
      <el-table-column label="注册时间" prop="registered" align="center" width="160" />
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
import { page } from '@/api/game/node'
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
    handleModifyStatus(row, status) {
      console.log(row)
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    }
  }
}
</script>
<style lang="scss" scoped>
  .service-icon {
    width: 36px;
    height: 36px;
    border-radius: 5px;
  }
</style>
