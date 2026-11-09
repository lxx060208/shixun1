<script setup>
import { reactive, ref } from 'vue'

// 图层开关：边界始终显示，其余图层可开关
const layers = reactive({
  sensor: true,
  pipe: false,
  video: true,
})

const plots = [
  { id: 'A-01', name: 'A-01 大田', crop: '水稻', area: 120, color: '#d3f9d8', points: '60,60 300,60 300,200 60,200' },
  { id: 'A-02', name: 'A-02 蔬菜大棚区', crop: '番茄', area: 180, color: '#e7f5ff', points: '320,60 560,60 560,200 320,200' },
  { id: 'B-01', name: 'B-01 葡萄园', crop: '葡萄', area: 200, color: '#f3f0ff', points: '60,220 240,220 240,380 60,380' },
  { id: 'B-02', name: 'B-02 草莓园', crop: '草莓', area: 120, color: '#fff0f6', points: '260,220 560,220 560,380 260,380' },
]

const sensors = [
  { id: 'A-03', name: 'A-03 土壤传感器', type: '土壤', x: 130, y: 120 },
  { id: 'A-04', name: 'A-04 空气温湿度传感器', type: '空气', x: 430, y: 160 },
  { id: 'B-01-S', name: 'B-01 水质传感器', type: '水体', x: 130, y: 300 },
  { id: 'B-03', name: 'B-03 土壤传感器', type: '土壤', x: 360, y: 320 },
]

const pipelines = [
  { id: 'P1', d: 'M60,140 L560,140' },
  { id: 'P2', d: 'M60,280 L560,280' },
  { id: 'P3', d: 'M180,60 L180,380' },
  { id: 'P4', d: 'M420,60 L420,380' },
]

const videos = [
  { id: 'G-1', name: '1 号大棚监控', x: 200, y: 120 },
  { id: 'G-2', name: '2 号大棚监控', x: 480, y: 130 },
  { id: 'G-3', name: 'B-02 草莓园监控', x: 420, y: 300 },
]

const selected = ref(null)
const rubberBand = ref(false)

function selectPlot(p) {
  selected.value = p
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">地块 GIS 地图</h2>
      <span class="page-desc">地块边界绘制、图层叠加管理，点击地块查看详情</span>
    </div>

    <div class="gis-layout">
      <el-card shadow="never" class="layer-panel">
        <template #header>
          <span class="panel-title">图层管理</span>
        </template>
        <div class="layer-item">
          <el-checkbox :model-value="true" disabled>地块边界</el-checkbox>
        </div>
        <div class="layer-item">
          <el-checkbox v-model="layers.sensor">环境传感器</el-checkbox>
        </div>
        <div class="layer-item">
          <el-checkbox v-model="layers.pipe">灌溉管线</el-checkbox>
        </div>
        <div class="layer-item">
          <el-checkbox v-model="layers.video">视频监控点</el-checkbox>
        </div>

        <el-divider />

        <div class="legend-title">图例</div>
        <div class="legend-item"><span class="dot" style="background:#16a34a"></span>环境传感器</div>
        <div class="legend-item"><span class="line-sample"></span>灌溉管线</div>
        <div class="legend-item"><span class="rect-sample"></span>视频监控点</div>

        <el-divider />

        <el-button class="rubber-btn" :type="rubberBand ? 'primary' : 'default'" @click="rubberBand = !rubberBand">
          <el-icon><Aim /></el-icon>框选查看
        </el-button>
        <div class="rubber-tip">开启后在地图上拖拽鼠标，可框选多个地块（示意）</div>
      </el-card>

      <el-card shadow="never" class="map-card">
        <svg :class="{ 'rubber-band': rubberBand }" viewBox="0 0 620 420" xmlns="http://www.w3.org/2000/svg" class="map-svg">
          <rect x="0" y="0" width="620" height="420" fill="#f7f9fb" />

          <!-- 灌溉管线 -->
          <g v-if="layers.pipe" class="pipe-layer">
            <path v-for="p in pipelines" :key="p.id" :d="p.d" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" />
          </g>

          <!-- 地块边界 -->
          <g v-for="p in plots" :key="p.id">
            <polygon
              :points="p.points"
              :fill="selected?.id === p.id ? p.color : p.color"
              :stroke="selected?.id === p.id ? '#16a34a' : '#94a3b8'"
              :stroke-width="selected?.id === p.id ? 3 : 1.5"
              class="plot-poly"
              @click="selectPlot(p)"
            />
            <text :x="p.id === 'A-01' ? 160 : p.id === 'A-02' ? 430 : p.id === 'B-01' ? 150 : 390" :y="p.id.startsWith('A') ? 140 : 310" text-anchor="middle" class="plot-label">{{ p.name }}</text>
          </g>

          <!-- 环境传感器 -->
          <g v-if="layers.sensor" class="sensor-layer">
            <g v-for="s in sensors" :key="s.id">
              <circle :cx="s.x" :cy="s.y" r="14" fill="#16a34a" opacity="0.15" />
              <circle :cx="s.x" :cy="s.y" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
            </g>
          </g>

          <!-- 视频监控点 -->
          <g v-if="layers.video" class="video-layer">
            <g v-for="v in videos" :key="v.id">
              <rect :x="v.x - 9" :y="v.y - 9" width="18" height="18" rx="4" fill="#1c7ed6" stroke="#fff" stroke-width="2" />
            </g>
          </g>
        </svg>
        <div class="map-tip">示意地图 · 无真实地图服务，采用 SVG 矢量模拟</div>
      </el-card>

      <el-card shadow="never" class="detail-panel">
        <template #header>
          <span class="panel-title">地块详情</span>
        </template>
        <template v-if="selected">
          <div class="detail-title">{{ selected.name }}</div>
          <div class="detail-row"><span>地块编码</span><b>{{ selected.id }}</b></div>
          <div class="detail-row"><span>种植作物</span><b>{{ selected.crop }}</b></div>
          <div class="detail-row"><span>面积</span><b>{{ selected.area }} 亩</b></div>
          <div class="detail-row"><span>所属园区</span><b>南山智慧农业示范园</b></div>
        </template>
        <el-empty v-else description="点击左侧地图中的地块查看详情" :image-size="80" />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.gis-layout {
  display: grid;
  grid-template-columns: 220px 1fr 240px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .gis-layout {
    grid-template-columns: 1fr;
  }
}

.layer-panel,
.map-card,
.detail-panel {
  border: none;
}

.panel-title {
  font-weight: 600;
}

.layer-item {
  margin-bottom: 12px;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5c6470;
  margin-bottom: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.line-sample {
  width: 16px;
  height: 0;
  border-top: 3px dashed #38bdf8;
  display: inline-block;
}

.rect-sample {
  width: 12px;
  height: 12px;
  background: #1c7ed6;
  border-radius: 3px;
  display: inline-block;
}

.rubber-btn {
  width: 100%;
}

.rubber-tip {
  font-size: 12px;
  color: #868e96;
  margin-top: 10px;
  line-height: 1.5;
}

.map-svg {
  width: 100%;
  height: auto;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  display: block;
}

.map-svg.rubber-band {
  cursor: crosshair;
}

.plot-poly {
  cursor: pointer;
  transition: stroke-width 0.15s;
}

.plot-label {
  font-size: 13px;
  fill: #1f2d3d;
  font-weight: 600;
  pointer-events: none;
}

.map-tip {
  font-size: 12px;
  color: #adb5bd;
  text-align: center;
  margin-top: 10px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
  margin-bottom: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #e9ecef;
  font-size: 13px;
}

.detail-row span {
  color: #868e96;
}

.detail-row b {
  color: #1f2d3d;
  font-weight: 600;
}
</style>