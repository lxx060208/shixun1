<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getWaterFertilizerApi } from '@/api'

const loading = ref(true)
const summaryCards = ref([])

const usageChartRef = ref(null)
const yieldChartRef = ref(null)
const compareChartRef = ref(null)
let charts = []
let pageData = null

function buildSummary(s) {
  summaryCards.value = [
    { label: '本月用水量', value: s.monthWater.toLocaleString(), unit: 'm³', icon: 'Pouring', color: '#1c7ed6' },
    { label: '本月用肥量', value: s.monthFertilizer, unit: '吨', icon: 'Box', color: '#2f9e44' },
    { label: '水肥一体化覆盖率', value: s.coverage, unit: '%', icon: 'SetUp', color: '#7048e8' },
    { label: '预计本季产量', value: s.seasonForecast, unit: '吨', icon: 'DataLine', color: '#f59f00' },
  ]
}

function initUsageChart() {
  const chart = echarts.init(usageChartRef.value)
  chart.setOption({
    title: { text: '近6个月用水量 / 用肥量', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 60, right: 50, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.monthly.months },
    yAxis: [
      { type: 'value', name: '用水量(m³)', position: 'left' },
      { type: 'value', name: '用肥量(吨)', position: 'right' },
    ],
    series: [
      { name: '用水量', type: 'bar', data: pageData.monthly.water, itemStyle: { color: '#1c7ed6', borderRadius: [4, 4, 0, 0] }, barWidth: 22 },
      { name: '用肥量', type: 'bar', yAxisIndex: 1, data: pageData.monthly.fertilizer, itemStyle: { color: '#2f9e44', borderRadius: [4, 4, 0, 0] }, barWidth: 22 },
    ],
  })
  charts.push(chart)
}

function initYieldChart() {
  const chart = echarts.init(yieldChartRef.value)
  chart.setOption({
    title: { text: '本季产量预测占比（吨）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 吨 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      center: ['50%', '48%'],
      data: pageData.forecastPie,
      label: { formatter: '{b}\n{d}%' },
    }],
  })
  charts.push(chart)
}

function initCompareChart() {
  const chart = echarts.init(compareChartRef.value)
  chart.setOption({
    title: { text: '产量：实际 vs 预测（吨）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 50, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.compare.months },
    yAxis: { type: 'value' },
    series: [
      { name: '实际产量', type: 'bar', data: pageData.compare.actual, itemStyle: { color: '#2f9e44', borderRadius: [4, 4, 0, 0] }, barWidth: 20 },
      { name: '预测产量', type: 'line', data: pageData.compare.forecast, smooth: true, itemStyle: { color: '#f59f00' }, lineStyle: { type: 'dashed' } },
    ],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  pageData = await getWaterFertilizerApi()
  buildSummary(pageData.summary)
  loading.value = false
  initUsageChart()
  initYieldChart()
  initCompareChart()
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
      <h2 class="page-title">水肥与产量统计面板</h2>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in summaryCards" :key="card.label" :xs="12" :sm="12" :md="6">
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
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="usageChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="yieldChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :span="24">
        <el-card shadow="never" class="chart-card"><div ref="compareChartRef" class="chart chart-wide" /></el-card>
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

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 320px;
}

.chart-wide {
  height: 300px;
}
</style>
