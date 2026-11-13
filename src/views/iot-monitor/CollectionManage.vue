<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDevicesApi, saveDeviceApi, deleteDeviceApi, toggleDeviceApi, getHistoryApi } from '@/api/iot'

const route = useRoute()

const loading = ref(true)
const devices = ref([])
const onlyOffline = ref(false)

// 设备表单
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const form = reactive({ id: null, name: '', type: 'air', location: '', frequency: 60 })

const typeOptions = [
  { value: 'air', label: '空气' },
  { value: 'soil', label: '土壤' },
  { value: 'water', label: '水质' },
  { value: 'weather', label: '气象' },
  { value: 'camera', label: '视频' },
]

const rules = {
  name: [{ required: true, message: '请输入传感器名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// 历史查询
const historyType = ref('all')
const historyKeyword = ref('')
const historyRows = ref([])
const historyTotal = ref(0)
const historyPage = ref(1)
const pageSize = 10

const disabledMap = { online: 'offline', offline: 'online' }

const filteredDevices = computed(() =>
  onlyOffline.value ? devices.value.filter((d) => d.status === 'offline') : devices.value
)

async function loadDevices() {
  devices.value = await getDevicesApi()
}

async function queryHistory() {
  const res = await getHistoryApi({
    type: historyType.value,
    keyword: historyKeyword.value,
    page: historyPage.value,
    pageSize,
  })
  historyRows.value = res.rows
  historyTotal.value = res.total
  const maxPage = Math.max(1, Math.ceil(res.total / pageSize))
  if (historyPage.value > maxPage) {
    historyPage.value = maxPage
    return queryHistory()
  }
}

async function loadAll() {
  loading.value = true
  await loadDevices()
  await queryHistory()
  loading.value = false
}

function resetForm() {
  Object.assign(form, { id: null, name: '', type: 'air', location: '', frequency: 60 })
}

function openAdd() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  await saveDeviceApi({ ...form })
  saving.value = false
  dialogVisible.value = false
  ElMessage.success('保存成功')
  await loadDevices()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除传感器「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteDeviceApi(row.id)
  ElMessage.success('已删除')
  await loadDevices()
}

async function handleToggle(row) {
  await toggleDeviceApi(row.id)
  ElMessage.success(row.status === 'online' ? '已标记为掉线' : '已恢复在线')
  await loadDevices()
}

function searchHistory() {
  historyPage.value = 1
  queryHistory()
}

onMounted(() => {
  const t = route.query.type
  if (['air', 'soil', 'water', 'weather'].includes(t)) {
    historyType.value = t
  }
  loadAll()
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <div>
        <h3 class="page-title">采集管理与历史查询</h3>
        <p class="page-subtitle">传感器注册 · 采集频率配置 · 掉线检测 · 分页历史数据</p>
      </div>
      <el-button type="primary" :icon="'Plus'" @click="openAdd">新增传感器</el-button>
    </div>

    <!-- 设备管理 -->
    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head">
          <span class="panel-title">传感器设备</span>
          <el-switch v-model="onlyOffline" active-text="仅看掉线" style="--el-switch-on-color: #e11d48" />
        </div>
      </template>
      <el-table :data="filteredDevices" size="small" stripe>
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag size="small" effect="light">{{ row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" min-width="120" />
        <el-table-column label="采集频率" width="110">
          <template #default="{ row }">
            <span v-if="row.frequency">{{ row.frequency }} 秒</span>
            <el-tag v-else size="small" type="info">实时</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastOnline" label="最后在线" min-width="150" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small" effect="light">
              {{ row.status === 'online' ? '在线' : '掉线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link :type="row.status === 'online' ? 'warning' : 'success'" size="small" @click="handleToggle(row)">
              {{ disabledMap[row.status] === 'offline' ? '标记掉线' : '恢复在线' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 历史查询 -->
    <el-card shadow="never" class="block">
      <template #header><span class="panel-title">历史数据查询</span></template>
      <div class="toolbar">
        <el-select v-model="historyType" placeholder="数据类型" style="width: 140px" @change="searchHistory">
          <el-option label="全部类型" value="all" />
          <el-option label="空气" value="air" />
          <el-option label="土壤" value="soil" />
          <el-option label="水质" value="water" />
          <el-option label="气象" value="weather" />
        </el-select>
        <el-input
          v-model="historyKeyword"
          placeholder="搜索设备/参数/类型"
          clearable
          style="width: 220px"
          :prefix-icon="'Search'"
          @keyup.enter="searchHistory"
          @clear="searchHistory"
        />
        <el-button type="primary" :icon="'Search'" @click="searchHistory">查询</el-button>
      </div>
      <el-table :data="historyRows" size="small" stripe>
        <el-table-column prop="time" label="采集时间" min-width="150" />
        <el-table-column prop="deviceId" label="设备编号" width="110" />
        <el-table-column prop="deviceName" label="设备名称" min-width="130" />
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="param" label="参数" width="100" />
        <el-table-column label="数值" width="100">
          <template #default="{ row }">{{ row.value }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'warning'" size="small" effect="light">
              {{ row.status === 'normal' ? '正常' : '偏高' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="historyPage"
          :page-size="pageSize"
          :total="historyTotal"
          background
          layout="total, prev, pager, next"
          @current-change="queryHistory"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑传感器' : '新增传感器'" width="460px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：空气站-A2" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="如：2号温室" />
        </el-form-item>
        <el-form-item label="采集频率">
          <el-input-number v-model="form.frequency" :min="10" :max="3600" :step="10" />
          <span class="freq-tip">秒/次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; }

.block { margin-bottom: 16px; }

.card-head { display: flex; align-items: center; justify-content: space-between; }

.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }

.pager { display: flex; justify-content: flex-end; margin-top: 14px; }

.freq-tip { margin-left: 10px; font-size: 12px; color: var(--samp-text-secondary); }
</style>