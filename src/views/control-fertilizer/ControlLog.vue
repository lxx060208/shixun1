<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getControlLogsApi, getUtilityStatsApi } from '@/api'

const loading = ref(true)
const logs = ref([])
const statCards = ref([])

const filterChannel = ref('全部')
const keyword = ref('')

const dailyChartRef = ref(null)
const parkChartRef = ref(null)
let charts = []
let utilityData = null

const channelOptions = ['全部', '手动控制', '联动策略', '分组控制', '水肥控制']

const filteredLogs = ref([])

function applyFilter() {
  filteredLogs.value = logs.value.filter((l) => {
    const matchChannel = filterChannel.value === '全部' || l.channel === filterChannel.value
    const matchKey =
      !keyword.value ||
      l.device.includes(keyword.value) ||
      l.operator.includes(keyword.value) ||
      l.action.includes(keyword.value)
    return matchChannel && matchKey
  })
}

function resultType(result) {
  return result === '成功' ? 'success' : 'danger'
}

function channelType(channel) {
  return {
    手动控制: 'primary',
    联动策略: 'success',
    分组控制: 'warning',
    水肥控制: 'danger',
  }[channel] || 'info'
}

function initDailyChart() {
  const chart = echarts.init(dailyChartRef.value)
  chart.setOption({
    title: { text: '近7日用水用电', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 50, right: 50, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: utilityData.daily.dates },
    yAxis: [
      { type: 'value', name: '用水(m³)', position: 'left' },
      { type: 'value', name: '用电(kWh)', position: 'right' },
    ],
    series: [
      {
        name: '用水量',
        type: 'bar',
        data: utilityData.daily.water,
        itemStyle: { color: '#1c7ed6', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
      },
      {
        name: '用电量',
        type: 'line',
        yAxisIndex: 1,
        data: utilityData.daily.electricity,
        smooth: true,
        itemStyle: { color: '#f59f00' },
      },
    ],
  })
  charts.push(chart)
}

function initParkChart() {
  const chart = echarts.init(parkChartRef.value)
  chart.setOption({
    title: { text: '今日各园区水电消耗', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 50, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: utilityData.byPark.map((p) => p.name.replace('智慧农业示范园', '园区').replace('有机蔬菜基地', '基地').replace('生态果园', '果园')) },
    yAxis: { type: 'value' },
    series: [
      { name: '用水(m³)', type: 'bar', data: utilityData.byPark.map((p) => p.water), itemStyle: { color: '#1c7ed6', borderRadius: [4, 4, 0, 0] }, barWidth: 24 },
      { name: '用电(kWh)', type: 'bar', data: utilityData.byPark.map((p) => p.electricity), itemStyle: { color: '#f59f00', borderRadius: [4, 4, 0, 0] }, barWidth: 24 },
    ],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  const [logData, utilData] = await Promise.all([getControlLogsApi(), getUtilityStatsApi()])
  logs.value = logData
  utilityData = utilData
  applyFilter()
  statCards.value = [
    { label: '今日用水', value: utilData.summary.todayWater, unit: 'm³', icon: 'Pouring', color: '#1c7ed6' },
    { label: '今日用电', value: utilData.summary.todayElectricity, unit: 'kWh', icon: 'Lightning', color: '#f59f00' },
    { label: '本月用水', value: utilData.summary.monthWater, unit: 'm³', icon: 'DataAnalysis', color: '#2f9e44' },
    { label: '本月用电', value: utilData.summary.monthElectricity, unit: 'kWh', icon: 'Odometer', color: '#7048e8' },
  ]
  loading.value = false
  initDailyChart()
  initParkChart()
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
      <h2 class="page-title">控制日志与水电统计</h2>
      <span class="page-desc">操作人 / 时间 / 动作追溯 · 用水用电统计</span>
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
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="dailyChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="chart-card"><div ref="parkChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">操作追溯日志</span>
          <div class="header-filters">
            <el-radio-group v-model="filterChannel" size="small" @change="applyFilter">
              <el-radio-button v-for="c in channelOptions" :key="c" :value="c">{{ c }}</el-radio-button>
            </el-radio-group>
            <el-input
              v-model="keyword"
              placeholder="搜索操作人 / 设备 / 动作"
              clearable
              size="small"
              class="search-input"
              @input="applyFilter"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>
      </template>
      <el-table :data="filteredLogs" stripe>
        <el-table-column prop="time" label="时间" width="165" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column prop="device" label="控制对象" min-width="170" />
        <el-table-column prop="action" label="动作" min-width="200" show-overflow-tooltip />
        <el-table-column label="通道" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="channelType(row.channel)" size="small" effect="plain">{{ row.channel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结果" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="resultType(row.result)" size="small">{{ row.result }}</el-tag>
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

.page-desc {
  font-size: 13px;
  color: #868e96;
  margin-left: 12px;
}

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-title {
  font-weight: 600;
}

.header-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
}
</style>
