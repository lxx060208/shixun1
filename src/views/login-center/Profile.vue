<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { updateProfileApi } from '@/api'
import { departments } from '@/api/mock'
import { roles } from '@/api/db'

const auth = useAuthStore()

const formRef = ref()
const saving = ref(false)

const form = reactive({
  id: null,
  username: '',
  name: '',
  avatar: '',
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

// 压缩图片到较小尺寸，避免 base64 占用过多存储（头像上限 256px）
function compressImage(img) {
  const MAX = 256
  let { width, height } = img
  if (width > height && width > MAX) {
    height = Math.round((height * MAX) / width)
    width = MAX
  } else if (height >= width && height > MAX) {
    width = Math.round((width * MAX) / height)
    height = MAX
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

function handleAvatarSelect(uploadFile) {
  const raw = uploadFile.raw
  if (!raw) return
  if (!/^image\//.test(raw.type)) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      form.avatar = compressImage(img)
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(raw)
}

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
        <el-upload
          class="avatar-uploader"
          accept="image/*"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarSelect"
        >
          <div class="avatar-wrap" title="点击更换头像">
            <el-avatar :size="80" class="avatar">
              <img v-if="form.avatar" :src="form.avatar" alt="用户头像" />
              <span v-else>{{ form.name?.charAt(0) }}</span>
            </el-avatar>
            <div class="avatar-mask">
              <el-icon :size="18"><Camera /></el-icon>
            </div>
          </div>
        </el-upload>
        <div class="head-info">
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
  font-weight: 700;
  color: var(--samp-text-main);
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 0 24px;
  border-bottom: 1px solid var(--samp-border);
  margin-bottom: 24px;
}

.avatar-uploader {
  flex: 0 0 auto;
}

.avatar-uploader :deep(.el-upload) {
  border: none;
  border-radius: 50%;
  line-height: 0;
}

.avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #34d399, #16a34a);
  font-size: 30px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(15, 23, 42, 0.42);
  opacity: 0;
  transition: opacity 0.18s;
}

.avatar-wrap:hover .avatar-mask {
  opacity: 1;
}

.head-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.head-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.profile-form {
  max-width: 720px;
}
</style>