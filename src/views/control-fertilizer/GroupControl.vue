<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getControlGroupsApi, toggleGroupLockApi, groupControlApi } from '@/api'

const loading = ref(true)
const groups = ref([])
const filterType = ref('全部')
const pendingMap = ref({})

const filteredGroups = computed(() => {
  if (filterType.value === '全部') return groups.value
  return groups.value.filter((g) => g.type === filterType.value)
})

const statCards = computed(() => [
  { label: '控制分组', value: groups.value.length, unit: '个', icon: 'Grid', color: '#1c7ed6' },
  { label: '覆盖设备', value: groups.value.reduce((s, g) => s + g.deviceCount, 0), unit: '台', icon: 'Monitor', color: '#2f9e44' },
  { label: '已上锁', value: groups.value.filter((g) => g.locked).length, unit: '个', icon: 'Lock', color: '#e8590c' },
])

async function toggleLock(group) {
  const actionText = group.locked ? '解锁' : '上锁'
  try {
    await ElMessageBox.confirm(
      group.locked
        ? `确认解锁「${group.name}」？解锁后可执行批量控制。`
        : `确认上锁「${group.name}」？上锁后该分组禁止批量操作。`,
      '安全锁确认',
      { confirmButtonText: actionText, cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await toggleGroupLockApi(group.id, !group.locked)
    group.locked = !group.locked
    if (!group.locked) group.lockReason = ''
    ElMessage.success(`「${group.name}」已${actionText}`)
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function batchControl(group, action) {
  if (group.locked) {
    ElMessage.warning(`「${group.name}」已上锁，禁止批量操作`)
    return
  }
  const actionText = action === 'start' ? '批量开启' : '批量关闭'
  try {
    await ElMessageBox.confirm(
      `确认对「${group.name}」执行${actionText}？将影响 ${group.deviceCount} 台设备。`,
      '批量控制确认',
      { confirmButtonText: actionText, cancelButtonText: '取消', type: action === 'start' ? 'success' : 'warning' }
    )
  } catch {
    return
  }
  pendingMap.value[`${group.id}-${action}`] = true
  try {
    const res = await groupControlApi(group.id, action)
    ElMessage.success(`「${group.name}」${actionText}成功，共 ${res.affected} 台设备`)
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    pendingMap.value[`${group.id}-${action}`] = false
  }
}

onMounted(async () => {
  groups.value = await getControlGroupsApi()
  loading.value = false
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">分组控制</h2>
      <span class="page-desc">按大棚 / 地块批量控制，安全锁防止误操作</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="8">
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
      <el-radio-group v-model="filterType">
        <el-radio-button value="全部">全部分组</el-radio-button>
        <el-radio-button value="大棚">按大棚</el-radio-button>
        <el-radio-button value="地块">按地块</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-row :gutter="16">
      <el-col v-for="group in filteredGroups" :key="group.id" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="group-card" :class="{ locked: group.locked }">
          <div class="group-head">
            <div class="group-title">
              <el-icon :size="18" :color="group.locked ? '#e8590c' : '#1c7ed6'">
                <component :is="group.locked ? 'Lock' : 'Grid'" />
              </el-icon>
              <span class="group-name">{{ group.name }}</span>
            </div>
            <el-tag size="small" :type="group.type === '大棚' ? 'primary' : 'success'" effect="plain">
              {{ group.type }}
            </el-tag>
          </div>

          <div class="group-info">
            <span>{{ group.deviceCount }} 台设备</span>
            <el-tag v-if="group.locked" type="danger" size="small">已上锁</el-tag>
            <el-tag v-else type="success" size="small" effect="plain">可操作</el-tag>
          </div>

          <el-alert
            v-if="group.locked && group.lockReason"
            :title="group.lockReason"
            type="warning"
            :closable="false"
            class="lock-alert"
          />

          <div class="group-devices">
            <el-tag
              v-for="d in group.devices"
              :key="d"
              size="small"
              effect="plain"
              class="device-tag"
            >
              {{ d }}
            </el-tag>
          </div>

          <div class="group-actions">
            <el-button
              type="success"
              size="small"
              :disabled="group.locked"
              :loading="pendingMap[`${group.id}-start`]"
              @click="batchControl(group, 'start')"
            >
              批量开启
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="group.locked"
              :loading="pendingMap[`${group.id}-stop`]"
              @click="batchControl(group, 'stop')"
            >
              批量关闭
            </el-button>
            <el-button
              :type="group.locked ? 'warning' : 'info'"
              size="small"
              plain
              @click="toggleLock(group)"
            >
              {{ group.locked ? '解锁' : '上锁' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
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

.group-card {
  margin-bottom: 16px;
}

.group-card.locked {
  border-color: #ffd8a8;
  background: #fffaf5;
}

.group-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.group-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #868e96;
  margin-bottom: 10px;
}

.lock-alert {
  margin-bottom: 10px;
  padding: 4px 8px;
}

.group-devices {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 52px;
  margin-bottom: 12px;
}

.device-tag {
  font-size: 12px;
}

.group-actions {
  display: flex;
  gap: 8px;
}

.group-actions .el-button {
  flex: 1;
  margin-left: 0;
}
</style>
