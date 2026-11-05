<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGisParksApi } from '@/api'

const loading = ref(true)
const parks = ref([])
const activeParkId = ref(null)

const activePark = computed(() => parks.value.find((p) => p.id === activeParkId.value) || { plots: [], greenhouses: [], sensors: [] })

const typeColor = { 空气: '#1c7ed6', 土壤: '#e8590c', 水体: '#0ca678', 设备: '#7048e8' }

const dialogVisible = ref(false)
const currentPoint = ref(null)

function plotXY(plot) {
  const [x, y] = plot.points.split(' ')[0].split(',').map(Number)
  return { x, y }
}

function openSensor(sensor) {
  currentPoint.value = { name: sensor.name, type: sensor.type, online: sensor.online, data: sensor.data }
  dialogVisible.value = true
}

function openGreenhouse(gh) {
  currentPoint.value = {
    name: gh.name,
    type: '大棚',
    online: true,
    data: { '所属地块': gh.plot, '空气温度': '24.2℃', '空气湿度': '63%', '土壤湿度': '40%', '光照强度': '31klx' },
  }
  dialogVisible.value = true
}

function openPlot(plot) {
  currentPoint.value = {
    name: plot.name,
    type: '地块',
    online: true,
    data: { '种植作物': plot.crop, '种植面积': `${plot.area}亩`, '空气温度': '24.8℃', '土壤湿度': '42%', '预计采收': '12月中旬' },
  }
  dialogVisible.value = true
}

const currentPointRef = currentPoint

onMounted(async () => {
  parks.value = await getGisParksApi()
  activeParkId.value = parks.value[0]?.id
  loading.value = false
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">GIS园区地图总览</h2>
      <div class="legend">
        <el-radio-group v-model="activeParkId" size="small">
          <el-radio-button v-for="p in parks" :key="p.id" :value="p.id">{{ p.name }}</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-card shadow="never">
      <div class="legend-bar">
        <span class="legend-item"><i class="dot" style="background:#1c7ed6"></i>空气传感器</span>
        <span class="legend-item"><i class="dot" style="background:#e8590c"></i>土壤传感器</span>
        <span class="legend-item"><i class="dot" style="background:#0ca678"></i>水质传感器</span>
        <span class="legend-item"><i class="dot" style="background:#7048e8"></i>设备</span>
        <span class="legend-item"><i class="dot house" style="background:#2f9e44"></i>智能大棚</span>
        <span class="legend-item"><i class="dot" style="background:#adb5bd"></i>离线</span>
      </div>
      <div class="map-wrap">
        <svg viewBox="0 0 620 440" class="map-svg">
          <!-- 背景 -->
          <rect x="0" y="0" width="620" height="440" fill="#f4f9f4" rx="8" />
          <!-- 道路 -->
          <line x1="0" y1="210" x2="620" y2="210" stroke="#dee2e6" stroke-width="10" />
          <line x1="310" y1="0" x2="310" y2="440" stroke="#dee2e6" stroke-width="8" stroke-dasharray="14 10" opacity="0.6" />
          <!-- 地块 -->
          <g v-for="plot in activePark.plots" :key="plot.id" class="plot" @click="openPlot(plot)">
            <polygon :points="plot.points" :fill="plot.color" stroke="#94a59a" stroke-width="1.5" />
            <text :x="plotXY(plot).x + 12" :y="plotXY(plot).y + 26" class="plot-label">{{ plot.name }}</text>
            <text :x="plotXY(plot).x + 12" :y="plotXY(plot).y + 44" class="plot-sub">{{ plot.crop }} · {{ plot.area }}亩</text>
          </g>
          <!-- 大棚 -->
          <g v-for="gh in activePark.greenhouses" :key="gh.id" class="marker" @click="openGreenhouse(gh)">
            <rect :x="gh.x - 10" :y="gh.y - 8" width="20" height="16" rx="3" fill="#2f9e44" stroke="#1f3a2d" />
            <text :x="gh.x" :y="gh.y + 24" text-anchor="middle" class="marker-label">{{ gh.name }}</text>
          </g>
          <!-- 传感器/设备点位 -->
          <g v-for="s in activePark.sensors" :key="s.id" class="marker" @click="openSensor(s)">
            <circle :cx="s.x" :cy="s.y" r="9" :fill="s.online ? typeColor[s.type] : '#adb5bd'" stroke="#fff" stroke-width="2" />
            <circle :cx="s.x" :cy="s.y" r="14" fill="none" :stroke="s.online ? typeColor[s.type] : '#adb5bd'" stroke-opacity="0.35" class="pulse" />
          </g>
        </svg>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="currentPointRef?.name" width="420px">
      <div class="dialog-head">
        <el-tag v-if="currentPointRef" :type="currentPointRef.online ? 'success' : 'info'" effect="dark" size="small">
          {{ currentPointRef.online ? '在线' : '离线' }}
        </el-tag>
        <el-tag v-if="currentPointRef" effect="plain" size="small" style="margin-left:8px">{{ currentPointRef.type }}</el-tag>
      </div>
      <el-descriptions v-if="currentPointRef" :column="2" border class="dialog-desc">
        <el-descriptions-item v-for="(val, key) in currentPointRef.data" :key="key" :label="key">{{ val }}</el-descriptions-item>
      </el-descriptions>
      <p class="dialog-time">更新时间：{{ new Date().toLocaleString('zh-CN') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.legend-item {
  font-size: 13px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.dot.house {
  border-radius: 3px;
}

.map-wrap {
  overflow: auto;
}

.map-svg {
  width: 100%;
  min-width: 620px;
}

.plot {
  cursor: pointer;
}

.plot:hover polygon {
  filter: brightness(0.94);
}

.plot-label {
  font-size: 14px;
  font-weight: 600;
  fill: #1f3a2d;
}

.plot-sub {
  font-size: 12px;
  fill: #5f6b63;
}

.marker {
  cursor: pointer;
}

.marker-label {
  font-size: 11px;
  fill: #495057;
}

.pulse {
  animation: pulse 2s infinite;
  transform-origin: center;
}

@keyframes pulse {
  0% { stroke-opacity: 0.5; stroke-width: 1; }
  50% { stroke-opacity: 0.1; stroke-width: 4; }
  100% { stroke-opacity: 0.5; stroke-width: 1; }
}

.dialog-head {
  margin-bottom: 12px;
}

.dialog-desc {
  margin-bottom: 12px;
}

.dialog-time {
  font-size: 12px;
  color: #adb5bd;
  margin: 0;
}
</style>
