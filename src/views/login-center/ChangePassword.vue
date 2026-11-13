<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { changePasswordApi } from '@/api'

const auth = useAuthStore()
const router = useRouter()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

/* -------------------- 密码强度评估 -------------------- */

// 密码规则：长度 8-20 位，至少包含大写字母、小写字母、数字、特殊符号中的 3 类
const PWD_RULES = [
  { label: '8-20 位字符', test: (p) => p.length >= 8 && p.length <= 20 },
  { label: '包含小写字母', test: (p) => /[a-z]/.test(p) },
  { label: '包含大写字母', test: (p) => /[A-Z]/.test(p) },
  { label: '包含数字', test: (p) => /\d/.test(p) },
  { label: '包含特殊符号', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function evaluatePassword(pwd) {
  if (!pwd) return { score: 0, level: 0, label: '', rules: PWD_RULES.map((r) => ({ ...r, pass: false })) }
  const rules = PWD_RULES.map((r) => ({ ...r, pass: r.test(pwd) }))
  const passed = rules.filter((r) => r.pass).length
  // score = 长度贡献 + 种类贡献
  const lenScore = Math.min(pwd.length, 12) / 12 // 长度 12 以上视为满分
  const kindScore = passed / PWD_RULES.length
  // 长度不够直接卡到 20%
  const lengthOk = pwd.length >= 8 && pwd.length <= 20
  const score = lengthOk ? lenScore * 0.4 + kindScore * 0.6 : Math.min(lenScore, 0.2)
  let level = 0
  let label = ''
  if (!lengthOk || passed < 2) { level = 1; label = '弱' }
  else if (score < 0.55) { level = 2; label = '较弱' }
  else if (score < 0.75) { level = 3; label = '中等' }
  else if (score < 0.9) { level = 4; label = '强' }
  else { level = 5; label = '非常强' }
  return { score, level, label, rules }
}

const strength = computed(() => evaluatePassword(form.newPassword))

// 强度条颜色 / 背景
const strengthColors = ['#e5e6eb', '#f56c6c', '#e6a23c', '#f7c948', '#67c23a', '#22c55e'] // 0-5
const strengthBarColor = computed(() => strengthColors[strength.value.level] || '#e5e6eb')
const strengthBarWidth = computed(() => `${Math.round(strength.value.score * 100)}%`)

const newPwdTooWeak = computed(() => {
  const { level } = strength.value
  const { rules } = strength.value
  const lengthOk = rules[0].pass
  return !lengthOk || level < 3 // 中等以下视为弱密码
})

/* -------------------- 表单校验 -------------------- */

const validateConfirm = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入新密码'))
  if (value.length < 8 || value.length > 20) {
    return callback(new Error('密码长度须为 8-20 位'))
  }
  if (form.oldPassword && value === form.oldPassword) {
    return callback(new Error('新密码不能与当前密码相同'))
  }
  const { rules } = evaluatePassword(value)
  const passed = rules.filter((r) => r.pass).length
  if (passed < 3) {
    const missing = rules.filter((r) => !r.pass).map((r) => r.label)
    return callback(new Error(`密码强度不足，还需满足：${missing.slice(0, 2).join('、')}`))
  }
  callback()
}

const rules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

/* -------------------- 交互 -------------------- */

// 新密码变化时，若确认密码已有值则联动重新校验
watch(
  () => form.newPassword,
  () => {
    if (form.confirmPassword) formRef.value?.validateField('confirmPassword')
  },
)

function handleReset() {
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await changePasswordApi({
        id: auth.userInfo?.id,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      // 改密后原 token 失效，强制退出并重新登录
      ElMessage.success('密码修改成功，请使用新密码重新登录')
      auth.logout()
      router.replace('/login')
    } catch (err) {
      ElMessage.error(err.message || '修改失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="change-password">
    <el-card shadow="never" class="card">
      <template #header>
        <span class="panel-title">修改密码</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="form">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" type="password" placeholder="请输入当前密码" show-password />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="8-20 位，至少包含 3 类字符（大小写/数字/符号）"
            show-password
            autocomplete="new-password"
          />
          <!-- 实时强度条 + 分项检查 -->
          <div class="strength-block" v-if="form.newPassword">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :style="{ width: strengthBarWidth, background: strengthBarColor }"
              />
            </div>
            <div class="strength-meta">
              <span class="strength-label">密码强度：<b :style="{ color: strengthBarColor }">{{ strength.label || '—' }}</b></span>
              <span class="strength-tip" v-if="newPwdTooWeak">弱密码易被破解，建议加强</span>
            </div>
            <ul class="strength-rules">
              <li
                v-for="r in strength.rules"
                :key="r.label"
                :class="{ pass: r.pass }"
              >
                <span class="dot" />
                {{ r.label }}
              </li>
              <li
                v-if="form.oldPassword && form.newPassword"
                :class="{ pass: form.newPassword !== form.oldPassword }"
              >
                <span class="dot" />
                不得与当前密码相同
              </li>
            </ul>
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">确认修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        title="密码安全提示：8-20 位，至少包含大写字母、小写字母、数字、特殊符号中的 3 类，且不得与账号、当前密码相同。"
        type="info"
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<style scoped>
.card {
  max-width: 560px;
}

.panel-title {
  font-weight: 600;
  color: #1f2d3d;
}

.form {
  margin-bottom: 12px;
}

/* 密码强度块 */
.strength-block {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 6px;
  border-radius: 4px;
  background: #f1f3f5;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.25s ease, background 0.25s ease;
}

.strength-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #606266;
}

.strength-meta b {
  font-weight: 600;
  margin-left: 2px;
}

.strength-tip {
  color: #e6a23c;
}

.strength-rules {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  color: #909399;
}

.strength-rules li {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s;
}

.strength-rules li.pass {
  color: #16a34a;
}

.strength-rules li .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c0c4cc;
  flex-shrink: 0;
  transition: background 0.15s;
}

.strength-rules li.pass .dot {
  background: #16a34a;
}
</style>
