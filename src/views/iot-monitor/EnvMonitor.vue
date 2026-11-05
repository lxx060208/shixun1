<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOverviewApi } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const loading = ref(true)
const data = ref(null)

async function load() {
  loading.value = true
  data.value = await getOverviewApi()
  loading.value = false
}

function refresh() {
  load()
  ElMessage.success('已刷新实时监测数据')
}

function statusType(s) {
  return s === 'warn' ? 'warning' : 'success'
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">环境监测总览</h3>
        <p class="page-subtitle">空气 · 土壤 · 水体 · 气象多维数据实时汇总</p>
      </div>
      <el-button :icon="'Refresh'" @click="refresh">刷新数据</el-button>
    </div>

    <template v-if="data">
      <!-- 设备概况 -->
      <el-row :gutter="16" class="kpi-row">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card">
            <span class="kpi-label">设备总数</span>
            <span class="kpi-value">{{ data.stats.totalDevices }}</span>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">在线</span><span class="kpi-value green">{{ data.stats.online }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">掉线</span><span class="kpi-value red">{{ data.stats.offline }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">在线率</span><span class="kpi-value">{{ data.stats.onlineRate }}%</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card"><span class="kpi-label">待处置告警</span><span class="kpi-value orange">{{ data.stats.alarmCount }}</span></div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="kpi-card">
            <span class="kpi-label">数据更新时间</span>
            <span class="kpi-time">{{ new Date().toLocaleTimeString('zh-CN') }}</span>
          </div>
        </el-col>
      </el-row>

      <!-- 分类指标卡片 -->
      <el-row :gutter="16">
        <el-col v-for="cat in data.categories" :key="cat.key" :xs="24" :sm="12" :lg="6">
          <el-card shadow="never" class="cat-card">
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
                  <b>{{ m.value }}</b>
                  <em v-if="m.unit">{{ m.unit }}</em>
                </span>
              </li>
            </ul>
          </el-card>
        </el-col>
      </el-row>

      <!-- 24 小时趋势 -->
      <el-card shadow="never" class="trend-card">
        <template #header>
          <div class="card-head">
            <div>
              <span class="panel-title">最近 24 小时趋势</span>
              <p class="card-sub">空气温度 & 土壤湿度</p>
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

.kpi-row {
  margin-bottom: 4px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--samp-border);
  border-radius: 12px;
}

.kpi-label {
  font-size: 12px;
  color: var(--samp-text-secondary);
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--samp-text-main);
}
.kpi-value.green { color: #16a34a; }
.kpi-value.red { color: #e11d48; }
.kpi-value.orange { color: #f59e0b; }

.kpi-time {
  font-size: 14px;
  font-weight: 600;
  color: var(--samp-text-main);
}

.cat-card {
  margin-bottom: 16px;
}

.cat-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.cat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-name {
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
  padding: 8px 0;
  border-bottom: 1px dashed var(--samp-border);
}
.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--samp-text-secondary);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16a34a;
}
.dot.warn {
  background: #f59e0b;
}

.metric-value {
  font-size: 14px;
  color: var(--samp-text-main);
}
.metric-value b {
  font-size: 18px;
}
.metric-value em {
  font-style: normal;
  font-size: 11px;
  color: var(--samp-text-secondary);
  margin-left: 2px;
}

.trend-card {
  margin-bottom: 16px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.card-sub {
  margin: 2px 0 0;
  font-size: 12px;
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
  font-size: 12px;
  color: var(--samp-text-secondary);
}
.legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
</style>