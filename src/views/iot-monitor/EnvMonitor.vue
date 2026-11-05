<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOverviewApi } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const router = useRouter()

const loading = ref(true)
const data = ref(null)

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
          <el-card shadow="never" class="cat-card clickable" @click="goDetail(cat.key)">
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
  gap: 8px;
  padding: 18px 16px;
  margin-bottom: 16px;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  border-top: 4px solid #16a34a;
  background: linear-gradient(160deg, #f0fdf4 0%, #ffffff 70%);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.kpi-card:nth-child(1) { border-top-color: #16a34a; background: linear-gradient(160deg, #f0fdf4 0%, #fff 70%); }
.kpi-card:nth-child(2) { border-top-color: #2563eb; background: linear-gradient(160deg, #eff6ff 0%, #fff 70%); }
.kpi-card:nth-child(3) { border-top-color: #e11d48; background: linear-gradient(160deg, #fff1f2 0%, #fff 70%); }
.kpi-card:nth-child(4) { border-top-color: #7c3aed; background: linear-gradient(160deg, #f5f3ff 0%, #fff 70%); }
.kpi-card:nth-child(5) { border-top-color: #f59e0b; background: linear-gradient(160deg, #fffbeb 0%, #fff 70%); }
.kpi-card:nth-child(6) { border-top-color: #0891b2; background: linear-gradient(160deg, #ecfeff 0%, #fff 70%); }

.kpi-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--samp-text-secondary);
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--samp-text-main);
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
}

.cat-card.clickable {
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
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
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
}
.dot.warn {
  background: #f59e0b;
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
}
.metric-value em {
  font-style: normal;
  font-size: 12px;
  color: var(--samp-text-secondary);
  margin-left: 3px;
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