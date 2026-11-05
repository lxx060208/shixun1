<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWaterApi } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const loading = ref(true)
const data = ref(null)

async function load() {
  loading.value = true
  data.value = await getWaterApi()
  loading.value = false
}

function refresh() {
  load()
  ElMessage.success('已刷新水质数据')
}

const statusType = (s) => (s === 'warn' ? 'warning' : 'success')

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">水质监测</h3>
        <p class="page-subtitle">水温 · 溶解氧 · 氨氮 · 亚硝酸盐 · 浊度</p>
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

      <!-- 核心指标曲线 -->
      <el-row :gutter="16">
        <el-col :xs="24" :lg="16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="chart-head">
                <span class="panel-title">水温 / 溶解氧 / 氨氮 24 小时曲线</span>
                <div class="legend">
                  <span v-for="s in data.series" :key="s.name" class="lg">
                    <i :style="{ background: s.color }" />{{ s.name }}
                  </span>
                </div>
              </div>
            </template>
            <TrendChart :labels="data.labels" :series="data.series" :height="250" />
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="panel-title">水质安全等级</span></template>
            <div class="grade-box">
              <div class="grade-ring">
                <span class="grade-num">Ⅱ</span>
                <em>类水</em>
              </div>
              <div class="grade-info">
                <p>水体综合状态良好，氨氮略偏高，建议关注施肥与排水。</p>
                <el-tag type="warning" effect="light">氨氮接近阈值</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 浊度 -->
      <el-card shadow="never" class="chart-card">
        <template #header><span class="panel-title">浊度变化趋势 (NTU)</span></template>
        <TrendChart
          :labels="data.labels"
          :series="[{ name: '浊度', data: data.turbidity, color: '#0e7490' }]"
          :height="220"
        />
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; }

.metric-card {
  display: flex; flex-direction: column; gap: 8px; padding: 18px 16px; margin-bottom: 16px;
  background: #fff; border: 1px solid var(--samp-border); border-radius: 14px;
  border-top: 4px solid #0ea5e9; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.metric-card:nth-child(1) { border-top-color:#0ea5e9; background:linear-gradient(160deg,#ecfeff,#fff 70%); }
.metric-card:nth-child(2) { border-top-color:#16a34a; background:linear-gradient(160deg,#f0fdf4,#fff 70%); }
.metric-card:nth-child(3) { border-top-color:#f59e0b; background:linear-gradient(160deg,#fffbeb,#fff 70%); }
.metric-card:nth-child(4) { border-top-color:#e11d48; background:linear-gradient(160deg,#fff1f2,#fff 70%); }
.metric-card:nth-child(5) { border-top-color:#0891b2; background:linear-gradient(160deg,#ecfeff,#fff 70%); }
.metric-card:nth-child(6) { border-top-color:#2563eb; background:linear-gradient(160deg,#eff6ff,#fff 70%); }
.m-label { font-size: 14px; font-weight: 600; color: var(--samp-text-secondary); }
.m-value { font-size: 28px; font-weight: 800; color: var(--samp-text-main); }
.m-value em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--samp-text-secondary); margin-left: 3px; }

.chart-card { margin-bottom: 16px; }
.chart-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; }
.lg { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--samp-text-secondary); }
.lg i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

.grade-box { display: flex; align-items: center; gap: 20px; padding: 8px 0; }
.grade-ring {
  width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; background: linear-gradient(135deg, #0ea5e9, #0284c7);
}
.grade-num { font-size: 28px; font-weight: 700; line-height: 1; }
.grade-ring em { font-style: normal; font-size: 12px; margin-top: 2px; }
.grade-info p { margin: 0 0 10px; font-size: 13px; color: var(--samp-text-secondary); line-height: 1.6; }
</style>