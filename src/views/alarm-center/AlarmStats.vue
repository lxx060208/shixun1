<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getAlarmStatisticsApi } from '@/api'

const loading = ref(true)
const statCards = ref([])

const trendChartRef = ref(null)
const levelChartRef = ref(null)
const typeChartRef = ref(null)
const parkChartRef = ref(null)
const durationChartRef = ref(null)
let charts = []
let pageData = null

const levelColorMap = { 严重: '#e03131', 警告: '#f59f00', 提示: '#1c7ed6' }

function buildStatCards(s) {
  statCards.value = [
    { label: '近14日告警总数', value: s.total14d, unit: '条', icon: 'Bell', color: '#e8590c' },
    { label: '本月告警总数', value: s.monthTotal, unit: '条', icon: 'Calendar', color: '#7048e8' },
    { label: '平均处置时长', value: s.avgHandleMinutes, unit: '分钟', icon: 'Timer', color: '#1c7ed6' },
    { label: '及时处置率', value: s.timelyRate, unit: '%', icon: 'CircleCheck', color: '#2f9e44' },
  ]
}

function initTrendChart() {
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    title: { text: '近14日告警趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.trend.dates },
    yAxis: { type: 'value', name: '条' },
    series: [
      { name: '环境告警', type: 'line', data: pageData.trend.env, smooth: true, itemStyle: { color: '#e8590c' } },
      { name: '设备告警', type: 'line', data: pageData.trend.device, smooth: true, itemStyle: { color: '#7048e8' } },
      { name: '安防告警', type: 'line', data: pageData.trend.security, smooth: true, itemStyle: { color: '#1c7ed6' } },
    ],
  })
  charts.push(chart)
}

function initLevelChart() {
  const chart = echarts.init(levelChartRef.value)
  chart.setOption({
    title: { text: '本月告警级别分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '46%'],
        data: pageData.levelDist.map((i) => ({ ...i, itemStyle: { color: levelColorMap[i.name] } })),
        label: { formatter: '{b}\n{c} 条' },
      },
    ],
  })
  charts.push(chart)
}

function initTypeChart() {
  const names = pageData.typeDist.map((i) => i.name)
  const values = pageData.typeDist.map((i) => i.value)
  const chart = echarts.init(typeChartRef.value)
  chart.setOption({
    title: { text: '高发告警类型分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 110, right: 40, top: 50, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names.slice().reverse(), axisLabel: { fontSize: 12 } },
    series: [
      {
        type: 'bar',
        data: values.slice().reverse(),
        barWidth: 16,
        itemStyle: { color: '#e8590c', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', formatter: '{c} 条' },
      },
    ],
  })
  charts.push(chart)
}

function initParkChart() {
  const chart = echarts.init(parkChartRef.value)
  chart.setOption({
    title: { text: '告警园区分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '46%'],
        data: pageData.parkDist.map((i) => ({ ...i })),
        label: { formatter: '{b}\n{c} 条' },
      },
    ],
  })
  charts.push(chart)
}

function initDurationChart() {
  const chart = echarts.init(durationChartRef.value)
  chart.setOption({
    title: { text: '告警处置时长分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 50, bottom: 40 },
    xAxis: { type: 'category', data: pageData.handleDuration.ranges },
    yAxis: { type: 'value', name: '条' },
    series: [
      {
        type: 'bar',
        data: pageData.handleDuration.values,
        barWidth: 32,
        itemStyle: { color: '#1c7ed6', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top' },
      },
    ],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  try {
    pageData = await getAlarmStatisticsApi()
    buildStatCards(pageData.summary)
    initTrendChart()
    initLevelChart()
    initTypeChart()
    initParkChart()
    initDurationChart()
    window.addEventListener('resize', handleResize)
  } catch (e) {
    ElMessage.error(e.message || '加载告警统计失败')
  } finally {
    loading.value = false
  }
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
      <h2 class="page-title">告警统计分析</h2>
      <span class="page-desc">告警趋势 · 级别分布 · 高发类型 · 处置效率</span>
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

    <el-card shadow="never" class="chart-card">
      <div ref="trendChartRef" class="chart-wide" />
    </el-card>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="levelChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="typeChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="parkChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="durationChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>
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

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 300px;
}

.chart-wide {
  height: 320px;
}
</style>
