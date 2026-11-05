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
  { title: '新增用户', desc: '用户与角色管理', icon: 'UserFilled', path: '/system/users', color: '#16a34a' },
  { title: '角色权限', desc: 'RBAC 权限配置', icon: 'Lock', path: '/system/permission', color: '#2563eb' },
  { title: '日志审计', desc: '登录与操作日志', icon: 'Document', path: '/system/logs', color: '#f59e0b' },
  { title: '租户管理', desc: '资源配额与到期', icon: 'OfficeBuilding', path: '/system/tenants', color: '#7c3aed' },
]

const greeting = computedGreeting()

function computedGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const todayText = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

async function loadData() {
  loading.value = true
  const data = await getDashboardApi()
  stats.value = data.stats
  todos.value = data.todos
  alarms.value = data.alarms
  statCards.value = [
    { label: '园区数量', value: data.stats.parkCount, unit: '个', icon: 'OfficeBuilding', color: '#16a34a', bg: '#e6f5ec' },
    { label: '种植面积', value: data.stats.area.toLocaleString(), unit: '亩', icon: 'Crop', color: '#2563eb', bg: '#e8f0fe' },
    { label: '设备在线率', value: data.stats.deviceOnlineRate, unit: '%', icon: 'Monitor', color: '#7c3aed', bg: '#f1ebfe' },
    { label: '待处理告警', value: data.stats.alarmCount, unit: '条', icon: 'Bell', color: '#e8590c', bg: '#fdece3' },
    { label: '累计产量', value: (data.stats.totalYield / 1000).toFixed(1), unit: '吨', icon: 'DataLine', color: '#f59e0b', bg: '#fdf3e0' },
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
    <!-- 欢迎横幅 -->
    <section class="hero">
      <div class="hero-text">
        <h2 class="hero-title">{{ greeting }}，{{ auth.userInfo?.name }}</h2>
        <p class="hero-sub">今天是 {{ todayText }}，祝工作顺利。园区运行平稳，{{ stats?.alarmCount || 0 }} 条告警待处理。</p>
      </div>
      <div class="hero-badge">
        <el-icon :size="40"><Crop /></el-icon>
      </div>
    </section>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="8" :md="8" :lg="4.8">
        <div class="stat-card">
          <div class="stat-icon" :style="{ color: card.color, background: card.bg }">
            <el-icon :size="24"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">
              {{ card.value }}<span class="stat-unit">{{ card.unit }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 待办 & 告警 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-head">
              <span class="panel-title">待办事项</span>
              <el-tag size="small" round type="success">{{ todos.length }}</el-tag>
            </div>
          </template>
          <el-empty v-if="!todos.length" description="暂无待办" :image-size="80" />
          <ul v-else class="todo-list">
            <li v-for="item in todos" :key="item.id" class="todo-item">
              <el-tag :type="levelMap[item.level]" size="small" effect="light">{{ levelText[item.level] }}</el-tag>
              <span class="todo-text">{{ item.title }}</span>
              <span class="todo-time">{{ item.time }}</span>
            </li>
          </ul>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="panel">
          <template #header>
            <div class="panel-head">
              <span class="panel-title">最新告警</span>
              <el-tag size="small" round type="danger">{{ alarms.length }}</el-tag>
            </div>
          </template>
          <el-table :data="alarms" size="small">
            <el-table-column prop="device" label="设备" min-width="130" />
            <el-table-column prop="type" label="告警类型" min-width="110" />
            <el-table-column label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="alarmLevelMap[row.level]" size="small" effect="light">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="alarmStatusMap[row.status]" size="small" effect="light">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" min-width="150" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card shadow="never" class="panel">
      <template #header>
        <span class="panel-title">快捷操作</span>
      </template>
      <div class="quick-grid">
        <div v-for="action in quickActions" :key="action.title" class="quick-item" @click="goTo(action.path)">
          <div class="quick-icon" :style="{ color: action.color, background: action.color + '1a' }">
            <el-icon :size="24"><component :is="action.icon" /></el-icon>
          </div>
          <div class="quick-title">{{ action.title }}</div>
          <div class="quick-desc">{{ action.desc }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 欢迎横幅 */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 28px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(120deg, #16a34a 0%, #0f8f4f 55%, #0c7a43 100%);
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.22);
}

.hero-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.hero-sub {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.86);
}

.hero-badge {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
  background: rgba(255, 255, 255, 0.95);
}

/* 统计卡片 */
.stat-row {
  margin: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: transform 0.18s, box-shadow 0.18s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
}

.stat-label {
  font-size: 13px;
  color: var(--samp-text-secondary);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--samp-text-main);
  line-height: 1.2;
}

.stat-unit {
  font-size: 12px;
  font-weight: 400;
  color: var(--samp-text-secondary);
  margin-left: 4px;
}

.panel {
  margin-bottom: 0;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 11px 0;
  border-bottom: 1px dashed var(--samp-border);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-text {
  flex: 1;
  color: var(--samp-text-main);
  font-size: 14px;
}

.todo-time {
  font-size: 12px;
  color: var(--samp-text-secondary);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.quick-item {
  padding: 20px 18px;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.18s;
  background: #fff;
}

.quick-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.1);
  transform: translateY(-2px);
}

.quick-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.quick-title {
  font-weight: 600;
  color: var(--samp-text-main);
}

.quick-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--samp-text-secondary);
}
</style>