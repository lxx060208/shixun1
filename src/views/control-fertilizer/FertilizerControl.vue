<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFertilizerApi,
  saveFormulaApi,
  deleteFormulaApi,
  applyFormulaApi,
  toggleMachineApi,
} from '@/api'

const loading = ref(true)
const formulas = ref([])
const machines = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增配方')
const saving = ref(false)
const form = reactive({
  id: '',
  name: '',
  crop: '',
  stage: '',
  n: 15,
  p: 5,
  k: 30,
  ec: 2.0,
  ph: 6.0,
  usage: '',
})

const applyVisible = ref(false)
const applyForm = reactive({ machineId: '', formulaName: '' })
const applyPending = ref(false)
const machinePending = ref({})

function machineStatusType(status) {
  return status === 'running' ? 'success' : 'info'
}

function npkTotal(f) {
  return f.n + f.p + f.k
}

function openCreate() {
  dialogTitle.value = '新增配方'
  Object.assign(form, { id: '', name: '', crop: '', stage: '', n: 15, p: 5, k: 30, ec: 2.0, ph: 6.0, usage: '' })
  dialogVisible.value = true
}

function openEdit(row) {
  dialogTitle.value = '编辑配方'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

async function saveFormula() {
  if (!form.name.trim() || !form.crop.trim()) {
    ElMessage.warning('请填写配方名称与适用作物')
    return
  }
  saving.value = true
  try {
    await saveFormulaApi({ ...form })
    ElMessage.success(form.id ? '配方已更新' : '配方已创建')
    dialogVisible.value = false
    await loadData()
  } finally {
    saving.value = false
  }
}

async function removeFormula(row) {
  try {
    await ElMessageBox.confirm(`确认删除配方「${row.name}」？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await deleteFormulaApi(row.id)
  ElMessage.success('配方已删除')
  await loadData()
}

function openApply(row) {
  applyForm.formulaName = row.name
  applyForm.machineId = ''
  applyVisible.value = true
}

async function confirmApply() {
  if (!applyForm.machineId) {
    ElMessage.warning('请选择水肥一体机')
    return
  }
  applyPending.value = true
  try {
    const m = await applyFormulaApi(applyForm.machineId, applyForm.formulaName)
    ElMessage.success(`配方「${applyForm.formulaName}」已下发至「${m.name}」`)
    applyVisible.value = false
    await loadData()
  } catch (e) {
    ElMessage.error(e.message || '下发失败')
  } finally {
    applyPending.value = false
  }
}

async function toggleMachine(machine) {
  const action = machine.status === 'running' ? 'stop' : 'start'
  const actionText = action === 'start' ? '启动' : '停止'
  try {
    await ElMessageBox.confirm(`确认${actionText}「${machine.name}」？`, '执行确认', {
      confirmButtonText: actionText,
      cancelButtonText: '取消',
      type: action === 'start' ? 'success' : 'warning',
    })
  } catch {
    return
  }
  machinePending.value[machine.id] = true
  try {
    const updated = await toggleMachineApi(machine.id, action)
    machine.status = updated.status
    machine.flowRate = updated.flowRate
    ElMessage.success(`「${machine.name}」${actionText}成功`)
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    machinePending.value[machine.id] = false
  }
}

async function loadData() {
  const data = await getFertilizerApi()
  formulas.value = data.formulas
  machines.value = data.machines
}

onMounted(async () => {
  await loadData()
  loading.value = false
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">水肥配方与一体机控制</h2>
      <el-button type="primary" icon="Plus" @click="openCreate">新增配方</el-button>
    </div>

    <el-card shadow="never" class="section-card">
      <template #header><span class="table-title">水肥一体机运行状态</span></template>
      <el-row :gutter="16">
        <el-col v-for="m in machines" :key="m.id" :xs="24" :sm="12" :md="8">
          <el-card shadow="hover" class="machine-card">
            <div class="machine-head">
              <span class="machine-name">{{ m.name }}</span>
              <el-tag :type="machineStatusType(m.status)" size="small">
                {{ m.status === 'running' ? '运行中' : '已停止' }}
              </el-tag>
            </div>
            <div class="machine-loc">
              <el-icon size="13"><Location /></el-icon>
              <span>{{ m.location }}</span>
              <el-tag size="small" effect="plain" :type="m.mode === '自动' ? 'primary' : 'warning'">{{ m.mode }}模式</el-tag>
            </div>
            <div class="machine-formula">
              当前配方：<el-tag type="success" size="small">{{ m.currentFormula }}</el-tag>
            </div>
            <el-row class="machine-metrics">
              <el-col :span="12">
                <div class="metric-label">瞬时流量</div>
                <div class="metric-value">{{ m.flowRate }}<span class="metric-unit">m³/h</span></div>
              </el-col>
              <el-col :span="12">
                <div class="metric-label">今日用水 / 用肥</div>
                <div class="metric-value small">{{ m.todayWater }}m³ / {{ m.todayFertilizer }}kg</div>
              </el-col>
            </el-row>
            <div class="tank-row">
              <span class="tank-label">母液罐液位</span>
              <el-progress
                :percentage="m.tankLevel"
                :status="m.tankLevel < 30 ? 'exception' : ''"
                class="tank-progress"
              />
            </div>
            <el-button
              :type="m.status === 'running' ? 'danger' : 'success'"
              size="small"
              class="machine-btn"
              :loading="machinePending[m.id]"
              @click="toggleMachine(m)"
            >
              {{ m.status === 'running' ? '停止水肥执行' : '启动水肥执行' }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="section-card">
      <template #header><span class="table-title">配方库（氮磷钾配比）</span></template>
      <el-table :data="formulas" stripe>
        <el-table-column prop="name" label="配方名称" min-width="140" />
        <el-table-column prop="crop" label="适用作物" width="90" />
        <el-table-column prop="stage" label="生育阶段" width="100" />
        <el-table-column label="N-P-K 配比" min-width="200">
          <template #default="{ row }">
            <div class="npk-cell">
              <span class="npk-text">{{ row.n }}-{{ row.p }}-{{ row.k }}</span>
              <div class="npk-bar">
                <span class="npk-n" :style="{ width: (row.n / npkTotal(row)) * 100 + '%' }" />
                <span class="npk-p" :style="{ width: (row.p / npkTotal(row)) * 100 + '%' }" />
                <span class="npk-k" :style="{ width: (row.k / npkTotal(row)) * 100 + '%' }" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="EC / PH" width="130">
          <template #default="{ row }">
            <span>{{ row.ec }} mS/cm / {{ row.ph }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="usage" label="适用地块" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="openApply(row)">下发</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeFormula(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="配方名称" required>
          <el-input v-model="form.name" placeholder="如：番茄膨果期配方" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="适用作物" required>
              <el-input v-model="form.crop" placeholder="如：番茄" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生育阶段">
              <el-input v-model="form.stage" placeholder="如：膨果期" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="氮 N (%)">
          <el-slider v-model="form.n" :max="40" show-input />
        </el-form-item>
        <el-form-item label="磷 P (%)">
          <el-slider v-model="form.p" :max="40" show-input />
        </el-form-item>
        <el-form-item label="钾 K (%)">
          <el-slider v-model="form.k" :max="40" show-input />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="EC 目标">
              <el-input-number v-model="form.ec" :min="0.5" :max="4" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="PH 目标">
              <el-input-number v-model="form.ph" :min="4" :max="8.5" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适用地块">
          <el-input v-model="form.usage" placeholder="如：A-02 蔬菜大棚区" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveFormula">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="applyVisible" title="配方下发" width="440px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="配方">
          <el-input v-model="applyForm.formulaName" disabled />
        </el-form-item>
        <el-form-item label="目标设备" required>
          <el-select v-model="applyForm.machineId" placeholder="选择水肥一体机" style="width: 100%">
            <el-option v-for="m in machines" :key="m.id" :label="`${m.name}（${m.location}）`" :value="m.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyVisible = false">取消</el-button>
        <el-button type="success" :loading="applyPending" @click="confirmApply">确认下发</el-button>
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

.table-title {
  font-weight: 600;
}

.machine-card {
  margin-bottom: 16px;
}

.machine-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.machine-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2d3d;
}

.machine-loc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #868e96;
  margin-bottom: 8px;
}

.machine-formula {
  font-size: 13px;
  color: #495057;
  margin-bottom: 10px;
}

.machine-metrics {
  margin-bottom: 10px;
}

.metric-label {
  font-size: 12px;
  color: #868e96;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
}

.metric-value.small {
  font-size: 14px;
}

.metric-unit {
  font-size: 11px;
  color: #868e96;
  margin-left: 2px;
  font-weight: 400;
}

.tank-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tank-label {
  font-size: 12px;
  color: #868e96;
  white-space: nowrap;
}

.tank-progress {
  flex: 1;
}

.machine-btn {
  width: 100%;
}

.npk-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.npk-text {
  font-size: 13px;
  font-weight: 600;
  color: #1f2d3d;
}

.npk-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #e9ecef;
}

.npk-n {
  background: #1c7ed6;
}

.npk-p {
  background: #f59f00;
}

.npk-k {
  background: #2f9e44;
}
</style>
