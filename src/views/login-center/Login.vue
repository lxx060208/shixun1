<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const forgotVisible = ref(false)

const form = reactive({
  username: localStorage.getItem('samp_remember') || '',
  password: '',
  captcha: '',
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const captchaText = ref('')
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}
generateCaptcha()

const captchaValid = computed(() => !form.captcha || form.captcha.toLowerCase() === captchaText.value.toLowerCase())

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!captchaValid.value) {
      ElMessage.error('验证码错误')
      generateCaptcha()
      form.captcha = ''
      return
    }
    loading.value = true
    try {
      await auth.login({ username: form.username, password: form.password })
      if (form.remember) {
        localStorage.setItem('samp_remember', form.username)
      } else {
        localStorage.removeItem('samp_remember')
      }
      ElMessage.success('登录成功')
      const redirect = route.query.redirect ? String(route.query.redirect) : '/dashboard'
      router.replace(redirect)
    } catch (err) {
      ElMessage.error(err.message || '登录失败')
      generateCaptcha()
      form.captcha = ''
    } finally {
      loading.value = false
    }
  })
}

// 忘记密码表单
const forgotForm = reactive({ username: '', phone: '', newPassword: '' })
const forgotFormRef = ref()
const forgotRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入预留手机号', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '新密码至少 6 位', trigger: 'blur' }],
}

async function handleForgot() {
  await forgotFormRef.value.validate((valid) => {
    if (!valid) return
    ElMessage.success('密码重置申请已提交，请留意短信通知')
    forgotVisible.value = false
  })
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-logo">
          <el-icon :size="28"><Crop /></el-icon>
        </div>
        <div>
          <h1 class="brand-title">智慧农业综合管理平台</h1>
          <p class="brand-sub">Smart Agriculture Management Platform</p>
        </div>
      </div>

      <h2 class="login-title">账号登录</h2>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" clearable>
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-row">
            <el-input v-model="form.captcha" placeholder="验证码" maxlength="4" clearable>
              <template #prefix><el-icon><Key /></el-icon></template>
            </el-input>
            <div class="captcha-box" title="点击刷新验证码" @click="generateCaptcha">{{ captchaText }}</div>
          </div>
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="form.remember">记住账号</el-checkbox>
          <el-link type="primary" :underline="false" @click="forgotVisible = true">忘记密码？</el-link>
        </div>

        <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
          登 录
        </el-button>
      </el-form>

      <p class="login-tip">演示账号：admin　密码：123456</p>
    </div>

    <el-dialog v-model="forgotVisible" title="找回密码" width="420px" :close-on-click-modal="false">
      <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-width="90px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="forgotForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="预留手机号" prop="phone">
          <el-input v-model="forgotForm.phone" placeholder="请输入预留手机号" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="forgotForm.newPassword" type="password" placeholder="请输入新密码（至少 6 位）" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotVisible = false">取消</el-button>
        <el-button type="primary" @click="handleForgot">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 20% 20%, rgba(47, 158, 68, 0.25), transparent 45%),
    radial-gradient(circle at 80% 80%, rgba(34, 139, 87, 0.28), transparent 45%),
    linear-gradient(135deg, #eaf5ed 0%, #d9efdd 50%, #c6e6d0 100%);
}

.login-card {
  width: 420px;
  padding: 36px 40px 28px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(31, 58, 45, 0.16);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #2f9e44, #1f6f36);
}

.brand-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f3a2d;
}

.brand-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: #86998f;
}

.login-title {
  margin: 0 0 20px;
  font-size: 18px;
  color: #303133;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-box {
  flex: 0 0 116px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #2f9e44;
  background: #e6f4e9;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  letter-spacing: 6px;
}

.login-tip {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  color: #a0aca5;
}
</style>