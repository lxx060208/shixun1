<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getRealtimeMetricsApi } from '@/api'

const loading = ref(true)
const activeTab = ref('air')
const lastUpdate = ref(new Date())

const airMetrics = ref([])
const soilMetrics = ref([])
const waterMetrics = ref([])

const metricMap = { air: airMetrics, soil: soilMetrics, water: waterMetrics }
const currentMetrics = computed(() => metricMap[activeTab.value].value)

function statusOf(m) {
  if (m.value >= m.min && m.value <= m.max) return { text: '正常', type: 'success' }
  return { text: '异常', type: 'danger' }
}

const chartRef = ref(null)
let chart = null
let timer = null
const history = []

function genHistory() {
  const base = { air: 24.6, soil: 41, water: 7.8 }
  for (let i = 29; i >= 0; i--) {
    const t = new Date(Date.now() - i * 60000)
    history.push({
      time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
      air: +(base.air + (Math.random() - 0.5) * 3).toFixed(1),
      soil: +(base.soil + (Math.random() - 0.5) * 6).toFixed(1),
      water: +(base.water + (Math.random() - 0.5) * 1).toFixed(1),
    })
  }
}

function renderChart() {
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const conf = {
    air: { name: '空气温度(℃)', key: 'air', color: '#e8590c' },
    soil: { name: '土壤湿度(%)', key: 'soil', color: '#1c7ed6' },
    water: { name: '溶解氧(mg/L)', key: 'water', color: '#0ca678' },
  }[activeTab.value]
  chart.setOption({
    title: { text: `${conf.name} · 近30分钟实时曲线`, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: history.map((h) => h.time) },
    yAxis: { type: 'value', scale: true },
    series: [{ type: 'line', name: conf.name, data: history.map((h) => h[conf.key]), smooth: true, showSymbol: false, areaStyle: { opacity: 0.15 }, itemStyle: { color: conf.color } }],
  })
}

function tick() {
  const t = new Date()
  history.push({
    time: `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`,
    air: +(24.6 + (Math.random() - 0.5) * 3).toFixed(1),
    soil: +(41 + (Math.random() - 0.5) * 6).toFixed(1),
    water: +(7.8 + (Math.random() - 0.5) * 1).toFixed(1),
  })
  if (history.length > 30) history.shift()
  // 模拟数值小幅波动
  const jitter = (v, amp, digits = 1) => +(v + (Math.random() - 0.5) * amp).toFixed(digits)
  airMetrics.value.forEach((m) => { m.value = jitter(m.value, m.key === 'co2' ? 30 : 1.2, m.key === 'co2' ? 0 : 1) })
  soilMetrics.value.forEach((m) => { m.value = jitter(m.value, 0.6, m.key === 'ph' || m.key === 'ec' ? 2 : 1) })
  waterMetrics.value.forEach((m) => { m.value = jitter(m.value, 0.4, m.key === 'waterPh' ? 2 : 1) })
  lastUpdate.value = t
  renderChart()
}

function handleResize() {
  chart?.resize()
}

onMounted(async () => {
  const data = await getRealtimeMetricsApi()
  airMetrics.value = data.air
  soilMetrics.value = data.soil
  waterMetrics.value = data.water
  loading.value = false
  genHistory()
  renderChart()
  timer = setInterval(tick, 5000)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

function onTabChange() {
  renderChart()
}
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">实时环境数据</h2>
      <span class="update-time">最近更新：{{ lastUpdate.toLocaleTimeString('zh-CN') }}（每5秒刷新）</span>
    </div>

    <el-tabs v-model="activeTab" class="env-tabs" @tab-change="onTabChange">
      <el-tab-pane label="空气数据" name="air" />
      <el-tab-pane label="土壤数据" name="soil" />
      <el-tab-pane label="水体数据" name="water" />
    </el-tabs>

    <el-row :gutter="16">
      <el-col v-for="m in currentMetrics" :key="m.key" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="metric-card">
          <div class="metric-top">
            <div class="metric-icon" :style="{ background: m.color }">
              <el-icon :size="20" color="#fff"><component :is="m.icon" /></el-icon>
            </div>
            <div class="metric-label">{{ m.label }}</div>
            <el-tag :type="statusOf(m).type" size="small" effect="dark">{{ statusOf(m).text }}</el-tag>
          </div>
          <div class="metric-value">{{ m.value }}<span class="metric-unit">{{ m.unit }}</span></div>
          <el-progress
            :percentage="Math.min(100, Math.max(0, ((m.value - m.min) / (m.max - m.min)) * 100))"
            :color="m.color"
            :show-text="false"
            :stroke-width="8"
          />
          <div class="metric-range">适宜范围：{{ m.min }} ~ {{ m.max }}{{ m.unit }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="chart-card">
      <div ref="chartRef" class="chart" />
    </el-card>
  </div>
</template>

<style scoped>
.update-time {
  font-size: 13px;
  color: #868e96;
}

.env-tabs {
  margin-bottom: 4px;
}

.metric-card {
  margin-bottom: 16px;
}

.metric-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-label {
  font-size: 14px;
  color: #495057;
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 10px;
}

.metric-unit {
  font-size: 13px;
  color: #868e96;
  font-weight: 400;
  margin-left: 4px;
}

.metric-range {
  margin-top: 8px;
  font-size: 12px;
  color: #adb5bd;
}

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 340px;
}
</style>
