<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleListApi, saveRoleApi, deleteRoleApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const router = useRouter()
const loading = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const saving = ref(false)
const editingRole = ref(null)

const formRef = ref()
const form = reactive({
  code: '',
  name: '',
  description: '',
})

const rules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getRoleListApi()
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.code = ''
  form.name = ''
  form.description = ''
}

function handleAdd() {
  editingRole.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
  editingRole.value = row
  form.code = row.code
  form.name = row.name
  form.description = row.description
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveRoleApi({ id: editingRole.value?.id, ...form })
      ElMessage.success(editingRole.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await loadData()
    } finally {
      saving.value = false
    }
  })
}

async function handleDelete(row) {
  // 仍被用户引用的角色不可删除，避免用户角色编码悬空
  if (row.userCount > 0) {
    ElMessage.warning(`角色「${row.name}」仍被 ${row.userCount} 名用户使用，无法删除`)
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteRoleApi(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch (err) {
    if (err === 'cancel' || err === 'close') return
    ElMessage.error(err.message || '删除失败')
  }
}

function handlePermission(row) {
  router.push({ path: '/system/permission', query: { roleCode: row.code } })
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">角色管理</h3>
      <el-button v-if="auth.hasPermission('btn-role-add')" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增角色
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="description" label="角色描述" min-width="260" />
        <el-table-column prop="userCount" label="用户数" width="90" align="center">
          <template #default="{ row }">
            <el-badge :value="row.userCount" :hidden="row.userCount === 0" type="success">
              <span>{{ row.userCount }}</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="auth.hasPermission('btn-role-perm')" link type="primary" @click="handlePermission(row)">权限配置</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-tooltip
              :disabled="row.userCount === 0"
              :content="`角色仍被 ${row.userCount} 名用户使用，无法删除`"
              placement="top"
            >
              <span>
                <el-button link type="danger" :disabled="row.userCount > 0" @click="handleDelete(row)">删除</el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingRole ? '编辑角色' : '新增角色'" width="480px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="!!editingRole" placeholder="如：manager" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>