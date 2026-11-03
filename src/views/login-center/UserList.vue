<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserListApi, saveUserApi, deleteUserApi } from '@/api'
import { roles, departments } from '@/api/mock'
import UserForm from './UserForm.vue'

const loading = ref(false)
const list = ref([])

const query = reactive({
  keyword: '',
  department: '',
  status: '',
})

const dialogVisible = ref(false)
const editingUser = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 5,
})

const roleNameMap = Object.fromEntries(roles.map((r) => [r.code, r.name]))

const filteredList = computed(() => {
  return list.value.filter((u) => {
    const matchKeyword =
      !query.keyword ||
      u.username.includes(query.keyword) ||
      u.name.includes(query.keyword) ||
      u.phone.includes(query.keyword)
    const matchDept = !query.department || u.department === query.department
    const matchStatus = query.status === '' || u.status === Number(query.status)
    return matchKeyword && matchDept && matchStatus
  })
})

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredList.value.slice(start, start + pagination.pageSize)
})

async function loadData() {
  loading.value = true
  try {
    list.value = await getUserListApi()
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
}

function handleReset() {
  query.keyword = ''
  query.department = ''
  query.status = ''
  pagination.page = 1
}

function handleAdd() {
  editingUser.value = null
  dialogVisible.value = true
}

function handleEdit(row) {
  editingUser.value = { ...row }
  dialogVisible.value = true
}

async function handleSave(payload) {
  await saveUserApi(payload)
  ElMessage.success(editingUser.value ? '修改成功' : '新增成功')
  dialogVisible.value = false
  await loadData()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除用户「${row.name}」吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await deleteUserApi(row.id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">用户管理</h3>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <div class="toolbar">
        <el-input
          v-model="query.keyword"
          placeholder="用户名 / 姓名 / 手机号"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="query.department" placeholder="所属部门" clearable style="width: 160px">
          <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
        </el-select>
        <el-select v-model="query.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="pagedList" border stripe>
        <el-table-column prop="username" label="用户名" min-width="110" />
        <el-table-column prop="name" label="姓名" min-width="90" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="success" effect="plain">{{ roleNameMap[row.roleCode] || row.roleCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="filteredList.length"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
      />
    </el-card>

    <UserForm v-model="dialogVisible" :user="editingUser" @save="handleSave" />
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>