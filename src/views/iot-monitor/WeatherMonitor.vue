<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWeatherApi } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const loading = ref(true)
const data = ref(null)

async function load() {
  loading.value = true
  data.value = await getWeatherApi()
  loading.value = false
}

function refresh() {
  load()
  ElMessage.success('已刷新气象数据')
}

const statusType = (s) => (s === 'warn' ? 'warning' : 'success')

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">气象监测</h3>
        <p class="page-subtitle">温湿度 · 风速风向 · 降雨 · 日照实时曲线</p>
      </div>
      <el-button :icon="'Refresh'" @click="refresh">刷新数据</el-button>
    </div>

    <template v-if="data">
      <!-- 指标卡片 -->
      <el-row :gutter="16">
        <el-col v-for="m in data.metrics" :key="m.label" :xs="12" :sm="8" :md="6" :lg="4">
          <div class="metric-card">
            <span class="m-label">{{ m.label }}</span>
            <span class="m-value">
              {{ m.value }}<em>{{ m.unit }}</em>
            </span>
          </div>
        </el-col>
      </el-row>

      <!-- 温湿度曲线 -->
      <el-row :gutter="16">
        <el-col :xs="24" :lg="16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-head">
                <span class="panel-title">温度 / 湿度 24 小时曲线</span>
                <div class="legend">
                  <span class="lg"><i style="background:#2563eb" />气温(°C)</span>
                  <span class="lg"><i style="background:#16a34a" />湿度(%)</span>
                </div>
              </div>
            </template>
            <TrendChart
              :labels="data.labels"
              :series="[
                { name: '气温', data: data.temp, color: '#2563eb' },
                { name: '湿度', data: data.humidity, color: '#16a34a' },
              ]"
              :height="250"
            />
          </el-card>
        </el-col>

        <!-- 风向 -->
        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="panel-title">风向风速</span>
            </template>
            <div class="wind-list">
              <div v-for="w in data.wind" :key="w.dir" class="wind-item">
                <span class="wind-dir">{{ w.dir }}</span>
                <el-progress class="wind-bar" :percentage="Math.min(100, w.val * 22)" :show-text="false" :stroke-width="10" />
                <span class="wind-val">{{ w.val }} m/s</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 降雨 & 日照 -->
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="panel-title">近 8 小时降雨量 (mm)</span>
            </template>
            <TrendChart
              :labels="data.rainLabels"
              :series="[{ name: '降雨量', data: data.rainfall, color: '#0284c7' }]"
              type="bar"
              :show-area="false"
              :height="220"
            />
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="panel-title">近 8 小时日照时数 (h)</span>
            </template>
            <TrendChart
              :labels="data.rainLabels"
              :series="[{ name: '日照', data: data.sunHours, color: '#f59e0b' }]"
              type="bar"
              :show-area="false"
              :height="220"
            />
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  border-top: 4px solid #16a34a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.metric-card:nth-child(1) { border-top-color:#2563eb; background:linear-gradient(160deg,#eff6ff,#fff 70%); }
.metric-card:nth-child(2) { border-top-color:#16a34a; background:linear-gradient(160deg,#f0fdf4,#fff 70%); }
.metric-card:nth-child(3) { border-top-color:#06b6d4; background:linear-gradient(160deg,#ecfeff,#fff 70%); }
.metric-card:nth-child(4) { border-top-color:#7c3aed; background:linear-gradient(160deg,#f5f3ff,#fff 70%); }
.metric-card:nth-child(5) { border-top-color:#0284c7; background:linear-gradient(160deg,#f0f9ff,#fff 70%); }
.metric-card:nth-child(6) { border-top-color:#f59e0b; background:linear-gradient(160deg,#fffbeb,#fff 70%); }
.metric-card:nth-child(7) { border-top-color:#64748b; background:linear-gradient(160deg,#f8fafc,#fff 70%); }
.m-label { font-size: 14px; font-weight: 600; color: var(--samp-text-secondary); }
.m-value { font-size: 28px; font-weight: 800; color: var(--samp-text-main); }
.m-value em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--samp-text-secondary); margin-left: 3px; }

.chart-card { margin-bottom: 16px; }

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.legend { display: flex; gap: 14px; }
.lg { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--samp-text-secondary); }
.lg i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

.wind-list { display: flex; flex-direction: column; gap: 12px; }
.wind-item { display: flex; align-items: center; gap: 10px; }
.wind-dir { width: 36px; font-size: 13px; color: var(--samp-text-main); flex-shrink: 0; }
.wind-bar { flex: 1; }
.wind-val { width: 52px; font-size: 12px; color: var(--samp-text-secondary); text-align: right; flex-shrink: 0; }
</style>