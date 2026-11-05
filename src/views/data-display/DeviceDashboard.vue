<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getDeviceDashboardApi } from '@/api'

const loading = ref(true)
const statCards = ref([])
const workOrders = ref([])

const onlineChartRef = ref(null)
const faultChartRef = ref(null)
const typeChartRef = ref(null)
let charts = []
let pageData = null

function buildStatCards(s) {
  statCards.value = [
    { label: '设备总数', value: s.total, unit: '台', icon: 'Monitor', color: '#1c7ed6' },
    { label: '在线设备', value: s.online, unit: '台', icon: 'CircleCheck', color: '#2f9e44' },
    { label: '故障设备', value: s.fault, unit: '台', icon: 'WarningFilled', color: '#e8590c' },
    { label: '进行中工单', value: s.runningOrders, unit: '个', icon: 'Tickets', color: '#7048e8' },
  ]
}

function statusType(s) {
  return { 已完成: 'success', 处理中: 'warning', 待接单: 'info' }[s] || 'info'
}

function initOnlineChart() {
  const chart = echarts.init(onlineChartRef.value)
  chart.setOption({
    title: { text: '近7日设备在线率', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', formatter: '{b}<br/>在线率：{c}%' },
    grid: { left: 45, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: pageData.onlineRate.dates },
    yAxis: { type: 'value', min: 90, max: 100 },
    series: [{
      type: 'line',
      data: pageData.onlineRate.values,
      smooth: true,
      areaStyle: { opacity: 0.2 },
      itemStyle: { color: '#2f9e44' },
    }],
  })
  charts.push(chart)
}

function initFaultChart() {
  const chart = echarts.init(faultChartRef.value)
  chart.setOption({
    title: { text: '近7日故障统计', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.fault.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '新增故障', type: 'bar', stack: 'f', data: pageData.fault.added, itemStyle: { color: '#e8590c', borderRadius: [4, 4, 0, 0] }, barWidth: 22 },
      { name: '已修复', type: 'bar', stack: 'f', data: pageData.fault.fixed, itemStyle: { color: '#2f9e44' }, barWidth: 22 },
    ],
  })
  charts.push(chart)
}

function initTypeChart() {
  const chart = echarts.init(typeChartRef.value)
  chart.setOption({
    title: { text: '设备类型分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 台 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '48%'],
      data: pageData.typeDist,
      label: { formatter: '{b}\n{d}%' },
    }],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  pageData = await getDeviceDashboardApi()
  buildStatCards(pageData.stats)
  workOrders.value = pageData.workOrders
  loading.value = false
  initOnlineChart()
  initFaultChart()
  initTypeChart()
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
      <h2 class="page-title">设备运维大屏</h2>
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
        <el-card shadow="never" class="chart-card"><div ref="onlineChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="faultChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="typeChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span class="table-title">运维工单进度</span></template>
      <el-table :data="workOrders" stripe>
        <el-table-column prop="id" label="工单编号" width="160" />
        <el-table-column prop="device" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="工单类型" width="110" />
        <el-table-column prop="assignee" label="负责人" width="90" />
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
