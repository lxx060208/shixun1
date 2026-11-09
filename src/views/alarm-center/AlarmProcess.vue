<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getAlarmFlowApi, confirmAlarmApi, handleAlarmApi, archiveAlarmApi } from '@/api'

const auth = useAuthStore()
const loading = ref(true)
const alarms = ref([])
const records = ref([])
const stats = ref({})
const filterStatus = ref('全部')
const selectedId = ref('')

const handleVisible = ref(false)
const handleAlarm = ref(null)
const handleNote = ref('')
const submitting = ref(false)

const statusOptions = ['全部', '待处置', '已确认', '已处置', '已归档']
const operator = computed(() => auth.userInfo?.name || '系统管理员')

const filteredAlarms = computed(() =>
  alarms.value.filter((a) => filterStatus.value === '全部' || a.status === filterStatus.value),
)

const selected = computed(() => filteredAlarms.value.find((a) => a.id === selectedId.value) || filteredAlarms.value[0] || null)

const selectedRecords = computed(() =>
  records.value.filter((r) => r.alarmId === selected.value?.id).sort((a, b) => (a.time > b.time ? 1 : -1)),
)

const allRecords = computed(() => records.value.slice().sort((a, b) => (a.time > b.time ? -1 : 1)))

const stepActive = computed(() => {
  const map = { 待处置: 1, 已确认: 2, 已处置: 3, 已归档: 4 }
  return map[selected.value?.status] ?? 0
})

const statCards = computed(() => [
  { label: '待处置', value: stats.value.pending || 0, unit: '条', icon: 'WarningFilled', color: '#e03131' },
  { label: '已确认', value: stats.value.confirmed || 0, unit: '条', icon: 'CircleCheck', color: '#f59f00' },
  { label: '已处置', value: stats.value.handled || 0, unit: '条', icon: 'Checked', color: '#2f9e44' },
  { label: '已归档', value: stats.value.archived || 0, unit: '条', icon: 'FolderOpened', color: '#1c7ed6' },
])

function levelType(level) {
  return { 严重: 'danger', 警告: 'warning', 提示: 'info' }[level] || 'info'
}

function statusType(status) {
  return { 待处置: 'danger', 已确认: 'warning', 已处置: 'success', 已归档: 'info' }[status] || 'info'
}

function nodeType(node) {
  return { 告警产生: 'danger', 确认: 'warning', 处置: 'success', 归档: 'info' }[node] || 'primary'
}

function selectAlarm(row) {
  selectedId.value = row.id
}

async function load() {
  try {
    const res = await getAlarmFlowApi()
    alarms.value = res.list
    records.value = res.records
    stats.value = res.stats
    if (!alarms.value.some((a) => a.id === selectedId.value)) selectedId.value = res.list[0]?.id || ''
  } catch (e) {
    ElMessage.error(e.message || '加载告警流程失败')
  } finally {
    loading.value = false
  }
}

async function confirmAlarm() {
  const alarm = selected.value
  await ElMessageBox.confirm(`确认告警「${alarm.device} · ${alarm.type}」？`, '确认告警', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await confirmAlarmApi(alarm.id, operator.value)
    ElMessage.success('告警已确认')
    await load()
  } catch (e) {
    ElMessage.error(e.message || '确认失败')
  }
}

function openHandle() {
  handleAlarm.value = selected.value
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
  } catch (e) {
    ElMessage.error(e.message || '处置失败')
  } finally {
    submitting.value = false
  }
}

async function archiveAlarm() {
  const alarm = selected.value
  await ElMessageBox.confirm(`确认归档告警「${alarm.device} · ${alarm.type}」？归档后进入历史记录。`, '归档告警', {
    confirmButtonText: '归档',
    cancelButtonText: '取消',
    type: 'info',
  })
  try {
    await archiveAlarmApi(alarm.id, operator.value)
    ElMessage.success('告警已归档')
    await load()
  } catch (e) {
    ElMessage.error(e.message || '归档失败')
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">告警处理流程</h2>
      <span class="page-desc">查看 → 确认 → 处置 → 归档 · 告警闭环管理</span>
    </div>

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

    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-header">
          <span class="table-title">待办告警队列</span>
          <el-radio-group v-model="filterStatus" size="small">
            <el-radio-button v-for="s in statusOptions" :key="s" :value="s">{{ s }}</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-table :data="filteredAlarms" stripe highlight-current-row @row-click="selectAlarm">
        <el-table-column prop="id" label="告警编号" width="135" />
        <el-table-column prop="device" label="告警对象" min-width="170" show-overflow-tooltip />
        <el-table-column prop="type" label="告警类型" min-width="150" show-overflow-tooltip />
        <el-table-column label="级别" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前节点" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="告警时间" width="165" />
        <el-table-column label="操作" width="90" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="selectAlarm(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :md="14">
        <el-card shadow="never" class="block detail-card">
          <template #header>
            <div class="card-header">
              <span class="table-title">流程节点</span>
              <span v-if="selected" class="detail-alarm">{{ selected.device }} · {{ selected.type }}</span>
            </div>
          </template>
          <template v-if="selected">
            <el-steps :active="stepActive" finish-status="success" process-status="process" align-center class="steps">
              <el-step title="告警产生" :description="selected.time" />
              <el-step title="确认" :description="selected.confirmedAt || '待确认'" />
              <el-step title="处置" :description="selected.handledAt || '待处置'" />
              <el-step title="归档" :description="selected.archivedAt || '待归档'" />
            </el-steps>
            <el-descriptions :column="2" border size="small" class="detail-desc">
              <el-descriptions-item label="告警编号">{{ selected.id }}</el-descriptions-item>
              <el-descriptions-item label="园区 / 地块">{{ selected.park }} · {{ selected.plot }}</el-descriptions-item>
              <el-descriptions-item label="当前值 / 阈值">{{ selected.value }} / {{ selected.threshold }}</el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="statusType(selected.status)" size="small">{{ selected.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="告警描述" :span="2">{{ selected.desc }}</el-descriptions-item>
            </el-descriptions>
            <div class="flow-actions">
              <el-button v-if="selected.status === '待处置'" type="warning" @click="confirmAlarm">确认告警</el-button>
              <el-button v-if="selected.status === '已确认'" type="success" @click="openHandle">处置告警</el-button>
              <el-button v-if="selected.status === '已处置'" type="info" @click="archiveAlarm">归档告警</el-button>
              <el-button v-if="selected.status === '已归档'" type="primary" plain disabled>流程已闭环</el-button>
            </div>
          </template>
          <el-empty v-else description="请选择告警记录" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card shadow="never" class="block detail-card">
          <template #header><span class="table-title">流转记录</span></template>
          <el-timeline v-if="selectedRecords.length" class="timeline">
            <el-timeline-item
              v-for="r in selectedRecords"
              :key="r.id"
              :timestamp="`${r.time} · ${r.node}`"
              :type="nodeType(r.node)"
              placement="top"
            >
              <div class="node-operator">{{ r.operator }}<span class="node-role">{{ r.role }}</span></div>
              <div class="node-remark">{{ r.remark }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无流转记录" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span class="table-title">全流程流转台账</span></template>
      <el-table :data="allRecords" stripe max-height="360">
        <el-table-column prop="time" label="时间" width="165" />
        <el-table-column prop="alarmId" label="告警编号" width="135" />
        <el-table-column prop="device" label="告警对象" min-width="170" show-overflow-tooltip />
        <el-table-column label="节点" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="nodeType(row.node)" size="small" effect="plain">{{ row.node }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="role" label="角色" width="110" />
        <el-table-column prop="remark" label="说明" min-width="220" show-overflow-tooltip />
      </el-table>
    </el-card>

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
.page-desc {
  font-size: 13px;
  color: #868e96;
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

.block {
  margin-bottom: 16px;
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

.detail-alarm {
  font-size: 12px;
  color: #868e96;
}

.steps {
  margin: 8px 0 20px;
}

.detail-desc {
  margin-bottom: 16px;
}

.flow-actions {
  display: flex;
  gap: 10px;
}

.timeline {
  padding-left: 4px;
  max-height: 420px;
  overflow-y: auto;
}

.node-operator {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.node-role {
  font-size: 12px;
  color: #868e96;
  margin-left: 8px;
  font-weight: 400;
}

.node-remark {
  font-size: 13px;
  color: #495057;
  margin-top: 4px;
  line-height: 1.5;
}

.dialog-desc {
  margin-bottom: 16px;
}
</style>
