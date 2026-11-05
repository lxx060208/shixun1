<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getAlarmFarmPanelApi } from '@/api'

const loading = ref(true)
const statCards = ref([])
const farmOrders = ref([])

const trendChartRef = ref(null)
const levelChartRef = ref(null)
const farmChartRef = ref(null)
let charts = []
let pageData = null

function buildStatCards(s) {
  statCards.value = [
    { label: '今日告警', value: s.today, unit: '条', icon: 'Bell', color: '#e8590c' },
    { label: '严重告警', value: s.severe, unit: '条', icon: 'WarningFilled', color: '#e03131' },
    { label: '农事工单完成率', value: s.farmOrderRate, unit: '%', icon: 'CircleCheck', color: '#2f9e44' },
    { label: '今日农事任务', value: s.todayFarmTasks, unit: '项', icon: 'ListChecked', color: '#1c7ed6' },
  ]
}

function statusType(s) {
  return { 已完成: 'success', 进行中: 'warning', 未开始: 'info' }[s] || 'info'
}

function initTrendChart() {
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    title: { text: '近14日报警趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.trend.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '环境告警', type: 'line', data: pageData.trend.env, smooth: true, itemStyle: { color: '#e8590c' } },
      { name: '设备告警', type: 'line', data: pageData.trend.device, smooth: true, itemStyle: { color: '#7048e8' } },
      { name: '安防告警', type: 'line', data: pageData.trend.security, smooth: true, itemStyle: { color: '#1c7ed6' } },
    ],
  })
  charts.push(chart)
}

function initLevelChart() {
  const colorMap = { 严重: '#e03131', 警告: '#f59f00', 提示: '#1c7ed6' }
  const chart = echarts.init(levelChartRef.value)
  chart.setOption({
    title: { text: '告警级别分布（本月）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '48%'],
      data: pageData.levelDist.map((i) => ({ ...i, itemStyle: { color: colorMap[i.name] } })),
      label: { formatter: '{b}\n{d}%' },
    }],
  })
  charts.push(chart)
}

function initFarmChart() {
  const chart = echarts.init(farmChartRef.value)
  chart.setOption({
    title: { text: '本周农事工单完成情况', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.farmWeekly.days },
    yAxis: { type: 'value' },
    series: [
      { name: '已完成', type: 'bar', stack: 't', data: pageData.farmWeekly.done, itemStyle: { color: '#2f9e44' }, barWidth: 26 },
      { name: '未完成', type: 'bar', stack: 't', data: pageData.farmWeekly.undone, itemStyle: { color: '#dee2e6' }, barWidth: 26 },
    ],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  pageData = await getAlarmFarmPanelApi()
  buildStatCards(pageData.stats)
  farmOrders.value = pageData.farmOrders
  loading.value = false
  initTrendChart()
  initLevelChart()
  initFarmChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach((c) => c.dispose())
  charts = []
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">告警与农事进度面板</h2>
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

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="trendChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="levelChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="farmChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span class="table-title">今日农事工单</span></template>
      <el-table :data="farmOrders" stripe>
        <el-table-column prop="id" label="工单编号" width="130" />
        <el-table-column prop="task" label="农事任务" min-width="150" />
        <el-table-column prop="plot" label="所属地块" min-width="150" />
        <el-table-column prop="owner" label="负责人" width="100" />
        <el-table-column label="进度" min-width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : ''" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="plain" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 280px;
}

.table-title {
  font-weight: 600;
}
</style>
