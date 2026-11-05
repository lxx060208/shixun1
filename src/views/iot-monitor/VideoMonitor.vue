<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getVideoApi } from '@/api/iot'

const loading = ref(true)
const channels = ref([])
const layout = ref('four') // single | four | six

const gridCols = computed(() => {
  if (layout.value === 'single') return 'repeat(1, 1fr)'
  if (layout.value === 'four') return 'repeat(2, 1fr)'
  return 'repeat(3, 1fr)'
})

async function load() {
  loading.value = true
  const data = await getVideoApi()
  channels.value = data.channels
  loading.value = false
}

function snapshot(ch) {
  ElMessage.success(`已抓拍 ${ch.name} 画面`)
}

function playback(ch) {
  ElMessage.info(`正在回放 ${ch.name} 近 24 小时录像`)
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">视频监控</h3>
        <p class="page-subtitle">多画面分割 · 录像回放 · 抓拍</p>
      </div>
      <el-radio-group v-model="layout">
        <el-radio-button value="single">单画面</el-radio-button>
        <el-radio-button value="four">四分屏</el-radio-button>
        <el-radio-button value="six">六分屏</el-radio-button>
      </el-radio-group>
    </div>

    <div class="video-grid" :style="{ gridTemplateColumns: gridCols }">
      <div v-for="ch in channels" :key="ch.id" class="video-card">
        <div class="screen" :class="{ offline: ch.status === 'offline' }">
          <el-icon :size="44" class="screen-icon"><VideoCamera /></el-icon>
          <span v-if="ch.status === 'online'" class="live-badge">LIVE</span>
          <span v-else class="offline-badge">信号中断</span>
          <div class="scan" />
        </div>
        <div class="video-foot">
          <div class="v-info">
            <span class="v-name">{{ ch.name }}</span>
            <span class="v-loc">{{ ch.location }}</span>
          </div>
          <div class="v-actions">
            <el-button size="small" :icon="'Camera'" @click="snapshot(ch)">抓拍</el-button>
            <el-button size="small" :icon="'VideoPlay'" :disabled="ch.status !== 'online'" @click="playback(ch)">回放</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; }

.video-grid {
  display: grid;
  gap: 16px;
}

.video-card {
  background: #fff;
  border: 1px solid var(--samp-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.screen {
  position: relative;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2937, #111827);
  overflow: hidden;
}

.screen.offline { background: linear-gradient(135deg, #374151, #1f2937); }

.screen-icon { color: rgba(255, 255, 255, 0.35); }

.live-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  background: #e11d48;
  border-radius: 4px;
}

.offline-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 2px 8px;
  font-size: 11px;
  color: #fff;
  background: #6b7280;
  border-radius: 4px;
}

.scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.7), transparent);
  animation: scan 3s linear infinite;
}

@keyframes scan {
  0% { top: 6%; }
  100% { top: 92%; }
}

.video-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
}

.v-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.v-name { font-weight: 600; color: var(--samp-text-main); font-size: 14px; }
.v-loc { font-size: 12px; color: var(--samp-text-secondary); }

.v-actions { display: flex; gap: 8px; flex-shrink: 0; }
</style>