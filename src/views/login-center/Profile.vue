<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { updateProfileApi } from '@/api'
import { departments, roles } from '@/api/mock'

const auth = useAuthStore()

const formRef = ref()
const saving = ref(false)

const form = reactive({
  id: null,
  username: '',
  name: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  roleCode: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

const roleNameMap = Object.fromEntries(roles.map((r) => [r.code, r.name]))

onMounted(() => {
  if (auth.userInfo) {
    Object.assign(form, auth.userInfo)
  }
})

async function handleSave() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await updateProfileApi({ ...form })
      await auth.fetchUserInfo()
      ElMessage.success('保存成功')
    } catch (err) {
      ElMessage.error(err.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}
</script>

<template>
  <div class="profile">
    <el-card shadow="never">
      <template #header>
        <span class="panel-title">基本资料</span>
      </template>
      <div class="profile-head">
        <el-avatar :size="72" class="avatar">{{ form.name?.charAt(0) }}</el-avatar>
        <div>
          <div class="head-name">{{ form.name }}</div>
          <el-tag type="success" effect="plain">{{ roleNameMap[form.roleCode] || form.roleCode }}</el-tag>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="profile-form">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="用户名">
              <el-input v-model="form.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="所属部门">
              <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
                <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="职位">
              <el-input v-model="form.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.panel-title {
  font-weight: 600;
  color: #1f2d3d;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0 24px;
  border-bottom: 1px solid #eef2ef;
  margin-bottom: 24px;
}

.avatar {
  background: var(--el-color-primary);
  font-size: 28px;
}

.head-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 6px;
}

.profile-form {
  max-width: 720px;
}
</style>