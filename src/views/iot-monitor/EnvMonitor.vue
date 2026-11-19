<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOverviewApi, parks } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const router = useRouter()

const loading = ref(true)
const data = ref(null)
const currentPark = ref('all')

// 实时时钟：数据更新时间每秒跳动，配合呼吸灯营造实时感
const liveTime = ref(new Date())
let clockTimer = 0

// KPI 数字滚动动画：数据到达后从 0（或上一次值）平滑递增到目标值
const displayStats = reactive({ totalDevices: 0, online: 0, offline: 0, onlineRate: 0, alarmCount: 0 })
let statsRaf = 0

function animateStats() {
  cancelAnimationFrame(statsRaf)
  if (!data.value) return
  const targets = {
    totalDevices: Number(data.value.stats.totalDevices) || 0,
    online: Number(data.value.stats.online) || 0,
    offline: Number(data.value.stats.offline) || 0,
    onlineRate: Number(data.value.stats.onlineRate) || 0,
    alarmCount: Number(data.value.stats.alarmCount) || 0,
  }
  const from = { ...displayStats }
  const duration = 900
  const startAt = performance.now()
  const easeOut = (t) => 1 - Math.pow(1 - t, 3)
  const step = (now) => {
    const p = Math.min(1, (now - startAt) / duration)
    const k = easeOut(p)
    Object.keys(targets).forEach((key) => {
      const v = from[key] + (targets[key] - from[key]) * k
      displayStats[key] = key === 'onlineRate' ? Number(v.toFixed(1)) : Math.round(v)
    })
    if (p < 1) statsRaf = requestAnimationFrame(step)
  }
  statsRaf = requestAnimationFrame(step)
}

const currentParkName = computed(() => parks.find((p) => p.id === currentPark.value)?.name || '全部园区')

const detailRoutes = {
  air: '/iot-monitor/collection?type=air',
  soil: '/iot-monitor/soil',
  water: '/iot-monitor/water',
  weather: '/iot-monitor/weather',
}

function goDetail(key) {
  if (detailRoutes[key]) router.push(detailRoutes[key])
}

async function load() {
  loading.value = true
  data.value = await getOverviewApi(currentPark.value)
  loading.value = false
  animateStats()
}

function onParkChange() {
  load()
  ElMessage.success('已切换园区')
}

function refresh() {
  load()
  ElMessage.success('已刷新实时监测数据')
}

function statusType(s) {
  return s === 'warn' ? 'warning' : 'success'
}

function deviceStatusType(s) {
  return s === 'online' ? 'success' : 'info'
}

onMounted(() => {
  load()
  clockTimer = setInterval(() => {
    liveTime.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  cancelAnimationFrame(statsRaf)
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">环境监测总览</h3>
        <p class="page-subtitle">空气 · 土壤 · 水体 · 气象多维数据实时汇总</p>
      </div>
      <div class="header-actions">
        <span class="live-badge"><i class="live-dot" />实时监测 {{ liveTime.toLocaleTimeString('zh-CN') }}</span>
        <el-button :icon="'Refresh'" @click="refresh">刷新数据</el-button>
      </div>
    </div>

    <div class="park-bar">
      <span class="park-bar-label">园区切换</span>
      <el-radio-group v-model="currentPark" @change="onParkChange">
        <el-radio-button v-for="p in parks" :key="p.id" :value="p.id">{{ p.name }}</el-radio-button>
      </el-radio-group>
    </div>

    <template v-if="data">
      <!-- 设备概况 -->
      <el-row :gutter="16" class="kpi-row">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card">
            <span class="kpi-label">设备总数</span>
            <span class="kpi-value">{{ displayStats.totalDevices }}</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">在线</span><span class="kpi-value green">{{ displayStats.online }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">掉线</span><span class="kpi-value red">{{ displayStats.offline }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">在线率</span><span class="kpi-value">{{ displayStats.onlineRate }}%</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">待处置告警</span><span class="kpi-value orange">{{ displayStats.alarmCount }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card">
            <span class="kpi-label">数据更新时间</span>
            <span class="kpi-time">{{ liveTime.toLocaleTimeString('zh-CN') }}</span>
          </div>
        </el-col>
      </el-row>

      <!-- 设备列表 -->
      <el-card shadow="never" class="device-card">
        <template #header>
          <div class="card-head">
            <div>
              <span class="panel-title">园区设备</span>
              <p class="card-sub">{{ currentParkName }} · 共 {{ data.devices.length }} 台设备</p>
            </div>
          </div>
        </template>
        <el-table :data="data.devices" stripe style="width: 100%">
          <el-table-column prop="name" label="设备名称" min-width="140" />
          <el-table-column prop="typeName" label="类型" width="90" />
          <el-table-column prop="location" label="安装位置" min-width="130" />
          <el-table-column prop="parkName" label="所属园区" min-width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <span class="status-cell">
                <i class="status-dot" :class="row.status" />
                <el-tag :type="deviceStatusType(row.status)" effect="light">{{ row.status === 'online' ? '在线' : '掉线' }}</el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="lastOnline" label="最近在线" min-width="150" />
        </el-table>
      </el-card>

      <!-- 分类指标卡片 -->
      <el-row :gutter="16">
        <el-col v-for="(cat, i) in data.categories" :key="cat.key" :xs="24" :sm="12" :lg="6">
          <el-card shadow="never" class="cat-card clickable" :style="{ animationDelay: `${i * 70}ms` }" @click="goDetail(cat.key)">
            <div class="cat-head">
              <div class="cat-icon" :style="{ color: cat.color, background: cat.color + '1a' }">
                <el-icon :size="20"><component :is="cat.icon" /></el-icon>
              </div>
              <span class="cat-name">{{ cat.name }}</span>
            </div>
            <ul class="metric-list">
              <li v-for="m in cat.metrics" :key="m.label" class="metric-item">
                <span class="metric-label">
                  <i class="dot" :class="m.status" />
                  {{ m.label }}
                </span>
                <span class="metric-value">
                  <b :class="{ 'warn-text': m.status === 'warn' }">{{ m.value }}</b>
                  <em v-if="m.unit">{{ m.unit }}</em>
                </span>
              </li>
            </ul>
            <div class="cat-foot">
              <span>查看详情</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 24 小时趋势 -->
      <el-card shadow="never" class="trend-card">
        <template #header>
          <div class="card-head">
            <div>
              <span class="panel-title">最近 24 小时趋势</span>
              <p class="card-sub">{{ currentParkName }} · 监测指标趋势</p>
            </div>
            <div class="legend">
              <span v-for="s in data.trend.series" :key="s.name" class="legend-item">
                <i :style="{ background: s.color }" />{{ s.name }}
              </span>
            </div>
          </div>
        </template>
        <TrendChart :labels="data.trend.labels" :series="data.trend.series" :height="260" />
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 实时监测呼吸灯徽标 */
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  font-variant-numeric: tabular-nums;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  animation: livePulse 1.6s infinite;
}

@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
}

.park-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.park-bar-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--samp-text-secondary);
  white-space: nowrap;
}

.device-card {
  margin-bottom: 16px;
  animation: riseIn 0.45s ease backwards;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.kpi-row {
  margin-bottom: 4px;
}

.kpi-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 16px;
  margin-bottom: 16px;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  border-top: 4px solid #16a34a;
  background: linear-gradient(160deg, #f0fdf4 0%, #ffffff 70%);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  animation: riseIn 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

/* 卡片悬停光扫动效 */
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  transform: skewX(-18deg);
  opacity: 0;
  pointer-events: none;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.12);
}

.kpi-card:hover::before {
  animation: cardSweep 0.8s ease;
}

@keyframes cardSweep {
  from { left: -80%; opacity: 0.9; }
  to { left: 130%; opacity: 0; }
}

/* KPI 依次错落入场 */
.kpi-row > .el-col:nth-child(1) .kpi-card { border-top-color: #16a34a; background: linear-gradient(160deg, #f0fdf4 0%, #fff 70%); animation-delay: 0ms; }
.kpi-row > .el-col:nth-child(2) .kpi-card { border-top-color: #2563eb; background: linear-gradient(160deg, #eff6ff 0%, #fff 70%); animation-delay: 60ms; }
.kpi-row > .el-col:nth-child(3) .kpi-card { border-top-color: #e11d48; background: linear-gradient(160deg, #fff1f2 0%, #fff 70%); animation-delay: 120ms; }
.kpi-row > .el-col:nth-child(4) .kpi-card { border-top-color: #7c3aed; background: linear-gradient(160deg, #f5f3ff 0%, #fff 70%); animation-delay: 180ms; }
.kpi-row > .el-col:nth-child(5) .kpi-card { border-top-color: #f59e0b; background: linear-gradient(160deg, #fffbeb 0%, #fff 70%); animation-delay: 240ms; }
.kpi-row > .el-col:nth-child(6) .kpi-card { border-top-color: #0891b2; background: linear-gradient(160deg, #ecfeff 0%, #fff 70%); animation-delay: 300ms; }

.kpi-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--samp-text-secondary);
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--samp-text-main);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}
.kpi-value.green { color: #16a34a; }
.kpi-value.red { color: #e11d48; }
.kpi-value.orange { color: #f59e0b; }

.kpi-time {
  font-size: 16px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.cat-card {
  margin-bottom: 16px;
  border-top: 3px solid var(--samp-border);
  animation: riseIn 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards;
}

.cat-card.clickable {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}

/* 悬停时扫过一道高光 */
.cat-card.clickable::after {
  content: '';
  position: absolute;
  top: 0;
  left: -120%;
  width: 55%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(22, 163, 74, 0.12), transparent);
  transform: skewX(-16deg);
  transition: left 0.55s ease;
  pointer-events: none;
}

.cat-card.clickable:hover::after {
  left: 130%;
}

.cat-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
  border-color: var(--el-color-primary);
}

.cat-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--samp-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.cat-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.cat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: iconFloat 3.6s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.cat-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.metric-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed var(--samp-border);
}
.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--samp-text-secondary);
}

.dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  color: #16a34a;
  background: currentColor;
}
.dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid currentColor;
  opacity: 0.5;
  animation: dotPulse 1.8s ease-out infinite;
}
.dot.warn {
  color: #f59e0b;
}

@keyframes dotPulse {
  0% { transform: scale(0.7); opacity: 0.7; }
  100% { transform: scale(1.7); opacity: 0; }
}

.metric-value {
  font-size: 15px;
  color: var(--samp-text-main);
}
.metric-value b {
  font-size: 20px;
}
.metric-value .warn-text {
  color: #d97706;
  animation: warnBlink 1.8s ease-in-out infinite;
}

@keyframes warnBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* 设备在线状态灯 */
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #adb5bd;
}

.status-dot.online {
  background: #16a34a;
  animation: statusBreath 1.8s ease-in-out infinite;
}

@keyframes statusBreath {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.5); }
  50% { box-shadow: 0 0 0 5px rgba(22, 163, 74, 0); }
}
.metric-value em {
  font-style: normal;
  font-size: 12px;
  color: var(--samp-text-secondary);
  margin-left: 3px;
}

.trend-card {
  margin-bottom: 16px;
  animation: riseIn 0.5s 0.2s ease backwards;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .kpi-card,
  .cat-card,
  .cat-icon,
  .device-card,
  .trend-card,
  .live-dot,
  .dot::after,
  .status-dot.online,
  .metric-value .warn-text {
    animation: none !important;
  }
  .kpi-card,
  .cat-card.clickable {
    transition: none !important;
  }
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.card-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--samp-text-secondary);
  font-weight: 400;
}

.legend {
  display: flex;
  align-items: center;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--samp-text-secondary);
}
.legend-item i {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}
</style>