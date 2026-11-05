<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] }, // [{ name, data: [], color }]
  height: { type: Number, default: 240 },
  unit: { type: String, default: '' },
  type: { type: String, default: 'line' }, // 'line' | 'bar'
  showArea: { type: Boolean, default: true },
})

const container = ref(null)
const width = ref(600)

let observer = null

function measure() {
  if (container.value) width.value = container.value.clientWidth || 600
}

onMounted(() => {
  measure()
  if (window.ResizeObserver) {
    observer = new ResizeObserver(measure)
    observer.observe(container.value)
  } else {
    window.addEventListener('resize', measure)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  else window.removeEventListener('resize', measure)
})

const pad = { top: 14, right: 12, bottom: 26, left: 44 }

const innerW = computed(() => Math.max(10, width.value - pad.left - pad.right))
const innerH = computed(() => Math.max(10, props.height - pad.top - pad.bottom))

const allValues = computed(() => props.series.flatMap((s) => s.data || []))

const minMax = computed(() => {
  const vals = allValues.value
  if (!vals.length) return { min: 0, max: 1 }
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  if (min === max) return { min: min - 1, max: max + 1 }
  const margin = (max - min) * 0.12
  return { min: min - margin, max: max + margin }
})

const n = computed(() => {
  const len = props.labels.length
  if (len) return len
  return Math.max(...props.series.map((s) => (s.data || []).length), 0)
})

function x(i) {
  if (n.value <= 1) return pad.left
  return pad.left + (i * innerW.value) / (n.value - 1)
}

function y(v) {
  const { min, max } = minMax.value
  return pad.top + ((max - v) / (max - min)) * innerH.value
}

const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => {
  const { min, max } = minMax.value
  const v = max - (max - min) * t
  return { v, y: y(v) }
})

const xTicks = computed(() => {
  const step = Math.max(1, Math.ceil(n.value / 6))
  const ticks = []
  for (let i = 0; i < n.value; i += step) ticks.push(i)
  if (ticks[ticks.length - 1] !== n.value - 1) ticks.push(n.value - 1)
  return ticks
})

function linePoints(data) {
  return data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
}

function areaPoints(data) {
  if (!data.length) return ''
  const first = `${x(0).toFixed(1)},${(pad.top + innerH.value).toFixed(1)}`
  const last = `${x(data.length - 1).toFixed(1)},${(pad.top + innerH.value).toFixed(1)}`
  return `${first} ${linePoints(data)} ${last}`
}

function barWidth() {
  const buckets = Math.max(1, n.value)
  return Math.min(44, (innerW.value / buckets) * 0.6)
}
</script>

<template>
  <div ref="container" class="trend-chart" :style="{ height: height + 'px' }">
    <svg v-if="width" :width="width" :height="height" class="chart-svg">
      <!-- 网格 -->
      <g>
        <template v-for="g in gridLines" :key="g.y">
          <line :x1="pad.left" :y1="g.y" :x2="width - pad.right" :y2="g.y" class="grid-line" />
          <text :x="pad.left - 8" :y="g.y + 4" class="axis-label" text-anchor="end">
            {{ Math.round(g.v) }}
          </text>
        </template>
      </g>

      <!-- X 轴标签 -->
      <g>
        <text
          v-for="i in xTicks"
          :key="i"
          :x="x(i)"
          :y="height - 6"
          class="axis-label"
          text-anchor="middle"
        >
          {{ labels[i] ?? '' }}
        </text>
      </g>

      <!-- 柱状 -->
      <g v-if="type === 'bar'">
        <rect
          v-for="(v, i) in (series[0]?.data || [])"
          :key="i"
          :x="x(i) - barWidth() / 2"
          :y="y(v)"
          :width="barWidth()"
          :height="pad.top + innerH - y(v)"
          :fill="series[0]?.color || '#16a34a'"
          rx="3"
        />
      </g>

      <!-- 折线 -->
      <template v-else>
        <g v-for="s in series" :key="s.name">
          <polyline v-if="showArea" :points="areaPoints(s.data)" :fill="s.color + '22'" stroke="none" />
          <polyline :points="linePoints(s.data)" fill="none" :stroke="s.color" stroke-width="2" class="line" />
          <circle
            v-for="(v, i) in s.data"
            :key="i"
            :cx="x(i)"
            :cy="y(v)"
            :r="2.5"
            :fill="s.color"
          />
        </g>
      </template>
    </svg>
  </div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  position: relative;
}

.chart-svg {
  display: block;
}

.grid-line {
  stroke: #eef0f4;
  stroke-width: 1;
}

.axis-label {
  font-size: 12px;
  fill: #8a93a0;
}

.line {
  transition: opacity 0.2s;
}
</style>