<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.status"
        placeholder="状态"
        clearable
        style="width: 180px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <router-link :to="{name: 'UpdateRole'}">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit">
          Add
        </el-button>
      </router-link>
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
      <el-table-column label="ID" prop="id" align="center" width="100" show-overflow-tooltip />
      <el-table-column label="角色" prop="name" align="center" width="160" show-overflow-tooltip />
      <el-table-column label="描述" prop="description" align="center" width="240" show-overflow-tooltip />
      <el-table-column label="数据保护" prop="protected" align="center" width="160" />
      <el-table-column label="更新日期" prop="modified_time" align="center" width="160" />
      <el-table-column label="创建日期" prop="created_time" align="center" width="160" />
      <el-table-column label="操作" prop="id" align="center" width="240" fixed="right">
        <template slot-scope="{row}">
          <router-link :to="{name: 'UpdateRole' , params: row}">
            <el-button
              size="mini"
            >修改</el-button>
          </router-link>
          <el-button
            v-if="row.status === 1"
            size="mini"
            type="danger"
            :disabled="row.protected === 'Y'"
            @click="handleUpdateStatus(row)"
          >禁用
          </el-button>
          <el-button
            v-else
            size="mini"
            type="success"
            :disabled="row.protected === 'Y'"
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
  </div>
</template>

<script>
import { page, updateRole } from '@/api/role'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'UserRole',
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
      role: {
        id: undefined,
        status: undefined
      },
      statusOptions: [{ label: '禁用', key: -1 }, { label: '正常', key: 1 }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      page(this.listQuery).then(response => {
        this.list = response.data.items.map(item => {
          item.menus = item.menus === undefined ? [] : JSON.parse(item.menus)
          item.permissions = item.permissions === undefined ? [] : JSON.parse(item.permissions)
          return item
        })
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
    resetRole() {
      this.role = {
        id: undefined,
        status: undefined
      }
    },
    handleCreate() {
    },
    handleUpdateStatus(row) {
      this.resetRole()
      this.$alert(row['status'] === 1 ? '确定禁用角色?' : '确定启用角色?', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          if (action === 'confirm') {
            this.role.id = row.id
            this.role.status = row['status'] === 1 ? -1 : 1
            updateRole(this.role).then(value => {
              this.getList()
            })
          }
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
