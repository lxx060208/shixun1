<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTenantListApi, saveTenantApi, deleteTenantApi } from '@/api'

const loading = ref(false)
const list = ref([])

const dialogVisible = ref(false)
const saving = ref(false)
const editingTenant = ref(null)

const formRef = ref()
const form = reactive({
  code: '',
  name: '',
  contact: '',
  phone: '',
  userQuota: 50,
  storageQuota: 200,
  plotQuota: 80,
  expireTime: '',
  status: 1,
})

const rules = {
  code: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  expireTime: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
}

async function loadData() {
  loading.value = true
  try {
    list.value = await getTenantListApi()
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.code = ''
  form.name = ''
  form.contact = ''
  form.phone = ''
  form.userQuota = 50
  form.storageQuota = 200
  form.plotQuota = 80
  form.expireTime = ''
  form.status = 1
}

function handleAdd() {
  editingTenant.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
  editingTenant.value = row
  form.code = row.code
  form.name = row.name
  form.contact = row.contact
  form.phone = row.phone
  form.userQuota = row.userQuota
  form.storageQuota = row.storageQuota
  form.plotQuota = row.plotQuota
  form.expireTime = row.expireTime
  form.status = row.status
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveTenantApi({ id: editingTenant.value?.id, ...form })
      ElMessage.success(editingTenant.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await loadData()
    } finally {
      saving.value = false
    }
  })
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除租户「${row.name}」吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await deleteTenantApi(row.id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">租户管理</h3>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增租户
      </el-button>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column prop="code" label="租户编码" min-width="110" />
        <el-table-column prop="name" label="租户名称" min-width="180" />
        <el-table-column prop="contact" label="联系人" min-width="90" />
        <el-table-column prop="phone" label="联系电话" min-width="120" />
        <el-table-column prop="userQuota" label="用户配额" width="100" align="center" />
        <el-table-column prop="storageQuota" label="存储配额(GB)" width="120" align="center" />
        <el-table-column prop="plotQuota" label="地块配额" width="100" align="center" />
        <el-table-column prop="expireTime" label="到期时间" min-width="110" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '停用' }}
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
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingTenant ? '编辑租户' : '新增租户'" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租户编码" prop="code">
              <el-input v-model="form.code" :disabled="!!editingTenant" placeholder="如：nanshan" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入租户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户配额">
              <el-input-number v-model="form.userQuota" :min="1" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存储配额(GB)">
              <el-input-number v-model="form.storageQuota" :min="1" :max="10000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地块配额">
              <el-input-number v-model="form.plotQuota" :min="1" :max="1000" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期时间" prop="expireTime">
              <el-date-picker v-model="form.expireTime" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">正常</el-radio>
                <el-radio :value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>