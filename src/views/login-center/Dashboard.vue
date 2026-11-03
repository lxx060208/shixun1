<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const stats = ref(null)
const todos = ref([])
const alarms = ref([])

const statCards = ref([])

const levelMap = { high: 'danger', medium: 'warning', low: 'info' }
const levelText = { high: '高', medium: '中', low: '低' }
const alarmLevelMap = { 严重: 'danger', 警告: 'warning', 提示: 'info' }
const alarmStatusMap = { 待处置: 'danger', 已确认: 'warning', 已处置: 'success' }

const quickActions = [
  { title: '新增用户', desc: '用户与角色管理', icon: 'UserFilled', path: '/system/users', color: '#2f9e44' },
  { title: '角色权限', desc: 'RBAC 权限配置', icon: 'Lock', path: '/system/permission', color: '#1c7ed6' },
  { title: '日志审计', desc: '登录与操作日志', icon: 'Document', path: '/system/logs', color: '#f59f00' },
  { title: '租户管理', desc: '资源配额与到期', icon: 'OfficeBuilding', path: '/system/tenants', color: '#7048e8' },
]

async function loadData() {
  loading.value = true
  const data = await getDashboardApi()
  stats.value = data.stats
  todos.value = data.todos
  alarms.value = data.alarms
  statCards.value = [
    { label: '园区数量', value: data.stats.parkCount, unit: '个', icon: 'OfficeBuilding', color: '#2f9e44' },
    { label: '种植面积', value: data.stats.area.toLocaleString(), unit: '亩', icon: 'Crop', color: '#1c7ed6' },
    { label: '设备在线率', value: data.stats.deviceOnlineRate, unit: '%', icon: 'Monitor', color: '#7048e8' },
    { label: '待处理告警', value: data.stats.alarmCount, unit: '条', icon: 'Bell', color: '#e8590c' },
    { label: '累计产量', value: (data.stats.totalYield / 1000).toFixed(1), unit: '吨', icon: 'DataLine', color: '#f59f00' },
  ]
  loading.value = false
}

function goTo(path) {
  router.push(path)
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <div class="welcome">
      <div>
        <h2 class="welcome-title">你好，{{ auth.userInfo?.name }}，欢迎回来！</h2>
        <p class="welcome-sub">今天是 {{ new Date().toLocaleDateString('zh-CN') }}，祝你工作顺利。</p>
      </div>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="12" :md="8" :lg="4.8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="22" color="#fff"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">
              {{ card.value }}<span class="stat-unit">{{ card.unit }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel">
          <template #header>
            <span class="panel-title">待办事项</span>
          </template>
          <el-empty v-if="!todos.length" description="暂无待办" :image-size="80" />
          <ul v-else class="todo-list">
            <li v-for="item in todos" :key="item.id" class="todo-item">
              <el-tag :type="levelMap[item.level]" size="small">{{ levelText[item.level] }}</el-tag>
              <span class="todo-text">{{ item.title }}</span>
              <span class="todo-time">{{ item.time }}</span>
            </li>
          </ul>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel">
          <template #header>
            <span class="panel-title">最新告警</span>
          </template>
          <el-table :data="alarms" size="small">
            <el-table-column prop="device" label="设备" min-width="130" />
            <el-table-column prop="type" label="告警类型" min-width="110" />
            <el-table-column label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="alarmLevelMap[row.level]" size="small">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="alarmStatusMap[row.status]" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" min-width="150" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="panel quick-card">
      <template #header>
        <span class="panel-title">快捷操作</span>
      </template>
      <div class="quick-grid">
        <div v-for="action in quickActions" :key="action.title" class="quick-item" @click="goTo(action.path)">
          <el-icon :size="26" :color="action.color"><component :is="action.icon" /></el-icon>
          <div class="quick-title">{{ action.title }}</div>
          <div class="quick-desc">{{ action.desc }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.welcome {
  margin-bottom: 16px;
}

.welcome-title {
  margin: 0;
  font-size: 20px;
  color: #1f2d3d;
}

.welcome-sub {
  margin: 6px 0 0;
  color: #86998f;
}

.stat-row {
  margin-bottom: 4px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
}

.stat-label {
  font-size: 13px;
  color: #86998f;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.stat-unit {
  font-size: 12px;
  font-weight: 400;
  color: #86998f;
  margin-left: 4px;
}

.panel {
  margin-bottom: 16px;
}

.panel-title {
  font-weight: 600;
  color: #1f2d3d;
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed #eef2ef;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-text {
  flex: 1;
  color: #303133;
}

.todo-time {
  font-size: 12px;
  color: #a0aca5;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.quick-item {
  padding: 18px 16px;
  border: 1px solid #e6ebe8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 14px rgba(47, 158, 68, 0.12);
}

.quick-title {
  margin-top: 10px;
  font-weight: 600;
  color: #1f2d3d;
}

.quick-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #a0aca5;
}
</style>