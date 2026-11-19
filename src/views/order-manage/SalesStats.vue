<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getSalesStatsApi } from '@/api'

const loading = ref(true)
const statCards = ref([])
const empty = ref(false)

const trendChartRef = ref(null)
const hotChartRef = ref(null)
const categoryChartRef = ref(null)
const parkChartRef = ref(null)
let charts = []
let pageData = null

function money(n) {
  return (Number(n) || 0).toFixed(2)
}

function buildStatCards(s) {
  statCards.value = [
    { label: '销售额合计', value: money(s.totalAmount), unit: '元', icon: 'Money', color: '#e8590c' },
    { label: '销量合计', value: s.totalQty, unit: 'kg / 盒', icon: 'Goods', color: '#2f9e44' },
    { label: '订单总数', value: s.orderCount, unit: '单', icon: 'Tickets', color: '#1c7ed6' },
    { label: '客户复购率', value: s.repurchaseRate, unit: '%', icon: 'Refresh', color: '#7048e8' },
  ]
}

function initTrendChart() {
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    title: { text: '近14日销售趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 55, right: 55, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.trend.dates.map((d) => d.slice(5)) },
    yAxis: [
      { type: 'value', name: '销售额（元）' },
      { type: 'value', name: '销量', splitLine: { show: false } },
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        barWidth: 14,
        data: pageData.trend.amount,
        itemStyle: { color: '#ffa94d', borderRadius: [3, 3, 0, 0] },
      },
      {
        name: '销量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: pageData.trend.qty,
        itemStyle: { color: '#2f9e44' },
      },
    ],
  })
  charts.push(chart)
}

function initHotChart() {
  const rows = pageData.hotProducts.slice(0, 6)
  const names = rows.map((i) => i.name)
  const values = rows.map((i) => i.amount)
  const chart = echarts.init(hotChartRef.value)
  chart.setOption({
    title: { text: '热销产品排行（销售额）', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 60, top: 50, bottom: 20 },
    xAxis: { type: 'value', name: '元' },
    yAxis: { type: 'category', data: names.slice().reverse(), axisLabel: { fontSize: 12 } },
    series: [
      {
        type: 'bar',
        data: values.slice().reverse(),
        barWidth: 16,
        itemStyle: { color: '#2f9e44', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', formatter: (p) => `￥${p.value}` },
      },
    ],
  })
  charts.push(chart)
}

function initCategoryChart() {
  const chart = echarts.init(categoryChartRef.value)
  chart.setOption({
    title: { text: '品类销售占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ￥${p.value} (${p.percent}%)` },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '46%'],
        data: pageData.categoryDist.map((i) => ({ ...i })),
        label: { formatter: '{b}\n{d}%' },
      },
    ],
  })
  charts.push(chart)
}

function initParkChart() {
  const chart = echarts.init(parkChartRef.value)
  chart.setOption({
    title: { text: '园区销售占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ￥${p.value} (${p.percent}%)` },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '62%',
        center: ['50%', '46%'],
        data: pageData.parkDist.map((i) => ({ ...i })),
        label: { formatter: '{b}\n{d}%' },
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
    pageData = await getSalesStatsApi()
    empty.value = !pageData.hotProducts.length
    buildStatCards(pageData.summary)
    if (!empty.value) {
      initTrendChart()
      initHotChart()
      initCategoryChart()
      initParkChart()
      window.addEventListener('resize', handleResize)
    }
  } catch (e) {
    ElMessage.error(e.message || '加载销售统计失败')
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
      <h2 class="page-title">销售统计</h2>
      <span class="page-desc">销售额、销量、热销产品排行与销售趋势分析（按已发货、已完成订单统计）</span>
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

    <el-empty v-if="empty && !loading" description="暂无销售数据" />

    <template v-else>
      <el-card shadow="never" class="chart-card">
        <div ref="trendChartRef" class="chart-wide" />
      </el-card>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="chart-card"><div ref="hotChartRef" class="chart" /></el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="chart-card"><div ref="categoryChartRef" class="chart" /></el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="chart-card"><div ref="parkChartRef" class="chart" /></el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="table-title">热销产品明细</span></template>
            <el-table :data="pageData ? pageData.hotProducts : []" size="small" max-height="300">
              <el-table-column prop="name" label="农产品" min-width="150" show-overflow-tooltip />
              <el-table-column label="销量" width="110" align="right">
                <template #default="{ row }">{{ row.qty }} {{ row.unit }}</template>
              </el-table-column>
              <el-table-column label="销售额" width="120" align="right">
                <template #default="{ row }">￥{{ money(row.amount) }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </template>
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

.table-title {
  font-weight: 600;
}
</style>
