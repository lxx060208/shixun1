<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getAlarmRealtimeApi, confirmAlarmApi, handleAlarmApi, archiveAlarmApi } from '@/api'

const auth = useAuthStore()
const loading = ref(true)
const alarms = ref([])
const stats = ref({})

const filterLevel = ref('全部')
const filterStatus = ref('')
const keyword = ref('')

const autoRefresh = ref(true)
const lastRefresh = ref('')
let timer = null

const detailVisible = ref(false)
const detailAlarm = ref(null)

const handleVisible = ref(false)
const handleAlarm = ref(null)
const handleNote = ref('')
const submitting = ref(false)

const levelOptions = ['全部', '严重', '警告', '提示']

const operator = computed(() => auth.userInfo?.name || '系统管理员')

const filteredAlarms = computed(() =>
  alarms.value.filter((a) => {
    const matchLevel = filterLevel.value === '全部' || a.level === filterLevel.value
    const matchStatus = !filterStatus.value || a.status === filterStatus.value
    const matchKey =
      !keyword.value ||
      a.device.includes(keyword.value) ||
      a.type.includes(keyword.value) ||
      a.id.includes(keyword.value) ||
      a.park.includes(keyword.value)
    return matchLevel && matchStatus && matchKey
  }),
)

const severePending = computed(() => alarms.value.filter((a) => a.level === '严重' && a.status === '待处置').length)

const statCards = computed(() => [
  { label: '今日告警', value: stats.value.today || 0, unit: '条', icon: 'Bell', color: '#e8590c' },
  { label: '待处置', value: stats.value.pending || 0, unit: '条', icon: 'WarningFilled', color: '#e03131' },
  { label: '严重告警', value: stats.value.severe || 0, unit: '条', icon: 'CircleCloseFilled', color: '#c92a2a' },
  { label: '处置完成率', value: stats.value.handledRate || 0, unit: '%', icon: 'CircleCheck', color: '#2f9e44' },
])

function levelType(level) {
  return { 严重: 'danger', 警告: 'warning', 提示: 'info' }[level] || 'info'
}

function statusType(status) {
  return { 待处置: 'danger', 已确认: 'warning', 已处置: 'success', 已归档: 'info' }[status] || 'info'
}

function severityClass(level) {
  return level === '严重' ? 'level-severe' : ''
}

function openDetail(row) {
  detailAlarm.value = row
  detailVisible.value = true
}

async function load() {
  try {
    const res = await getAlarmRealtimeApi()
    alarms.value = res.list
    stats.value = res.stats
    lastRefresh.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  } catch (e) {
    ElMessage.error(e.message || '加载告警失败')
  } finally {
    loading.value = false
  }
}

async function confirmAlarm(row) {
  await ElMessageBox.confirm(`确认告警「${row.device} · ${row.type}」？确认后将进入处置环节。`, '确认告警', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await confirmAlarmApi(row.id, operator.value)
    ElMessage.success('告警已确认')
    await load()
    if (detailVisible.value && detailAlarm.value?.id === row.id) detailAlarm.value = alarms.value.find((a) => a.id === row.id)
  } catch (e) {
    ElMessage.error(e.message || '确认失败')
  }
}

function openHandle(row) {
  handleAlarm.value = row
  handleNote.value = ''
  handleVisible.value = true
}

async function submitHandle() {
  if (!handleNote.value.trim()) {
    ElMessage.warning('请填写处置说明')
    return
  }
  submitting.value = true
  try {
    await handleAlarmApi(handleAlarm.value.id, { operator: operator.value, note: handleNote.value.trim() })
    ElMessage.success('处置完成')
    handleVisible.value = false
    await load()
    if (detailVisible.value && detailAlarm.value?.id === handleAlarm.value.id) {
      detailAlarm.value = alarms.value.find((a) => a.id === handleAlarm.value.id)
    }
  } catch (e) {
    ElMessage.error(e.message || '处置失败')
  } finally {
    submitting.value = false
  }
}

async function archiveAlarm(row) {
  await ElMessageBox.confirm(`确认归档告警「${row.device} · ${row.type}」？归档后进入历史记录。`, '归档告警', {
    confirmButtonText: '归档',
    cancelButtonText: '取消',
    type: 'info',
  })
  try {
    await archiveAlarmApi(row.id, operator.value)
    ElMessage.success('告警已归档')
    await load()
    if (detailVisible.value && detailAlarm.value?.id === row.id) detailAlarm.value = alarms.value.find((a) => a.id === row.id)
  } catch (e) {
    ElMessage.error(e.message || '归档失败')
  }
}

function startTimer() {
  stopTimer()
  if (autoRefresh.value) timer = setInterval(load, 15000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function toggleAutoRefresh(val) {
  if (val) {
    startTimer()
    ElMessage.success('已开启自动刷新（15 秒）')
  } else {
    stopTimer()
    ElMessage.info('已关闭自动刷新')
  }
}

onMounted(async () => {
  await load()
  startTimer()
})

onBeforeUnmount(stopTimer)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">告警实时中心</h2>
      <span class="page-desc">设备 / 环境超标告警实时监测 · 支持确认与处置</span>
      <div class="header-actions">
        <span class="refresh-time">最后刷新：{{ lastRefresh }}</span>
        <el-switch v-model="autoRefresh" active-text="自动刷新" @change="toggleAutoRefresh" />
        <el-button type="primary" plain size="small" @click="load">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="severePending"
      class="severe-alert"
      type="error"
      :closable="false"
      show-icon
      :title="`当前有 ${severePending} 条严重告警待处置，请优先处理`"
    />

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="22" color="#fff"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}<span class="stat-unit">{{ card.unit }}</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">实时告警列表</span>
          <div class="header-filters">
            <el-radio-group v-model="filterLevel" size="small">
              <el-radio-button v-for="l in levelOptions" :key="l" :value="l">{{ l }}</el-radio-button>
            </el-radio-group>
            <el-select v-model="filterStatus" size="small" clearable placeholder="全部状态" style="width: 120px">
              <el-option label="待处置" value="待处置" />
              <el-option label="已确认" value="已确认" />
              <el-option label="已处置" value="已处置" />
              <el-option label="已归档" value="已归档" />
            </el-select>
            <el-input v-model="keyword" placeholder="搜索设备 / 类型 / 编号" clearable size="small" class="search-input">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="filteredAlarms" stripe :row-class-name="({ row }) => severityClass(row.level)">
        <el-table-column prop="id" label="告警编号" width="135" />
        <el-table-column prop="device" label="告警对象" min-width="170" show-overflow-tooltip />
        <el-table-column label="园区 / 地块" min-width="190" show-overflow-tooltip>
          <template #default="{ row }">{{ row.park }} · {{ row.plot }}</template>
        </el-table-column>
        <el-table-column prop="type" label="告警类型" min-width="150" show-overflow-tooltip />
        <el-table-column label="级别" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="告警时间" width="165" />
        <el-table-column label="操作" width="185" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === '待处置'" link type="warning" size="small" @click="confirmAlarm(row)">确认</el-button>
            <el-button v-if="row.status === '已确认'" link type="success" size="small" @click="openHandle(row)">处置</el-button>
            <el-button v-if="row.status === '已处置'" link type="info" size="small" @click="archiveAlarm(row)">归档</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="detailVisible" title="告警详情" size="440px">
      <template v-if="detailAlarm">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="告警编号">{{ detailAlarm.id }}</el-descriptions-item>
          <el-descriptions-item label="告警对象">{{ detailAlarm.device }}</el-descriptions-item>
          <el-descriptions-item label="园区 / 地块">{{ detailAlarm.park }} · {{ detailAlarm.plot }}</el-descriptions-item>
          <el-descriptions-item label="告警来源">{{ detailAlarm.source }}</el-descriptions-item>
          <el-descriptions-item label="告警类型">{{ detailAlarm.type }}</el-descriptions-item>
          <el-descriptions-item label="触发规则">{{ detailAlarm.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="当前值 / 阈值">{{ detailAlarm.value }} / {{ detailAlarm.threshold }}</el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="levelType(detailAlarm.level)" size="small" effect="dark">{{ detailAlarm.level }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusType(detailAlarm.status)" size="small">{{ detailAlarm.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警时间">{{ detailAlarm.time }}</el-descriptions-item>
          <el-descriptions-item label="告警描述">{{ detailAlarm.desc }}</el-descriptions-item>
        </el-descriptions>

        <div class="flow-title">处理流程</div>
        <el-timeline class="flow-timeline">
          <el-timeline-item :timestamp="detailAlarm.time" type="danger" placement="top">告警产生（系统自动监测）</el-timeline-item>
          <el-timeline-item v-if="detailAlarm.confirmedAt" :timestamp="detailAlarm.confirmedAt" type="warning" placement="top">
            已确认 · {{ detailAlarm.confirmedBy }}
          </el-timeline-item>
          <el-timeline-item v-if="detailAlarm.handledAt" :timestamp="detailAlarm.handledAt" type="success" placement="top">
            已处置 · {{ detailAlarm.handledBy }}<br />
            <span class="flow-note">{{ detailAlarm.handleNote }}</span>
          </el-timeline-item>
          <el-timeline-item v-if="detailAlarm.archivedAt" :timestamp="detailAlarm.archivedAt" type="info" placement="top">
            已归档 · {{ detailAlarm.archivedBy }}
          </el-timeline-item>
          <el-timeline-item v-if="detailAlarm.status === '待处置' || detailAlarm.status === '已确认'" timestamp="待完成" type="primary" placement="top">
            {{ detailAlarm.status === '待处置' ? '待确认' : '待处置' }}
          </el-timeline-item>
        </el-timeline>

        <div class="drawer-actions">
          <el-button v-if="detailAlarm.status === '待处置'" type="warning" @click="confirmAlarm(detailAlarm)">确认告警</el-button>
          <el-button v-if="detailAlarm.status === '已确认'" type="success" @click="openHandle(detailAlarm)">处置告警</el-button>
          <el-button v-if="detailAlarm.status === '已处置'" type="info" @click="archiveAlarm(detailAlarm)">归档告警</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="handleVisible" title="告警处置" width="520px">
      <el-descriptions v-if="handleAlarm" :column="1" size="small" class="dialog-desc">
        <el-descriptions-item label="告警对象">{{ handleAlarm.device }}</el-descriptions-item>
        <el-descriptions-item label="告警类型">{{ handleAlarm.type }}（{{ handleAlarm.level }}）</el-descriptions-item>
        <el-descriptions-item label="当前值 / 阈值">{{ handleAlarm.value }} / {{ handleAlarm.threshold }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="90px">
        <el-form-item label="处置说明" required>
          <el-input v-model="handleNote" type="textarea" :rows="4" maxlength="120" show-word-limit placeholder="请填写处置措施与处理结果" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitHandle">提交处置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-header {
  flex-wrap: wrap;
  gap: 8px;
}

.page-desc {
  font-size: 13px;
  color: #868e96;
  margin-left: 12px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-time {
  font-size: 12px;
  color: #868e96;
}

.severe-alert {
  margin-bottom: 16px;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label {
  font-size: 13px;
  color: #868e96;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.stat-unit {
  font-size: 12px;
  color: #868e96;
  margin-left: 4px;
  font-weight: 400;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-title {
  font-weight: 600;
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
}

:deep(.level-severe) {
  background: #fff5f5;
}

.flow-title {
  font-weight: 600;
  margin: 20px 0 12px;
}

.flow-timeline {
  padding-left: 4px;
}

.flow-note {
  color: #868e96;
  font-size: 12px;
}

.drawer-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.dialog-desc {
  margin-bottom: 16px;
}
</style>
