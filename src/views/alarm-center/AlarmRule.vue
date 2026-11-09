<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getAlarmRulesApi, saveAlarmRuleApi, toggleAlarmRuleApi, deleteAlarmRuleApi } from '@/api'

const auth = useAuthStore()
const loading = ref(true)
const rules = ref([])

const dialogVisible = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref(null)
const form = ref(createForm())

const operatorOptions = [
  { label: '大于 >', value: '>' },
  { label: '小于 <', value: '<' },
  { label: '大于等于 ≥', value: '>=' },
  { label: '小于等于 ≤', value: '<=' },
  { label: '等于 =', value: '=' },
]
const levelOptions = ['严重', '警告', '提示']
const notifyOptions = ['站内消息', '短信', '微信', '邮件']
const durationOptions = [0, 3, 5, 10, 15, 20, 30]

const statCards = computed(() => [
  { label: '规则总数', value: rules.value.length, unit: '条', icon: 'SetUp', color: '#1c7ed6' },
  { label: '已启用', value: rules.value.filter((r) => r.enabled).length, unit: '条', icon: 'CircleCheck', color: '#2f9e44' },
  { label: '严重级别规则', value: rules.value.filter((r) => r.level === '严重').length, unit: '条', icon: 'WarningFilled', color: '#e03131' },
  { label: '已停用', value: rules.value.filter((r) => !r.enabled).length, unit: '条', icon: 'CircleClose', color: '#868e96' },
])

const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  target: [{ required: true, message: '请输入监测对象', trigger: 'blur' }],
  metric: [{ required: true, message: '请输入监测指标', trigger: 'blur' }],
  threshold: [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
  notify: [{ type: 'array', required: true, min: 1, message: '请至少选择一种通知方式', trigger: 'change' }],
  scope: [{ required: true, message: '请输入适用范围', trigger: 'blur' }],
}

function createForm() {
  return {
    id: null,
    name: '',
    target: '',
    metric: '',
    operator: '>',
    threshold: '',
    unit: '',
    duration: 5,
    level: '警告',
    notify: ['站内消息'],
    scope: '',
    enabled: true,
  }
}

function levelType(level) {
  return { 严重: 'danger', 警告: 'warning', 提示: 'info' }[level] || 'info'
}

function durationText(min) {
  return min > 0 ? `持续 ${min} 分钟` : '触发即报'
}

function conditionText(rule) {
  return `${rule.metric} ${rule.operator} ${rule.threshold}${rule.unit ? ' ' + rule.unit : ''}`
}

async function load() {
  try {
    rules.value = await getAlarmRulesApi()
  } catch (e) {
    ElMessage.error(e.message || '加载告警规则失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editId.value = null
  form.value = createForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editId.value = row.id
  form.value = {
    id: row.id,
    name: row.name,
    target: row.target,
    metric: row.metric,
    operator: row.operator,
    threshold: row.threshold,
    unit: row.unit,
    duration: row.duration,
    level: row.level,
    notify: row.notify.slice(),
    scope: row.scope,
    enabled: row.enabled,
  }
  dialogVisible.value = true
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await saveAlarmRuleApi({ ...form.value, creator: auth.userInfo?.name || '系统管理员' })
      ElMessage.success(editId.value ? '规则已更新' : '规则已新增')
      dialogVisible.value = false
      await load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}

async function toggleRule(row) {
  try {
    await toggleAlarmRuleApi(row.id, row.enabled)
    ElMessage.success(row.enabled ? '规则已启用' : '规则已停用')
  } catch (e) {
    row.enabled = !row.enabled
    ElMessage.error(e.message || '状态切换失败')
  }
}

async function removeRule(row) {
  await ElMessageBox.confirm(`确认删除规则「${row.name}」？删除后不可恢复。`, '删除规则', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await deleteAlarmRuleApi(row.id)
    ElMessage.success('规则已删除')
    await load()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">告警规则配置</h2>
      <span class="page-desc">自定义监测阈值、触发条件、告警级别与消息通知方式</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="card in statCards" :key="card.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon :size="22" color="#fff"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">{{ card.value }}<span class="stat-unit">{{ card.unit }}</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-alert
      class="tip-alert"
      type="info"
      :closable="false"
      show-icon
      title="规则修改后仅对之后产生的告警生效；停用规则将不再触发新的告警。"
    />

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">告警规则列表</span>
          <el-button type="primary" size="small" @click="openCreate">
            <el-icon><Plus /></el-icon>
            新增规则
          </el-button>
        </div>
      </template>
      <el-table :data="rules" stripe>
        <el-table-column prop="name" label="规则名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="target" label="监测对象" min-width="190" show-overflow-tooltip />
        <el-table-column label="触发条件" min-width="170">
          <template #default="{ row }">{{ conditionText(row) }}</template>
        </el-table-column>
        <el-table-column label="持续时长" width="110" align="center">
          <template #default="{ row }">{{ durationText(row.duration) }}</template>
        </el-table-column>
        <el-table-column label="告警级别" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="通知方式" min-width="170">
          <template #default="{ row }">
            <el-tag v-for="n in row.notify" :key="n" size="small" effect="plain" class="notify-tag">{{ n }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scope" label="适用范围" min-width="190" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleRule(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastTriggerTime" label="最近触发" width="165" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeRule(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑告警规则' : '新增告警规则'" width="620px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="96px">
        <el-row :gutter="12">
          <el-col :span="24">
            <el-form-item label="规则名称" prop="name">
              <el-input v-model="form.name" maxlength="30" placeholder="如：大棚温度过高告警" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="监测对象" prop="target">
              <el-input v-model="form.target" maxlength="40" placeholder="如：1-6 号大棚温度传感器" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="监测指标" prop="metric">
              <el-input v-model="form.metric" maxlength="20" placeholder="如：空气温度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发条件" prop="operator">
              <el-select v-model="form.operator" style="width: 100%">
                <el-option v-for="o in operatorOptions" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发阈值" prop="threshold">
              <el-input v-model="form.threshold" maxlength="20" placeholder="如：35 或 离线" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="form.unit" maxlength="10" placeholder="如：℃ / % / mg/L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="持续时长">
              <el-select v-model="form.duration" style="width: 100%">
                <el-option v-for="d in durationOptions" :key="d" :label="d > 0 ? `${d} 分钟` : '触发即报'" :value="d" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警级别" prop="level">
              <el-radio-group v-model="form.level">
                <el-radio-button v-for="l in levelOptions" :key="l" :value="l">{{ l }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="通知方式" prop="notify">
              <el-checkbox-group v-model="form.notify">
                <el-checkbox v-for="n in notifyOptions" :key="n" :value="n">{{ n }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="适用范围" prop="scope">
              <el-input v-model="form.scope" maxlength="40" placeholder="如：南山智慧农业示范园 1-6 号大棚" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="启用状态">
              <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label {
  font-size: 13px;
  color: #868e96;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.stat-unit {
  font-size: 12px;
  color: #868e96;
  margin-left: 4px;
  font-weight: 400;
}

.tip-alert {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-title {
  font-weight: 600;
}

.notify-tag {
  margin-right: 6px;
  margin-bottom: 2px;
}
</style>
