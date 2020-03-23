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
            @sort-change="sortChange"
    >
      <el-table-column label="服务ID" prop="serviceId" align="center" width="120"></el-table-column>
      <el-table-column label="服务CODE" prop="serviceCode" align="center" width="160"></el-table-column>
      <el-table-column label="类型" prop="serviceType" align="center" width="160"></el-table-column>
      <el-table-column label="服务名" prop="name"  align="center" width="240" show-overflow-tooltip></el-table-column>
      <el-table-column label="IP" prop="address" align="center" width="160"></el-table-column>
      <el-table-column label="端口" prop="port"  align="center" width=120"></el-table-column>
      <el-table-column label="状态" prop="enable" align="center" width="120"></el-table-column>
      <el-table-column label="注册时间" prop="registered" align="center" width="160"></el-table-column>
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
          // Just to simulate the time of the request
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
  .user-avatar {
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }
</style>
