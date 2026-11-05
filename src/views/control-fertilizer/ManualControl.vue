<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getControlDevicesApi, controlDeviceApi } from '@/api'

const loading = ref(true)
const summary = ref({ total: 0, running: 0, stopped: 0, offline: 0 })
const groups = ref([])
const filterType = ref('全部')
const keyword = ref('')
const pendingMap = ref({})

const typeOptions = ['全部', '水泵', '风机', '卷帘', '补光灯', '增氧机']

const typeIconMap = {
  水泵: 'Pouring',
  风机: 'WindPower',
  卷帘: 'Switch',
  补光灯: 'Sunny',
  增氧机: 'Ship',
}

const statCards = computed(() => [
  { label: '可控设备', value: summary.value.total, unit: '台', icon: 'Monitor', color: '#1c7ed6' },
  { label: '运行中', value: summary.value.running, unit: '台', icon: 'CircleCheck', color: '#2f9e44' },
  { label: '已停止', value: summary.value.stopped, unit: '台', icon: 'CircleClose', color: '#868e96' },
  { label: '离线', value: summary.value.offline, unit: '台', icon: 'WarningFilled', color: '#e8590c' },
])

const filteredGroups = computed(() => {
  return groups.value
    .map((g) => ({
      ...g,
      devices: g.devices.filter((d) => {
        const matchType = filterType.value === '全部' || d.type === filterType.value
        const matchKey = !keyword.value || d.name.includes(keyword.value) || d.location.includes(keyword.value)
        return matchType && matchKey
      }),
    }))
    .filter((g) => g.devices.length > 0)
})

function statusInfo(status) {
  return {
    running: { text: '运行中', type: 'success', color: '#2f9e44' },
    stopped: { text: '已停止', type: 'info', color: '#868e96' },
    offline: { text: '离线', type: 'danger', color: '#e03131' },
  }[status]
}

async function toggleDevice(device) {
  if (device.status === 'offline') {
    ElMessage.warning(`「${device.name}」当前离线，无法控制`)
    return
  }
  const action = device.status === 'running' ? 'stop' : 'start'
  const actionText = action === 'start' ? '启动' : '停止'
  try {
    await ElMessageBox.confirm(`确认${actionText}「${device.name}」？`, '设备控制确认', {
      confirmButtonText: `确认${actionText}`,
      cancelButtonText: '取消',
      type: action === 'start' ? 'success' : 'warning',
    })
  } catch {
    return
  }
  pendingMap.value[device.id] = true
  try {
    const updated = await controlDeviceApi(device.id, action)
    device.status = updated.status
    ElMessage.success(`「${device.name}」${actionText}成功`)
    refreshSummary()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    pendingMap.value[device.id] = false
  }
}

function refreshSummary() {
  const all = groups.value.flatMap((g) => g.devices)
  summary.value = {
    total: all.length,
    running: all.filter((d) => d.status === 'running').length,
    stopped: all.filter((d) => d.status === 'stopped').length,
    offline: all.filter((d) => d.status === 'offline').length,
  }
}

onMounted(async () => {
  const data = await getControlDevicesApi()
  summary.value = data.summary
  groups.value = data.groups
  loading.value = false
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">设备手动控制台</h2>
      <span class="page-desc">水泵 / 风机 / 卷帘 / 补光灯 / 增氧机 一键启停</span>
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

    <el-card shadow="never" class="filter-card">
      <div class="filter-bar">
        <el-radio-group v-model="filterType">
          <el-radio-button v-for="t in typeOptions" :key="t" :value="t">{{ t }}</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="keyword"
          placeholder="搜索设备名称 / 位置"
          clearable
          class="search-input"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </el-card>

    <div v-for="group in filteredGroups" :key="group.park" class="park-section">
      <div class="park-title">
        <el-icon color="#2f9e44"><OfficeBuilding /></el-icon>
        <span>{{ group.park }}</span>
        <span class="park-count">{{ group.devices.length }} 台设备</span>
      </div>
      <el-row :gutter="16">
        <el-col v-for="device in group.devices" :key="device.id" :xs="12" :sm="8" :md="6" :lg="4">
          <el-card shadow="hover" class="device-card" :class="{ offline: device.status === 'offline' }">
            <div class="device-head">
              <div class="device-icon" :style="{ background: statusInfo(device.status).color }">
                <el-icon :size="20" color="#fff"><component :is="typeIconMap[device.type]" /></el-icon>
              </div>
              <el-tag :type="statusInfo(device.status).type" size="small" effect="plain">
                {{ statusInfo(device.status).text }}
              </el-tag>
            </div>
            <div class="device-name">{{ device.name }}</div>
            <div class="device-meta">
              <span>{{ device.type }}</span>
              <span>{{ device.power }}kW</span>
            </div>
            <el-alert
              v-if="device.alarm"
              :title="device.alarm"
              type="warning"
              :closable="false"
              class="device-alarm"
            />
            <el-button
              :type="device.status === 'running' ? 'danger' : 'success'"
              size="small"
              class="control-btn"
              :disabled="device.status === 'offline'"
              :loading="pendingMap[device.id]"
              @click="toggleDevice(device)"
            >
              {{ device.status === 'running' ? '停止' : '启动' }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-empty v-if="!loading && filteredGroups.length === 0" description="未找到匹配的设备" />
  </div>
</template>

<style scoped>
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

.page-desc {
  font-size: 13px;
  color: #868e96;
  margin-left: 12px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search-input {
  width: 260px;
}

.park-section {
  margin-bottom: 8px;
}

.park-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 16px 0 12px;
}

.park-count {
  font-size: 12px;
  color: #868e96;
  font-weight: 400;
}

.device-card {
  margin-bottom: 16px;
}

.device-card.offline {
  opacity: 0.65;
}

.device-card :deep(.el-card__body) {
  padding: 14px;
}

.device-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.device-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #868e96;
  margin-bottom: 10px;
}

.device-alarm {
  margin-bottom: 10px;
  padding: 2px 8px;
}

.control-btn {
  width: 100%;
}
</style>
