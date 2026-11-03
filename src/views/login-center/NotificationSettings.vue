<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getNotificationsApi, updateNotificationsApi } from '@/api'

const loading = ref(true)
const saving = ref(false)

const form = reactive({
  inSite: true,
  sms: true,
  wechat: false,
  email: true,
  quietEnabled: false,
  quietRange: ['22:00:00', '07:00:00'],
})

const channels = [
  { key: 'inSite', label: '站内消息', desc: '工作台内的系统通知与待办提醒' },
  { key: 'sms', label: '短信通知', desc: '实时告警与重要事项的短信提醒' },
  { key: 'wechat', label: '微信通知', desc: '通过绑定的微信公众号推送消息' },
  { key: 'email', label: '邮件通知', desc: '报表、备份结果等邮件发送' },
]

const quietEnabled = computed({
  get: () => form.quietEnabled,
  set: (v) => (form.quietEnabled = v),
})

onMounted(async () => {
  loading.value = true
  try {
    const data = await getNotificationsApi()
    form.inSite = data.inSite
    form.sms = data.sms
    form.wechat = data.wechat
    form.email = data.email
    form.quietEnabled = data.quietEnabled
    form.quietRange = [data.quietStart, data.quietEnd]
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  try {
    await updateNotificationsApi({
      inSite: form.inSite,
      sms: form.sms,
      wechat: form.wechat,
      email: form.email,
      quietEnabled: form.quietEnabled,
      quietStart: form.quietRange[0],
      quietEnd: form.quietRange[1],
    })
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-loading="loading" class="notification-settings">
    <el-card shadow="never">
      <template #header>
        <span class="panel-title">消息通知设置</span>
      </template>

      <div class="section-title">通知渠道</div>
      <div class="channel-list">
        <div v-for="channel in channels" :key="channel.key" class="channel-item">
          <el-icon class="channel-icon"><Bell /></el-icon>
          <div class="channel-info">
            <div class="channel-label">{{ channel.label }}</div>
            <div class="channel-desc">{{ channel.desc }}</div>
          </div>
          <el-switch v-model="form[channel.key]" />
        </div>
      </div>

      <el-divider />

      <div class="section-title">免打扰时段设置</div>
      <div class="quiet-setting">
        <div class="quiet-row">
          <div>
            <div class="channel-label">开启免打扰</div>
            <div class="channel-desc">免打扰时段内暂停非紧急消息推送</div>
          </div>
          <el-switch v-model="quietEnabled" />
        </div>
        <div v-if="form.quietEnabled" class="quiet-row">
          <span class="quiet-label">免打扰时段</span>
          <el-time-picker
            v-model="form.quietRange"
            is-range
            format="HH:mm"
            value-format="HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </div>
      </div>

      <el-divider />

      <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
    </el-card>
  </div>
</template>

<style scoped>
.panel-title {
  font-weight: 600;
  color: #1f2d3d;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 14px;
}

.channel-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  max-width: 760px;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e6ebe8;
  border-radius: 8px;
}

.channel-icon {
  color: var(--el-color-primary);
  font-size: 22px;
}

.channel-info {
  flex: 1;
}

.channel-label {
  font-weight: 600;
  color: #303133;
}

.channel-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #a0aca5;
}

.quiet-setting {
  max-width: 560px;
}

.quiet-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.quiet-label {
  color: #303133;
}
</style>