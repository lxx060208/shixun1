<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getLinkageStrategiesApi,
  toggleStrategyApi,
  toggleSceneTemplateApi,
  saveStrategyApi,
  deleteStrategyApi,
} from '@/api'

const loading = ref(true)
const strategies = ref([])
const templates = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增策略')
const saving = ref(false)
const form = reactive({
  id: '',
  name: '',
  target: '',
  logic: 'AND',
  action: '',
  conditions: [{ metric: '空气温度', operator: '>', value: 30, unit: '℃' }],
})

const metricOptions = [
  { label: '空气温度', unit: '℃' },
  { label: '空气湿度', unit: '%' },
  { label: '土壤湿度', unit: '%' },
  { label: '光照强度', unit: 'klx' },
  { label: 'CO₂浓度', unit: 'ppm' },
  { label: '溶解氧', unit: 'mg/L' },
  { label: '水温', unit: '℃' },
]

const operatorOptions = ['>', '<', '>=', '<=', '=']

const targetOptions = [
  '1 号大棚水泵', '1 号大棚风机', '1 号大棚卷帘', '1 号大棚补光灯',
  '2 号大棚水泵', '2 号大棚风机', '2 号大棚卷帘', '2 号大棚补光灯',
  '3 号大棚风机', '3 号大棚卷帘', '3 号大棚补光灯',
  '4 号大棚水泵', '4 号大棚风机', '4 号大棚卷帘', '4 号大棚补光灯',
  '5 号大棚水泵', '5 号大棚风机', '5 号大棚卷帘', '5 号大棚补光灯',
  '6 号大棚水泵', '6 号大棚风机', '6 号大棚卷帘', '6 号大棚补光灯',
  'B-01 增氧机', 'Q-04 增氧机', 'H-01 灌溉水泵', 'H-04 增氧机',
]

function logicType(logic) {
  return { AND: 'danger', OR: 'warning', 定时: 'info' }[logic] || 'info'
}

async function toggleStrategy(row) {
  try {
    await toggleStrategyApi(row.id, row.enabled)
    ElMessage.success(`策略「${row.name}」已${row.enabled ? '启用' : '停用'}`)
  } catch (e) {
    row.enabled = !row.enabled
    ElMessage.error(e.message || '操作失败')
  }
}

async function toggleTemplate(row) {
  try {
    await toggleSceneTemplateApi(row.id, row.enabled)
    ElMessage.success(`场景模板「${row.name}」已${row.enabled ? '启用' : '停用'}`)
  } catch (e) {
    row.enabled = !row.enabled
    ElMessage.error(e.message || '操作失败')
  }
}

function openCreate() {
  dialogTitle.value = '新增策略'
  Object.assign(form, {
    id: '',
    name: '',
    target: '',
    logic: 'AND',
    action: '',
    conditions: [{ metric: '空气温度', operator: '>', value: 30, unit: '℃' }],
  })
  dialogVisible.value = true
}

function openEdit(row) {
  dialogTitle.value = '编辑策略'
  Object.assign(form, {
    id: row.id,
    name: row.name,
    target: row.target,
    logic: row.logic,
    action: row.action,
    conditions: row.conditions.map((c) => ({ ...c })),
  })
  dialogVisible.value = true
}

function addCondition() {
  form.conditions.push({ metric: '土壤湿度', operator: '<', value: 40, unit: '%' })
}

function removeCondition(idx) {
  if (form.conditions.length <= 1) {
    ElMessage.warning('至少保留一个触发条件')
    return
  }
  form.conditions.splice(idx, 1)
}

function onMetricChange(cond) {
  const m = metricOptions.find((i) => i.label === cond.metric)
  if (m) cond.unit = m.unit
}

async function saveStrategy() {
  if (!form.name.trim()) {
    ElMessage.warning('请填写策略名称')
    return
  }
  if (!form.target) {
    ElMessage.warning('请选择控制目标')
    return
  }
  if (!form.action.trim()) {
    ElMessage.warning('请填写执行动作')
    return
  }
  saving.value = true
  try {
    await saveStrategyApi({ ...form, conditions: form.conditions.map((c) => ({ ...c })) })
    ElMessage.success(form.id ? '策略已更新' : '策略已创建')
    dialogVisible.value = false
    await loadData()
  } finally {
    saving.value = false
  }
}

async function removeStrategy(row) {
  try {
    await ElMessageBox.confirm(`确认删除策略「${row.name}」？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await deleteStrategyApi(row.id)
  ElMessage.success('策略已删除')
  await loadData()
}

async function loadData() {
  const data = await getLinkageStrategiesApi()
  strategies.value = data.strategies
  templates.value = data.templates
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">自动联动策略配置</h2>
      <el-button type="primary" icon="Plus" @click="openCreate">新增策略</el-button>
    </div>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="table-title">联动策略列表</span>
          <span class="header-tip">阈值触发 · 且/或逻辑 · 定时任务</span>
        </div>
      </template>
      <el-table :data="strategies" stripe>
        <el-table-column prop="name" label="策略名称" min-width="130" />
        <el-table-column label="触发条件" min-width="280">
          <template #default="{ row }">
            <div class="condition-list">
              <template v-for="(c, i) in row.conditions" :key="i">
                <el-tag size="small" effect="plain" class="cond-tag">
                  {{ c.metric }} {{ c.operator }} {{ c.value }}{{ c.unit }}
                </el-tag>
                <el-tag
                  v-if="i < row.conditions.length - 1"
                  :type="logicType(row.logic)"
                  size="small"
                  class="logic-tag"
                >
                  {{ row.logic === 'AND' ? '且' : row.logic === 'OR' ? '或' : row.logic }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="控制目标" min-width="160" />
        <el-table-column prop="action" label="执行动作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="lastTrigger" label="最近触发" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ row.lastTrigger }}</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleStrategy(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeStrategy(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span class="table-title">场景模板</span>
          <span class="header-tip">预置常用场景，一键套用</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col v-for="tpl in templates" :key="tpl.id" :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="tpl-card" :class="{ active: tpl.enabled }">
            <div class="tpl-head">
              <span class="tpl-name">{{ tpl.name }}</span>
              <el-switch v-model="tpl.enabled" @change="toggleTemplate(tpl)" />
            </div>
            <div class="tpl-desc">{{ tpl.description }}</div>
            <div class="tpl-devices">
              <el-icon size="14"><Connection /></el-icon>
              <span>{{ tpl.devices }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="策略名称" required>
          <el-input v-model="form.name" placeholder="如：高温自动通风" />
        </el-form-item>
        <el-form-item label="控制目标" required>
          <el-select v-model="form.target" placeholder="选择设备" filterable style="width: 100%">
            <el-option v-for="t in targetOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="条件逻辑">
          <el-radio-group v-model="form.logic">
            <el-radio-button value="AND">且（全部满足）</el-radio-button>
            <el-radio-button value="OR">或（任一满足）</el-radio-button>
            <el-radio-button value="定时">定时任务</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="触发条件">
          <div class="cond-editor">
            <div v-for="(cond, idx) in form.conditions" :key="idx" class="cond-row">
              <el-select v-model="cond.metric" style="width: 130px" @change="onMetricChange(cond)">
                <el-option v-for="m in metricOptions" :key="m.label" :label="m.label" :value="m.label" />
              </el-select>
              <el-select v-model="cond.operator" style="width: 80px">
                <el-option v-for="op in operatorOptions" :key="op" :label="op" :value="op" />
              </el-select>
              <el-input-number v-model="cond.value" :step="1" style="width: 130px" />
              <span class="cond-unit">{{ cond.unit }}</span>
              <el-button link type="danger" icon="Delete" @click="removeCondition(idx)" />
            </div>
            <el-button link type="primary" icon="Plus" @click="addCondition">添加条件</el-button>
          </div>
        </el-form-item>
        <el-form-item label="执行动作" required>
          <el-input v-model="form.action" placeholder="如：开启风机与卷帘通风降温" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveStrategy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-weight: 600;
}

.header-tip {
  font-size: 12px;
  color: #868e96;
}

.condition-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.cond-tag {
  max-width: 180px;
}

.logic-tag {
  font-weight: 700;
}

.time-text {
  font-size: 12px;
  color: #868e96;
}

.tpl-card {
  margin-bottom: 16px;
  border: 1px solid transparent;
}

.tpl-card.active {
  border-color: #2f9e44;
  background: #f4fbf5;
}

.tpl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tpl-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.tpl-desc {
  font-size: 12px;
  color: #495057;
  line-height: 1.6;
  min-height: 38px;
  margin-bottom: 8px;
}

.tpl-devices {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #868e96;
}

.cond-editor {
  width: 100%;
}

.cond-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cond-unit {
  font-size: 12px;
  color: #868e96;
  min-width: 40px;
}
</style>
