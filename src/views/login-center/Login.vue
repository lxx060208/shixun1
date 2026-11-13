<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { resetPasswordApi, CAPTCHA_ESCALATE_AT } from '@/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref()
const loading = ref(false)
const forgotVisible = ref(false)

const rememberedAccount = localStorage.getItem('samp_remember') || ''

const form = reactive({
  username: rememberedAccount,
  password: '',
  captcha: '',
  remember: !!rememberedAccount,
})

// 勾选状态即时同步到本地：取消勾选时立即清除已记忆的账号
watch(
  () => form.remember,
  (val) => {
    if (val) {
      if (form.username) localStorage.setItem('samp_remember', form.username)
    } else {
      localStorage.removeItem('samp_remember')
    }
  },
)

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const captchaCanvas = ref()
// 验证码答案只保存在内存中，通过 canvas 绘制，页面文本与 DOM 中不出现明文
const captchaAnswer = ref('')
const CAPTCHA_TTL = 60
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
// 连续输入错误密码的次数，达到阈值后升级验证码难度（长度 6 位、区分大小写）
const failedAttempts = ref(0)
const captchaEscalated = computed(() => failedAttempts.value >= CAPTCHA_ESCALATE_AT)
const captchaLength = computed(() => (captchaEscalated.value ? 6 : 4))

const captchaExpireAt = ref(0)
const captchaRemain = ref(0)
const captchaExpired = computed(() => captchaExpireAt.value > 0 && captchaRemain.value === 0)
let captchaTimer = null

function drawCaptcha(code) {
  const canvas = captchaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width: w, height: h } = canvas
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#e6f5ec'
  ctx.fillRect(0, 0, w, h)
  // 干扰线
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${100 + Math.random() * 100}, ${140 + Math.random() * 80}, ${100 + Math.random() * 80}, 0.6)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.lineTo(Math.random() * w, Math.random() * h)
    ctx.stroke()
  }
  // 噪点
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(22, 163, 74, ${0.2 + Math.random() * 0.5})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }
  // 字符（随机倾斜，肉眼可辨但无法从 DOM 取值）
  const step = w / (code.length + 1)
  code.split('').forEach((ch, i) => {
    ctx.save()
    ctx.translate(step * (i + 1), h / 2 + (Math.random() - 0.5) * 8)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.font = `bold ${20 + Math.random() * 4}px Arial`
    ctx.fillStyle = captchaEscalated.value ? '#b45309' : '#15803d'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
  })
}

function refreshCaptcha() {
  let code = ''
  for (let i = 0; i < captchaLength.value; i++) {
    code += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length))
  }
  captchaAnswer.value = code
  captchaExpireAt.value = Date.now() + CAPTCHA_TTL * 1000
  captchaRemain.value = CAPTCHA_TTL
  form.captcha = ''
  drawCaptcha(code)
}

function tickCaptcha() {
  if (!captchaExpireAt.value) return
  captchaRemain.value = Math.max(0, Math.ceil((captchaExpireAt.value - Date.now()) / 1000))
}

onMounted(() => {
  refreshCaptcha()
  captchaTimer = setInterval(tickCaptcha, 1000)
})

onBeforeUnmount(() => {
  if (captchaTimer) clearInterval(captchaTimer)
})

const captchaValid = computed(() => {
  if (!form.captcha || !captchaAnswer.value) return false
  return captchaEscalated.value
    ? form.captcha === captchaAnswer.value
    : form.captcha.toLowerCase() === captchaAnswer.value.toLowerCase()
})

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (captchaExpired.value) {
      ElMessage.warning('验证码已失效，请点击图片刷新后重试')
      refreshCaptcha()
      return
    }
    if (!captchaValid.value) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }
    loading.value = true
    try {
      await auth.login({ username: form.username, password: form.password })
      failedAttempts.value = 0
      if (form.remember) {
        localStorage.setItem('samp_remember', form.username)
      } else {
        localStorage.removeItem('samp_remember')
      }
      ElMessage.success('登录成功')
      const redirect = route.query.redirect ? String(route.query.redirect) : '/dashboard'
      router.replace(redirect)
    } catch (err) {
      // 依据服务端返回的失败次数升级验证码难度；账号锁定后需等待自动解锁
      failedAttempts.value = err.failedAttempts ?? failedAttempts.value
      if (err.code === 'ACCOUNT_LOCKED') {
        ElMessage.error(err.message || '账号已锁定')
      } else if (captchaEscalated.value) {
        ElMessage.error(`${err.message || '登录失败'}，验证码已升级为 6 位并区分大小写`)
      } else {
        ElMessage.error(err.message || '登录失败')
      }
      refreshCaptcha()
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
  await forgotFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await resetPasswordApi({
        username: forgotForm.username,
        phone: forgotForm.phone,
        newPassword: forgotForm.newPassword,
      })
      ElMessage.success('密码已重置，请使用新密码登录')
      forgotVisible.value = false
      forgotForm.username = ''
      forgotForm.phone = ''
      forgotForm.newPassword = ''
    } catch (err) {
      ElMessage.error(err.message || '重置失败')
    }
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
            <el-input v-model="form.captcha" placeholder="验证码" :maxlength="captchaLength" clearable>
              <template #prefix><el-icon><Key /></el-icon></template>
            </el-input>
            <div
              class="captcha-box"
              :class="{ 'is-escalated': captchaEscalated, 'is-expired': captchaExpired }"
              title="点击刷新验证码"
              @click="refreshCaptcha"
            >
              <canvas ref="captchaCanvas" width="116" height="40"></canvas>
              <span v-if="captchaExpired" class="captcha-expired">已失效</span>
            </div>
          </div>
          <div class="captcha-meta">
            <span class="captcha-ttl" :class="{ 'is-expired': captchaExpired }">
              {{ captchaExpired ? '验证码已失效，点击图片刷新' : `验证码 ${captchaRemain}s 后失效` }}
            </span>
            <el-link type="primary" :underline="false" @click="refreshCaptcha">换一张</el-link>
          </div>
          <p v-if="captchaEscalated" class="captcha-risk">
            检测到多次密码错误，验证码已提升为 6 位并区分大小写
          </p>
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
  padding: 16px;
  background:
    radial-gradient(circle at 15% 10%, rgba(22, 163, 74, 0.14), transparent 40%),
    radial-gradient(circle at 85% 90%, rgba(16, 185, 129, 0.14), transparent 40%),
    linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f5f7fa 100%);
}

.login-card {
  width: 420px;
  padding: 36px 40px 28px;
  background: #fff;
  border: 1px solid rgba(22, 163, 74, 0.08);
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.brand-logo {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #16a34a, #0f7b38);
  box-shadow: 0 8px 18px rgba(22, 163, 74, 0.3);
}

.brand-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.brand-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--samp-text-secondary);
}

.login-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--samp-text-main);
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-box {
  position: relative;
  flex: 0 0 116px;
  height: 40px;
  overflow: hidden;
  background: #e6f5ec;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  border: 1.5px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.captcha-box:hover {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

.captcha-box:active {
  transform: scale(0.97);
}

.captcha-box canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/* hover 时叠加半透明遮罩与刷新图标，暗示可点击刷新 */
.captcha-box::after {
  content: '换一张';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #fff;
  background: rgba(22, 163, 74, 0.82);
  opacity: 0;
  transition: opacity 0.18s;
  pointer-events: none;
}

.captcha-box:hover::after {
  opacity: 1;
}

.captcha-box.is-escalated {
  box-shadow: inset 0 0 0 2px #f59e0b;
}

.captcha-box.is-escalated:hover {
  box-shadow: inset 0 0 0 2px #f59e0b, 0 0 0 3px rgba(245, 158, 11, 0.18);
}

.captcha-box.is-expired canvas {
  filter: grayscale(1);
  opacity: 0.5;
}

.captcha-expired {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #b91c1c;
  background: rgba(255, 255, 255, 0.55);
}

.captcha-meta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.captcha-ttl.is-expired {
  color: #dc2626;
}

.captcha-risk {
  width: 100%;
  margin: 6px 0 0;
  font-size: 12px;
  color: #d97706;
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
  color: var(--samp-text-secondary);
}
</style>