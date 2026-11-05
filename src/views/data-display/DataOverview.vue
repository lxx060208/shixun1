<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getDataOverviewApi } from '@/api'

const loading = ref(true)
const statCards = ref([])

const areaChartRef = ref(null)
const rateChartRef = ref(null)
const alarmChartRef = ref(null)
const yieldChartRef = ref(null)
let charts = []
let pageData = null

function buildStatCards(stats) {
  statCards.value = [
    { label: '园区数量', value: stats.parkCount, unit: '个', icon: 'OfficeBuilding', color: '#2f9e44' },
    { label: '种植面积', value: stats.area.toLocaleString(), unit: '亩', icon: 'Crop', color: '#1c7ed6' },
    { label: '设备在线率', value: stats.deviceOnlineRate, unit: '%', icon: 'Monitor', color: '#7048e8' },
    { label: '今日告警', value: stats.alarmCount, unit: '条', icon: 'Bell', color: '#e8590c' },
    { label: '累计产量', value: (stats.totalYield / 1000).toFixed(1), unit: '吨', icon: 'DataLine', color: '#f59f00' },
  ]
}

function initAreaChart() {
  const chart = echarts.init(areaChartRef.value)
  chart.setOption({
    title: { text: '各园区种植面积（亩）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 50, bottom: 40 },
    xAxis: { type: 'category', data: pageData.parks.map((p) => p.name), axisLabel: { interval: 0, rotate: 12 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: pageData.parks.map((p) => p.area),
      itemStyle: { color: '#2f9e44', borderRadius: [4, 4, 0, 0] },
      barWidth: 48,
    }],
  })
  charts.push(chart)
}

function initRateChart() {
  const chart = echarts.init(rateChartRef.value)
  chart.setOption({
    title: { text: '设备在线率', left: 'center', textStyle: { fontSize: 14 } },
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      progress: { show: true, width: 14 },
      axisLine: { lineStyle: { width: 14 } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      detail: { valueAnimation: true, fontSize: 28, offsetCenter: [0, 0], formatter: '{value}%' },
      data: [{ value: pageData.stats.deviceOnlineRate }],
    }],
  })
  charts.push(chart)
}

function initAlarmChart() {
  const chart = echarts.init(alarmChartRef.value)
  chart.setOption({
    title: { text: '近7日告警数趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: pageData.alarmTrend.dates },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: pageData.alarmTrend.values,
      smooth: true,
      areaStyle: { opacity: 0.2 },
      itemStyle: { color: '#e8590c' },
    }],
  })
  charts.push(chart)
}

function initYieldChart() {
  const chart = echarts.init(yieldChartRef.value)
  chart.setOption({
    title: { text: '各园区累计产量（吨）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 吨 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '48%'],
      data: pageData.parks.map((p) => ({ name: p.name, value: p.yield })),
      label: { formatter: '{b}\n{d}%' },
    }],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  pageData = await getDataOverviewApi()
  buildStatCards(pageData.stats)
  loading.value = false
  initAreaChart()
  initRateChart()
  initAlarmChart()
  initYieldChart()
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
      <h2 class="page-title">平台数据总览</h2>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="12" :md="8" :lg="4" :xl="4">
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
        <el-card shadow="never" class="chart-card"><div ref="areaChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="rateChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="alarmChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="yieldChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
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
</style>
