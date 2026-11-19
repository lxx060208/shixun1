<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWaterApi, getWaterPointsApi, DO_THRESHOLD } from '@/api/iot'
import TrendChart from '@/components/TrendChart.vue'

const loading = ref(true)
const data = ref(null)
const points = ref([])
const pointId = ref('P1')

const doMetric = computed(() => data.value?.metrics.find((m) => m.label === '溶解氧'))

async function loadPoints() {
  points.value = await getWaterPointsApi()
}

async function load() {
  loading.value = true
  data.value = await getWaterApi(pointId.value)
  loading.value = false
}

async function changePoint() {
  await load()
  const p = points.value.find((x) => x.id === pointId.value)
  if (p?.overAlarm) {
    ElMessage.warning(`${p.name}：溶解氧 ${p.do} mg/L，低于阈值 ${DO_THRESHOLD} mg/L`)
  }
}

function refresh() {
  load()
  ElMessage.success('已刷新水质数据')
}

onMounted(async () => {
  await loadPoints()
  await load()
})
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

    <div class="point-bar">
      <span class="point-bar-label">监测点</span>
      <el-select v-model="pointId" style="width: 300px" @change="changePoint">
        <el-option
          v-for="p in points"
          :key="p.id"
          :value="p.id"
          :label="`${p.name} · 溶氧 ${p.do} mg/L`"
        >
          <div class="opt-row">
            <span class="opt-name">{{ p.name }}</span>
            <span class="opt-do">溶氧 {{ p.do }} mg/L</span>
            <el-tag v-if="p.overAlarm" type="danger" size="small" effect="light">超标</el-tag>
          </div>
        </el-option>
      </el-select>
    </div>

    <template v-if="data">
      <!-- 超标告警 -->
      <el-alert
        v-if="data.doAlarm"
        type="error"
        show-icon
        :closable="false"
        class="alarm-alert"
        :title="`告警：${data.point.name} 溶解氧 ${doMetric.value} mg/L，低于阈值 ${data.threshold} mg/L，请及时增氧处理`"
      />

      <!-- 指标卡片 -->
      <el-row :gutter="16">
        <el-col v-for="m in data.metrics" :key="m.label" :xs="12" :sm="8" :md="6" :lg="4">
          <div class="metric-card" :class="{ 'is-alarm': m.alarm }">
            <span class="m-label">{{ m.label }}</span>
            <span class="m-value" :class="{ 'alarm-value': m.alarm }">{{ m.value }}<em>{{ m.unit }}</em></span>
            <span v-if="m.threshold" class="m-threshold">阈值 {{ m.threshold }} {{ m.unit }}</span>
            <el-tag v-if="m.alarm" type="danger" size="small" effect="dark">超标</el-tag>
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
              <div class="grade-ring" :class="{ 'grade-ring-alarm': data.doAlarm }">
                <span class="grade-num">{{ data.grade.num }}</span>
                <em>类水</em>
              </div>
              <div class="grade-info">
                <p>{{ data.grade.desc }}</p>
                <el-tag :type="data.grade.tagType" effect="light">{{ data.grade.tag }}</el-tag>
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

.point-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.point-bar-label { font-size: 14px; font-weight: 600; color: var(--samp-text-secondary); white-space: nowrap; }
.opt-row { display: flex; align-items: center; gap: 8px; }
.opt-name { font-weight: 600; }
.opt-do { color: var(--samp-text-secondary); font-size: 12px; }

.alarm-alert {
  margin-bottom: 16px;
  animation: alertIn 0.5s ease backwards, alertGlow 2.2s ease-in-out 0.5s infinite;
}

@keyframes alertIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes alertGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
  50% { box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.12); }
}

.metric-card {
  position: relative;
  overflow: hidden;
  display: flex; flex-direction: column; gap: 8px; padding: 18px 16px; margin-bottom: 16px;
  background: #fff; border: 1px solid var(--samp-border); border-radius: 14px;
  border-top: 4px solid #0ea5e9; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  animation: riseIn 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.12);
}
/* 指标卡片依次错落入场 */
.el-row > .el-col:nth-child(1) .metric-card { border-top-color:#0ea5e9; background:linear-gradient(160deg,#ecfeff,#fff 70%); animation-delay: 0ms; }
.el-row > .el-col:nth-child(2) .metric-card { border-top-color:#16a34a; background:linear-gradient(160deg,#f0fdf4,#fff 70%); animation-delay: 50ms; }
.el-row > .el-col:nth-child(3) .metric-card { border-top-color:#f59e0b; background:linear-gradient(160deg,#fffbeb,#fff 70%); animation-delay: 100ms; }
.el-row > .el-col:nth-child(4) .metric-card { border-top-color:#e11d48; background:linear-gradient(160deg,#fff1f2,#fff 70%); animation-delay: 150ms; }
.el-row > .el-col:nth-child(5) .metric-card { border-top-color:#0891b2; background:linear-gradient(160deg,#ecfeff,#fff 70%); animation-delay: 200ms; }
.el-row > .el-col:nth-child(6) .metric-card { border-top-color:#2563eb; background:linear-gradient(160deg,#eff6ff,#fff 70%); animation-delay: 250ms; }
.metric-card.is-alarm {
  border-color: #fecdd3;
  border-top-color: #e11d48 !important;
  background: linear-gradient(160deg, #fff1f2, #fff 70%) !important;
  animation: riseIn 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards, alarmPulse 1.8s ease-in-out infinite;
}

@keyframes alarmPulse {
  0%, 100% { box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04); }
  50% { box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.12); }
}
.m-label { font-size: 14px; font-weight: 600; color: var(--samp-text-secondary); }
.m-value { font-size: 28px; font-weight: 800; color: var(--samp-text-main); }
.m-value em { font-style: normal; font-size: 13px; font-weight: 500; color: var(--samp-text-secondary); margin-left: 3px; }
.alarm-value { color: #e11d48; animation: valueBlink 1.6s ease-in-out infinite; }

@keyframes valueBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.m-threshold { font-size: 12px; color: var(--samp-text-secondary); }

.chart-card { margin-bottom: 16px; animation: riseIn 0.5s 0.12s ease backwards; }
.chart-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; }
.lg { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--samp-text-secondary); }
.lg i { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

.grade-box { display: flex; align-items: center; gap: 20px; padding: 8px 0; }
.grade-ring {
  width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; background: linear-gradient(135deg, #0ea5e9, #0284c7);
  box-shadow: 0 0 0 6px rgba(14, 165, 233, 0.12);
  animation: ringBreathe 2.4s ease-in-out infinite;
}
.grade-ring.grade-ring-alarm {
  background: linear-gradient(135deg, #f43f5e, #be123c);
  box-shadow: 0 0 0 6px rgba(244, 63, 94, 0.16);
}

@keyframes ringBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .metric-card,
  .chart-card,
  .grade-ring,
  .alarm-alert,
  .alarm-value {
    animation: none !important;
    transition: none !important;
  }
}
.grade-num { font-size: 28px; font-weight: 700; line-height: 1; }
.grade-ring em { font-style: normal; font-size: 12px; margin-top: 2px; }
.grade-info p { margin: 0 0 10px; font-size: 13px; color: var(--samp-text-secondary); line-height: 1.6; }
</style>
