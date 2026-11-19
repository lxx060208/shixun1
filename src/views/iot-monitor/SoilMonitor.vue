<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSoilApi, getSoilTrendApi } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const loading = ref(true)
const data = ref(null)
const tablePage = ref(1)
const pageSize = 8
const range = ref('24h')

async function load() {
  loading.value = true
  data.value = await getSoilApi(range.value)
  loading.value = false
}

function refresh() {
  load()
  ElMessage.success('已刷新土壤墒情数据')
}

async function changeRange() {
  const trend = await getSoilTrendApi(range.value)
  data.value.labels = trend.labels
  data.value.series = trend.series
  ElMessage.success(`已切换至${range.value === '1h' ? '1 小时' : range.value === '6h' ? '6 小时' : '24 小时'}区间`)
}

const pagedHistory = computed(() => {
  if (!data.value) return []
  const start = (tablePage.value - 1) * pageSize
  return data.value.history.slice(start, start + pageSize)
})

const statusType = (s) => (s === 'warn' ? 'warning' : 'success')

// 客户端分页：刷新数据后若历史记录减少导致当前页越界，自动回退
watch(
  () => data.value?.history?.length ?? 0,
  (len) => {
    const maxPage = Math.max(1, Math.ceil(len / pageSize))
    if (tablePage.value > maxPage) tablePage.value = maxPage
  },
)

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">土壤墒情监测</h3>
        <p class="page-subtitle">土壤湿度 · pH · EC · 氮磷钾养分实时与历史</p>
      </div>
      <el-button :icon="'Refresh'" @click="refresh">刷新数据</el-button>
    </div>

    <template v-if="data">
      <!-- 指标卡片 -->
      <el-row :gutter="16">
        <el-col v-for="m in data.metrics" :key="m.label" :xs="12" :sm="8" :md="6" :lg="4">
          <div class="metric-card">
            <span class="m-label">{{ m.label }}</span>
            <span class="m-value">{{ m.value }}<em>{{ m.unit }}</em></span>
          </div>
        </el-col>
      </el-row>

      <!-- NPK 养分 -->
      <el-row :gutter="16">
        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="panel-title">氮磷钾养分含量 (mg/kg)</span></template>
            <div class="npk-list">
              <div v-for="item in data.npk" :key="item.label" class="npk-item">
                <span class="npk-label" :style="{ color: item.color }">{{ item.label }}</span>
                <el-progress :percentage="item.value / 2" :stroke-width="12" :color="item.color" />
                <span class="npk-val">{{ item.value }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 历史曲线 -->
        <el-col :xs="24" :lg="16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-head">
                <span class="panel-title">墒情 & 理化指标历史曲线</span>
                <div class="chart-tools">
                  <el-radio-group v-model="range" size="small" @change="changeRange">
                    <el-radio-button value="1h">1小时</el-radio-button>
                    <el-radio-button value="6h">6小时</el-radio-button>
                    <el-radio-button value="24h">24小时</el-radio-button>
                  </el-radio-group>
                  <div class="legend">
                    <span v-for="s in data.series" :key="s.name" class="lg">
                      <i :style="{ background: s.color }" />{{ s.name }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
            <TrendChart :labels="data.labels" :series="data.series" :height="250" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 历史数据表格 -->
      <el-card shadow="never" class="chart-card">
        <template #header><span class="panel-title">历史采样数据</span></template>
        <el-table :data="pagedHistory" size="small" stripe>
          <el-table-column prop="time" label="采样时间" min-width="110" />
          <el-table-column prop="humidity" label="湿度(%)" width="90" />
          <el-table-column prop="ph" label="pH 值" width="80" />
          <el-table-column prop="ec" label="EC(mS/cm)" width="100" />
          <el-table-column prop="n" label="氮(N)" width="80" />
          <el-table-column prop="p" label="磷(P)" width="80" />
          <el-table-column prop="k" label="钾(K)" width="80" />
        </el-table>
        <div class="pager">
          <el-pagination
            v-model:current-page="tablePage"
            :page-size="pageSize"
            :total="data.history.length"
            background
            layout="prev, pager, next"
          />
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; }

.metric-card {
  position: relative;
  overflow: hidden;
  display: flex; flex-direction: column; gap: 8px; padding: 18px 16px; margin-bottom: 16px;
  background: #fff; border: 1px solid var(--samp-border); border-radius: 14px;
  border-top: 4px solid #16a34a; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  animation: riseIn 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.12);
}
/* 指标卡片依次错落入场 */
.el-row > .el-col:nth-child(1) .metric-card { border-top-color:#b45309; background:linear-gradient(160deg,#fffbeb,#fff 70%); animation-delay: 0ms; }
.el-row > .el-col:nth-child(2) .metric-card { border-top-color:#ea580c; background:linear-gradient(160deg,#fff7ed,#fff 70%); animation-delay: 50ms; }
.el-row > .el-col:nth-child(3) .metric-card { border-top-color:#16a34a; background:linear-gradient(160deg,#f0fdf4,#fff 70%); animation-delay: 100ms; }
.el-row > .el-col:nth-child(4) .metric-card { border-top-color:#0284c7; background:linear-gradient(160deg,#f0f9ff,#fff 70%); animation-delay: 150ms; }
.el-row > .el-col:nth-child(5) .metric-card { border-top-color:#059669; background:linear-gradient(160deg,#ecfdf5,#fff 70%); animation-delay: 200ms; }
.el-row > .el-col:nth-child(6) .metric-card { border-top-color:#f59e0b; background:linear-gradient(160deg,#fffbeb,#fff 70%); animation-delay: 250ms; }
.el-row > .el-col:nth-child(7) .metric-card { border-top-color:#7c3aed; background:linear-gradient(160deg,#f5f3ff,#fff 70%); animation-delay: 300ms; }
.m-label { font-size: 14px; font-weight: 600; color: var(--samp-text-secondary); }
.m-value { font-size: 28px; font-weight: 800; color: var(--samp-text-main); }
.m-value em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--samp-text-secondary); margin-left: 3px; }

.chart-card { margin-bottom: 16px; animation: riseIn 0.5s 0.12s ease backwards; }
.chart-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.chart-tools { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; }
.lg { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--samp-text-secondary); }
.lg i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

.npk-list { display: flex; flex-direction: column; gap: 18px; }
.npk-item { display: flex; align-items: center; gap: 12px; animation: riseIn 0.4s ease backwards; }
.npk-item:nth-child(2) { animation-delay: 70ms; }
.npk-item:nth-child(3) { animation-delay: 140ms; }
.npk-label { width: 48px; font-weight: 600; flex-shrink: 0; }
.npk-item :deep(.el-progress) { flex: 1; }
.npk-item :deep(.el-progress-bar__inner) { transition: width 0.9s cubic-bezier(0.22, 0.9, 0.3, 1); }
.npk-val { width: 40px; text-align: right; color: var(--samp-text-main); font-weight: 600; flex-shrink: 0; }

.pager { display: flex; justify-content: flex-end; margin-top: 14px; }

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .chart-card,
  .npk-item {
    animation: none !important;
    transition: none !important;
  }
}
</style>