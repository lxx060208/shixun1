<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDeviceDashboardApi,
  getDeviceWorkOrdersApi,
  createDeviceWorkOrderApi,
  dispatchDeviceWorkOrderApi,
  startDeviceWorkOrderApi,
  executeDeviceWorkOrderApi,
  returnDeviceWorkOrderToolsApi,
  getFarmMaterialsApi,
} from '@/api'

const loading = ref(true)
const tableLoading = ref(false)
const statCards = ref([])
const workOrders = ref([])
const maintainers = ref([])
const orderStats = reactive({ total: 0, pending: 0, dispatched: 0, processing: 0, done: 0, running: 0 })
// 当前账号在运维工单中的权限与数据范围（以接口返回为准，前端仅做展示控制）
const access = reactive({
  roleCode: '',
  roleName: '',
  userName: '',
  canCreate: false,
  canDispatch: false,
  canExecuteAny: false,
  canViewAll: true,
  readOnly: true,
})

const typeOptions = ['故障维修', '校准维护', '定期保养', '巡检']
const priorityOptions = ['高', '中', '低']
const statusOptions = ['待派单', '已派单', '处理中', '已完成']
const parkOptions = ['南山智慧农业示范园', '清水有机蔬菜基地', '花溪生态果园']

const filters = reactive({ keyword: '', status: '', type: '', assignee: '' })

const onlineChartRef = ref(null)
const faultChartRef = ref(null)
const typeChartRef = ref(null)
let charts = []
let pageData = null

function buildStatCards() {
  const s = pageData ? pageData.stats : {}
  statCards.value = [
    { label: '设备总数', value: s.total || 0, unit: '台', icon: 'Monitor', color: '#1c7ed6' },
    { label: '在线设备', value: s.online || 0, unit: '台', icon: 'CircleCheck', color: '#2f9e44' },
    { label: '故障设备', value: s.fault || 0, unit: '台', icon: 'WarningFilled', color: '#e8590c' },
    { label: '进行中工单', value: orderStats.running, unit: '个', icon: 'Tickets', color: '#7048e8' },
  ]
}

function statusType(s) {
  return { 待派单: 'danger', 已派单: 'primary', 处理中: 'warning', 已完成: 'success' }[s] || 'info'
}

function priorityType(p) {
  return { 高: 'danger', 中: 'warning', 低: 'info' }[p] || 'info'
}

function typeTag(t) {
  return { 故障维修: 'danger', 校准维护: 'warning', 定期保养: 'primary', 巡检: 'success' }[t] || 'info'
}

function rowClass({ row }) {
  if (row.status === '待派单') return 'row-pending'
  if (row.status === '已完成') return 'row-done'
  return ''
}

function logType(action) {
  if (action === '完成工单' || action === '工具归还') return 'success'
  if (action === '派发工单') return 'primary'
  if (action === '开始执行' || action === '领用工具') return 'warning'
  if (action === '创建工单') return 'info'
  return ''
}

// 执行权限：管理员可处理任意工单，运维人员仅能处理指派给本人的工单
function canExecuteRow(row) {
  if (access.canExecuteAny) return true
  return access.roleCode === 'operator' && !!access.userName && row.assignee === access.userName
}

// 工具归还权限：管理员/农场管理者，或该工单负责人
function canReturnRow(row) {
  if (!row) return false
  return (
    access.canDispatch ||
    (access.roleCode === 'operator' && !!access.userName && row.assignee === access.userName)
  )
}

function applyPermissions(permissions) {
  if (!permissions) return
  Object.assign(access, permissions)
}

// 待归还工具数量：用于列表提示，点击进入详情完成归还
function pendingToolCount(row) {
  return (row.consumed || []).reduce((sum, c) => {
    const material = materialMap.value[c.material]
    if (!material || !material.returnable) return sum
    const remaining = (Number(c.quantity) || 0) - (Number(c.returned) || 0)
    return sum + Math.max(remaining, 0)
  }, 0)
}

function initOnlineChart() {
  const chart = echarts.init(onlineChartRef.value)
  chart.setOption({
    title: { text: '近7日设备在线率', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', formatter: '{b}<br/>在线率：{c}%' },
    grid: { left: 45, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category', data: pageData.onlineRate.dates },
    yAxis: { type: 'value', min: 90, max: 100 },
    series: [{
      type: 'line',
      data: pageData.onlineRate.values,
      smooth: true,
      areaStyle: { opacity: 0.2 },
      itemStyle: { color: '#2f9e44' },
    }],
  })
  charts.push(chart)
}

function initFaultChart() {
  const chart = echarts.init(faultChartRef.value)
  chart.setOption({
    title: { text: '近7日故障统计', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 40, right: 20, top: 50, bottom: 50 },
    xAxis: { type: 'category', data: pageData.fault.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '新增故障', type: 'bar', stack: 'f', data: pageData.fault.added, itemStyle: { color: '#e8590c', borderRadius: [4, 4, 0, 0] }, barWidth: 22 },
      { name: '已修复', type: 'bar', stack: 'f', data: pageData.fault.fixed, itemStyle: { color: '#2f9e44' }, barWidth: 22 },
    ],
  })
  charts.push(chart)
}

function initTypeChart() {
  const chart = echarts.init(typeChartRef.value)
  chart.setOption({
    title: { text: '设备类型分布', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 台 ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '48%'],
      data: pageData.typeDist,
      label: { formatter: '{b}\n{d}%' },
    }],
  })
  charts.push(chart)
}

function handleResize() {
  charts.forEach((c) => c.resize())
}

async function loadOrders() {
  tableLoading.value = true
  try {
    const res = await getDeviceWorkOrdersApi(filters)
    workOrders.value = res.list
    Object.assign(orderStats, res.stats)
    maintainers.value = res.maintainers
    applyPermissions(res.permissions)
    buildStatCards()
  } catch (e) {
    ElMessage.error(e.message || '工单加载失败')
  } finally {
    tableLoading.value = false
  }
}

function resetFilters() {
  Object.assign(filters, { keyword: '', status: '', type: '', assignee: '' })
  loadOrders()
}

/* ------------------------- 新建工单 ------------------------- */
const createVisible = ref(false)
const creating = ref(false)
const createRef = ref()
const createForm = reactive({
  device: '',
  deviceCode: '',
  type: '故障维修',
  priority: '中',
  park: '',
  location: '',
  deadline: '',
  description: '',
})
const createRules = {
  device: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
}

function openCreate() {
  Object.assign(createForm, {
    device: '',
    deviceCode: '',
    type: '故障维修',
    priority: '中',
    park: '',
    location: '',
    deadline: '',
    description: '',
  })
  createVisible.value = true
}

async function submitCreate() {
  const valid = await createRef.value.validate().catch(() => false)
  if (!valid) return
  creating.value = true
  try {
    const order = await createDeviceWorkOrderApi({ ...createForm })
    createVisible.value = false
    ElMessage.success(`工单 ${order.id} 已创建，请派发负责人`)
    await loadOrders()
  } catch (e) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    creating.value = false
  }
}

/* ------------------------- 派发工单 ------------------------- */
const dispatchVisible = ref(false)
const dispatching = ref(false)
const dispatchRef = ref()
const dispatchOrder = ref(null)
const dispatchForm = reactive({ assignee: '', priority: '中', deadline: '', remark: '' })
const dispatchRules = {
  assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
}

function openDispatch(row) {
  dispatchOrder.value = row
  Object.assign(dispatchForm, {
    assignee: row.assignee || '',
    priority: row.priority || '中',
    deadline: row.deadline || '',
    remark: '',
  })
  dispatchVisible.value = true
}

async function submitDispatch() {
  const valid = await dispatchRef.value.validate().catch(() => false)
  if (!valid || !dispatchOrder.value) return
  dispatching.value = true
  try {
    await dispatchDeviceWorkOrderApi(dispatchOrder.value.id, { ...dispatchForm })
    dispatchVisible.value = false
    ElMessage.success(`工单已派发给${dispatchForm.assignee}`)
    await loadOrders()
  } catch (e) {
    ElMessage.error(e.message || '派发失败')
  } finally {
    dispatching.value = false
  }
}

/* ------------------------- 开始执行 / 执行登记 ------------------------- */
async function handleStart(row) {
  try {
    await ElMessageBox.confirm(
      `确认开始执行「${row.device}」的${row.type}工单？`,
      '开始执行',
      { type: 'warning', confirmButtonText: '开始执行', cancelButtonText: '取消' },
    )
  } catch (e) {
    return
  }
  try {
    const started = await startDeviceWorkOrderApi(row.id)
    ElMessage.success('已开始执行，请及时登记进度')
    await loadOrders()
    openExecute(started)
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

const executeVisible = ref(false)
const executing = ref(false)
const executeOrder = ref(null)
const executeForm = reactive({ progress: 10, remark: '', consumed: [] })
const executeCategory = ref('工具')
const materialOptions = ref([])
const materialMap = computed(() => {
  const map = {}
  materialOptions.value.forEach((m) => {
    map[m.name] = m
  })
  return map
})
const materialCategories = computed(() => [...new Set(materialOptions.value.map((m) => m.category).filter(Boolean))])
// 维修工具/耗材按分类分组，默认只看「工具」一类
const materialGroups = computed(() => {
  const groups = new Map()
  materialOptions.value.forEach((m) => {
    if (executeCategory.value && m.category !== executeCategory.value) return
    if (!groups.has(m.category)) groups.set(m.category, [])
    groups.get(m.category).push(m)
  })
  return [...groups.entries()].map(([category, list]) => ({ category, list }))
})

async function loadMaterialOptions() {
  try {
    const res = await getFarmMaterialsApi({ page: 1, pageSize: 999 })
    materialOptions.value = res.list
  } catch (e) {
    /* 物资加载失败不阻断执行登记 */
  }
}

function materialUnit(name) {
  return materialMap.value[name]?.unit || ''
}

function materialStock(name) {
  const m = materialMap.value[name]
  return m ? Number(m.stock) : 0
}

function addConsumption() {
  executeForm.consumed.push({ material: '', quantity: 1 })
}

function removeConsumption(index) {
  executeForm.consumed.splice(index, 1)
}

const consumedPreview = computed(() =>
  executeForm.consumed
    .filter((c) => c.material && Number(c.quantity) > 0)
    .map((c) => `${c.material} ${c.quantity}${materialUnit(c.material)}`)
    .join('，'),
)

function openExecute(row) {
  executeOrder.value = row
  executeForm.progress = Math.max(Number(row.progress) || 0, 20)
  executeForm.remark = ''
  executeForm.consumed = [{ material: '', quantity: 1 }]
  executeCategory.value = '工具'
  executeVisible.value = true
}

function setProgress(v) {
  executeForm.progress = v
}

async function submitExecute() {
  if (!executeOrder.value) return
  if (executeForm.progress === 100 && !executeForm.remark.trim()) {
    ElMessage.warning('完工时请填写维修结果说明')
    return
  }
  executing.value = true
  try {
    const consumed = executeForm.consumed.filter((c) => c.material && Number(c.quantity) > 0)
    const order = await executeDeviceWorkOrderApi(executeOrder.value.id, {
      progress: executeForm.progress,
      remark: executeForm.remark,
      consumed,
    })
    executeVisible.value = false
    ElMessage.success(order.status === '已完成' ? '工单已完工，消耗工具已出库，请及时归还工具' : `进度已更新至 ${order.progress}%`)
    await loadOrders()
    // 刷新库存，避免再次登记时显示旧库存
    loadMaterialOptions()
  } catch (e) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    executing.value = false
  }
}

/* ------------------------- 工单详情 ------------------------- */
const detailVisible = ref(false)
const detail = ref(null)
const detailLogs = computed(() => (detail.value ? [...detail.value.logs].reverse() : []))
// 详情抽屉内的权限提示：无操作权限时明确告知原因
const detailPermTip = computed(() => {
  const row = detail.value
  if (!row || canExecuteRow(row)) return ''
  if (row.status === '处理中') return '仅工单负责人可登记执行'
  if (row.status === '待派单' || row.status === '已派单') {
    return access.canDispatch ? '' : '当前角色无该工单的操作权限'
  }
  return ''
})

function openDetail(row) {
  detail.value = row
  detailVisible.value = true
}

/* ------------------------- 工具归还 ------------------------- */
const returnVisible = ref(false)
const returning = ref(false)
const returnTarget = ref(null)
const returnForm = reactive({ quantity: 1, remark: '' })

// 按工具汇总领用与归还情况，同一工具多次领用合并展示
const detailConsumed = computed(() => {
  if (!detail.value) return []
  const map = new Map()
  ;(detail.value.consumed || []).forEach((c) => {
    const name = c.material
    if (!map.has(name)) {
      const m = materialMap.value[name]
      map.set(name, {
        material: name,
        unit: c.unit || (m ? m.unit : ''),
        category: m ? m.category : '',
        returnable: m ? !!m.returnable : false,
        total: 0,
        returned: 0,
      })
    }
    const item = map.get(name)
    item.total += Number(c.quantity) || 0
    item.returned += Number(c.returned) || 0
  })
  return [...map.values()].map((item) => ({
    ...item,
    remaining: Math.max(item.total - item.returned, 0),
    isTool: item.category === '工具',
  }))
})

// 归还权限：工单负责人、系统管理员与农场管理者
function canReturnTools() {
  return canReturnRow(detail.value)
}

const returnStockPreview = computed(() => {
  const target = returnTarget.value
  if (!target) return ''
  const material = materialMap.value[target.material]
  const current = material ? Number(material.stock) || 0 : 0
  const qty = Number(returnForm.quantity) || 0
  return `当前库存 ${current}${target.unit} → 归还后 ${current + qty}${target.unit}`
})

function openReturnTool(row) {
  if (!row || !row.returnable || row.remaining <= 0) return
  returnTarget.value = { ...row }
  returnForm.quantity = row.remaining
  returnForm.remark = ''
  returnVisible.value = true
}

async function submitReturnTool() {
  if (!detail.value || !returnTarget.value) return
  if (!returnForm.quantity || returnForm.quantity <= 0) {
    ElMessage.warning('请输入正确的归还数量')
    return
  }
  returning.value = true
  try {
    const updated = await returnDeviceWorkOrderToolsApi(detail.value.id, {
      items: [{ material: returnTarget.value.material, quantity: returnForm.quantity }],
      remark: returnForm.remark,
    })
    detail.value = updated
    returnVisible.value = false
    ElMessage.success('工具已归还，农资库存已同步回补')
    await loadOrders()
    loadMaterialOptions()
  } catch (e) {
    ElMessage.error(e.message || '归还失败')
  } finally {
    returning.value = false
  }
}

// 详情抽屉内直接发起后续操作（派发 / 开始执行 / 执行登记）
function dispatchFromDetail() {
  const row = detail.value
  if (!row) return
  detailVisible.value = false
  openDispatch(row)
}

function startFromDetail() {
  const row = detail.value
  if (!row) return
  detailVisible.value = false
  handleStart(row)
}

function executeFromDetail() {
  const row = detail.value
  if (!row) return
  detailVisible.value = false
  openExecute(row)
}

onMounted(async () => {
  const [page, res] = await Promise.all([
    getDeviceDashboardApi(),
    getDeviceWorkOrdersApi(),
  ])
  workOrders.value = res.list
  Object.assign(orderStats, res.stats)
  maintainers.value = res.maintainers
  applyPermissions(res.permissions)
  pageData = page
  buildStatCards()
  loading.value = false
  initOnlineChart()
  initFaultChart()
  initTypeChart()
  loadMaterialOptions()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach((c) => c.dispose())
  charts = []
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">设备运维大屏</h2>
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

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="onlineChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="faultChartRef" class="chart" /></el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="chart-card"><div ref="typeChartRef" class="chart" /></el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-head">
          <div class="card-head-left">
            <span class="table-title">{{ access.canViewAll ? '运维工单进度' : '我的运维工单' }}</span>
            <el-tag v-if="access.roleName" type="info" effect="plain" size="small" round>
              {{ access.roleName }}{{ access.readOnly ? ' · 只读' : '' }}
            </el-tag>
            <el-tag v-if="orderStats.pending" type="danger" effect="dark" size="small" round>
              待派发 {{ orderStats.pending }}
            </el-tag>
            <el-tag v-if="orderStats.processing" type="warning" effect="plain" size="small" round>
              处理中 {{ orderStats.processing }}
            </el-tag>
            <el-tag v-if="orderStats.done" type="success" effect="plain" size="small" round>
              已完成 {{ orderStats.done }}
            </el-tag>
          </div>
          <div class="card-head-right">
            <el-button circle @click="loadOrders">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button v-if="access.canCreate" type="primary" @click="openCreate">
              <el-icon><Plus /></el-icon>
              <span>新建工单</span>
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="!access.canViewAll || access.readOnly" class="scope-tip">
        <el-icon><InfoFilled /></el-icon>
        <span v-if="!access.canViewAll">
          当前为{{ access.roleName }}视角，仅显示指派给{{ access.userName }}的工单，可执行本人工单但不可派发。
        </span>
        <span v-else>
          当前为{{ access.roleName }}视角，仅可查看工单与处理记录，无新建、派发与执行权限。
        </span>
      </div>

      <div class="order-filters">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索工单编号 / 设备 / 位置"
          clearable
          style="width: 230px"
          @keyup.enter="loadOrders"
          @clear="loadOrders"
        />
        <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 130px" @change="loadOrders">
          <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 130px" @change="loadOrders">
          <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
        </el-select>
        <el-select v-if="access.canViewAll" v-model="filters.assignee" placeholder="全部负责人" clearable style="width: 140px" @change="loadOrders">
          <el-option v-for="m in maintainers" :key="m.name" :label="m.name" :value="m.name" />
        </el-select>
        <el-button type="primary" plain @click="loadOrders">查询</el-button>
        <el-button link @click="resetFilters">重置</el-button>
        <span class="filter-tip">
          未完成 {{ orderStats.running }} 条 / 共 {{ orderStats.total }} 条
        </span>
      </div>

      <el-table
        v-loading="tableLoading"
        :data="workOrders"
        stripe
        :row-class-name="rowClass"
        :empty-text="access.canViewAll ? '暂无运维工单' : '暂无指派给本人的运维工单'"
      >
        <el-table-column label="工单编号" width="170">
          <template #default="{ row }">
            <span class="order-no">{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="设备名称" min-width="200">
          <template #default="{ row }">
            <div class="device-cell">
              <span class="device-name">{{ row.device }}</span>
              <span class="device-sub">{{ row.park }} · {{ row.location }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" width="105">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" effect="plain" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="85">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)" effect="dark" size="small">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100">
          <template #default="{ row }">
            <span v-if="row.assignee">{{ row.assignee }}</span>
            <span v-else class="text-muted">未派发</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" min-width="170">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="row.status === '已完成' ? 'success' : ''"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column label="截止时间" width="115">
          <template #default="{ row }">
            <span class="deadline">{{ row.deadline || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="95">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="plain" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工具归还" width="100">
          <template #default="{ row }">
            <el-button
              v-if="pendingToolCount(row) > 0 && canReturnRow(row)"
              link
              type="success"
              size="small"
              @click="openDetail(row)"
            >
              待归还 {{ pendingToolCount(row) }}
            </el-button>
            <span v-else-if="pendingToolCount(row) > 0" class="pending-tool">
              待归还 {{ pendingToolCount(row) }}
            </span>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="access.canDispatch && (row.status === '待派单' || row.status === '已派单')"
              link
              type="primary"
              @click="openDispatch(row)"
            >
              {{ row.status === '待派单' ? '派发' : '重新派发' }}
            </el-button>
            <el-button
              v-if="canExecuteRow(row) && row.status === '已派单'"
              link
              type="warning"
              @click="handleStart(row)"
            >
              开始执行
            </el-button>
            <el-button
              v-if="canExecuteRow(row) && row.status === '处理中'"
              link
              type="warning"
              @click="openExecute(row)"
            >
              执行登记
            </el-button>
            <el-button link @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建工单 -->
    <el-dialog v-model="createVisible" title="新建运维工单" width="620px" destroy-on-close>
      <el-form ref="createRef" :model="createForm" :rules="createRules" label-width="96px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="device">
              <el-input v-model="createForm.device" placeholder="如：3 号大棚水泵" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号">
              <el-input v-model="createForm.deviceCode" placeholder="如：D-NS-301" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工单类型" prop="type">
              <el-select v-model="createForm.type" style="width: 100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="createForm.priority" style="width: 100%">
                <el-option v-for="p in priorityOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="所属园区">
              <el-select v-model="createForm.park" filterable allow-create clearable style="width: 100%" placeholder="选择或输入园区">
                <el-option v-for="p in parkOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备位置">
              <el-input v-model="createForm.location" placeholder="如：3 号大棚" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="截止时间">
          <el-date-picker v-model="createForm.deadline" type="date" value-format="YYYY-MM-DD" placeholder="选择截止日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="createForm.description" type="textarea" :rows="3" placeholder="描述故障现象、影响范围与处理要求" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建工单</el-button>
      </template>
    </el-dialog>

    <!-- 派发工单 -->
    <el-dialog v-model="dispatchVisible" title="派发运维工单" width="560px" destroy-on-close>
      <div v-if="dispatchOrder" class="dialog-order">
        <div class="dialog-order-top">
          <span class="order-no">{{ dispatchOrder.id }}</span>
          <el-tag :type="statusType(dispatchOrder.status)" effect="plain" size="small">{{ dispatchOrder.status }}</el-tag>
        </div>
        <div class="dialog-order-device">{{ dispatchOrder.device }} · {{ dispatchOrder.type }}</div>
        <div class="dialog-order-desc">{{ dispatchOrder.description }}</div>
      </div>
      <el-form ref="dispatchRef" :model="dispatchForm" :rules="dispatchRules" label-width="96px">
        <el-form-item label="负责人" prop="assignee">
          <el-select v-model="dispatchForm.assignee" placeholder="选择运维人员" style="width: 100%">
            <el-option v-for="m in maintainers" :key="m.name" :label="m.name" :value="m.name">
              <div class="maintainer-option">
                <span>{{ m.name }}</span>
                <span class="maintainer-meta">{{ m.team }} · {{ m.phone }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="dispatchForm.priority" style="width: 100%">
                <el-option v-for="p in priorityOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="deadline">
              <el-date-picker v-model="dispatchForm.deadline" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="派发说明">
          <el-input v-model="dispatchForm.remark" type="textarea" :rows="2" placeholder="填写派发要求，如：当日恢复供水（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dispatchVisible = false">取消</el-button>
        <el-button type="primary" :loading="dispatching" @click="submitDispatch">确认派发</el-button>
      </template>
    </el-dialog>

    <!-- 执行登记 -->
    <el-dialog v-model="executeVisible" title="执行登记" width="720px" destroy-on-close>
      <div v-if="executeOrder" class="dialog-order">
        <div class="dialog-order-top">
          <span class="order-no">{{ executeOrder.id }}</span>
          <el-tag type="warning" effect="plain" size="small">{{ executeOrder.status }}</el-tag>
        </div>
        <div class="dialog-order-device">{{ executeOrder.device }} · {{ executeOrder.type }} · 负责人 {{ executeOrder.assignee }}</div>
        <div class="dialog-order-desc">{{ executeOrder.description }}</div>
        <div v-if="executeOrder.consumed.length" class="history-consumed">
          已领用：{{ executeOrder.consumed.map((c) => `${c.material} ${c.quantity}${c.unit || ''}`).join('，') }}
        </div>
      </div>
      <el-form label-width="96px">
        <el-form-item label="执行进度">
          <div class="progress-editor">
            <el-slider v-model="executeForm.progress" :marks="{ 100: '完工' }" style="flex: 1" />
            <el-input-number v-model="executeForm.progress" :min="0" :max="100" :step="5" controls-position="right" style="width: 110px" />
          </div>
          <div class="progress-presets">
            <el-button size="small" round @click="setProgress(30)">30%</el-button>
            <el-button size="small" round @click="setProgress(60)">60%</el-button>
            <el-button size="small" round @click="setProgress(90)">90%</el-button>
            <el-button size="small" type="success" round plain @click="setProgress(100)">完工 100%</el-button>
          </div>
        </el-form-item>
        <el-form-item label="领用工具">
          <div class="consume-head">
            <el-select v-model="executeCategory" size="small" style="width: 130px">
              <el-option label="全部物资" value="" />
              <el-option v-for="c in materialCategories" :key="c" :label="c" :value="c" />
            </el-select>
            <el-button size="small" type="primary" plain @click="addConsumption">添加一行</el-button>
            <span class="consume-tip">维修工具/耗材取自农资库存，提交后自动出库；工具用后可在详情中归还</span>
          </div>
          <div v-for="(row, i) in executeForm.consumed" :key="i" class="consume-row">
            <el-select v-model="row.material" filterable placeholder="选择工具/物资" class="consume-select">
              <el-option-group v-for="g in materialGroups" :key="g.category" :label="g.category">
                <el-option
                  v-for="m in g.list"
                  :key="m.name"
                  :label="`${m.name}（库存 ${m.stock}${m.unit}）`"
                  :value="m.name"
                  :disabled="Number(m.stock) <= 0"
                />
              </el-option-group>
            </el-select>
            <el-input-number v-model="row.quantity" :min="1" :max="Math.max(materialStock(row.material), 1)" controls-position="right" style="width: 120px" />
            <span class="consume-unit">{{ materialUnit(row.material) }}</span>
            <el-button link type="danger" @click="removeConsumption(i)">移除</el-button>
          </div>
          <div v-if="consumedPreview" class="consume-preview">本次领用：{{ consumedPreview }}</div>
        </el-form-item>
        <el-form-item label="执行说明">
          <el-input
            v-model="executeForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="executeForm.progress === 100 ? '请填写维修结果（完工必填）' : '填写本次处理内容，如：已更换接触器，待通电测试'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeVisible = false">取消</el-button>
        <el-button type="primary" :loading="executing" @click="submitExecute">
          {{ executeForm.progress === 100 ? '提交完工' : '提交进度' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 工单详情 -->
    <el-drawer v-model="detailVisible" title="工单详情" size="46%">
      <template v-if="detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="工单编号">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(detail.status)" effect="plain" size="small">{{ detail.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ detail.device }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ detail.deviceCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="工单类型">{{ detail.type }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="priorityType(detail.priority)" effect="dark" size="small">{{ detail.priority }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所属园区">{{ detail.park || '—' }}</el-descriptions-item>
          <el-descriptions-item label="设备位置">{{ detail.location || '—' }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.assignee || '未派发' }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ detail.deadline || '—' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ detail.startTime || '—' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ detail.finishTime || '—' }}</el-descriptions-item>
          <el-descriptions-item label="当前进度">{{ detail.progress }}%</el-descriptions-item>
          <el-descriptions-item label="故障描述" :span="2">{{ detail.description || '—' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-block">
          <div class="detail-block-title">
            领用工具 / 物资
            <span class="block-sub">工具使用后请及时归还，归还后自动回补农资库存</span>
          </div>
          <el-table :data="detailConsumed" size="small" empty-text="暂未领用维修工具">
            <el-table-column prop="material" label="名称" min-width="130" />
            <el-table-column label="分类" width="80">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" :type="row.isTool ? 'success' : 'info'">
                  {{ row.category || '—' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="领用" width="80">
              <template #default="{ row }">{{ row.total }}{{ row.unit }}</template>
            </el-table-column>
            <el-table-column label="已归还" width="80">
              <template #default="{ row }">{{ row.returned }}{{ row.unit }}</template>
            </el-table-column>
            <el-table-column label="待归还" width="80">
              <template #default="{ row }">
                <span v-if="row.returnable" :class="{ 'text-danger': row.remaining > 0 }">
                  {{ row.remaining }}{{ row.unit }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="110">
              <template #default="{ row }">
                <el-button
                  v-if="row.returnable && row.remaining > 0 && canReturnTools()"
                  link
                  type="primary"
                  size="small"
                  @click="openReturnTool(row)"
                >
                  归还
                </el-button>
                <el-tag v-else-if="row.returnable && row.remaining === 0" size="small" type="success" effect="plain">
                  已归还
                </el-tag>
                <span v-else class="text-muted">耗材</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-block">
          <div class="detail-block-title">处理记录</div>
          <el-timeline>
            <el-timeline-item
              v-for="(log, i) in detailLogs"
              :key="i"
              :timestamp="log.time"
              placement="top"
              :type="logType(log.action)"
              :hollow="i !== 0"
            >
              <div class="log-action">
                {{ log.action }}
                <span class="log-op">{{ log.operator }}</span>
              </div>
              <div v-if="log.remark" class="log-remark">{{ log.remark }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="drawer-actions">
          <el-button
            v-if="access.canDispatch && (detail.status === '待派单' || detail.status === '已派单')"
            type="primary"
            @click="dispatchFromDetail"
          >
            {{ detail.status === '待派单' ? '派发工单' : '重新派发' }}
          </el-button>
          <el-button
            v-if="canExecuteRow(detail) && detail.status === '已派单'"
            type="warning"
            @click="startFromDetail"
          >
            开始执行
          </el-button>
          <el-button
            v-if="canExecuteRow(detail) && detail.status === '处理中'"
            type="warning"
            @click="executeFromDetail"
          >
            执行登记
          </el-button>
          <span v-if="detailPermTip" class="drawer-readonly">{{ detailPermTip }}</span>
        </div>
      </template>
    </el-drawer>

    <!-- 工具归还 -->
    <el-dialog v-model="returnVisible" title="归还维修工具" width="460px" destroy-on-close>
      <div v-if="returnTarget" class="return-tool">
        <span class="return-name">{{ returnTarget.material }}</span>
        <span class="return-remain">待归还 {{ returnTarget.remaining }}{{ returnTarget.unit }}</span>
      </div>
      <el-form label-width="90px">
        <el-form-item label="归还数量">
          <el-input-number
            v-model="returnForm.quantity"
            :min="1"
            :max="returnTarget ? returnTarget.remaining : 1"
            :step="1"
            controls-position="right"
            style="width: 160px"
          />
          <span class="return-unit">{{ returnTarget ? returnTarget.unit : '' }}</span>
          <div class="return-stock">{{ returnStockPreview }}</div>
        </el-form-item>
        <el-form-item label="归还备注">
          <el-input
            v-model="returnForm.remark"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
            placeholder="如：工具完好，已清洁入库"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnVisible = false">取消</el-button>
        <el-button type="primary" :loading="returning" @click="submitReturnTool">确认归还</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped>
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

.chart-card {
  margin-bottom: 16px;
}

.chart {
  height: 280px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.card-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-title {
  font-weight: 600;
  font-size: 15px;
}

.order-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.scope-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f1f8ff;
  border: 1px solid #d0ebff;
  font-size: 12px;
  color: #1c7ed6;
}

.scope-tip .el-icon {
  flex-shrink: 0;
}

.filter-tip {
  margin-left: auto;
  font-size: 12px;
  color: #868e96;
}

.order-no {
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 13px;
  color: #1c7ed6;
}

.device-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.device-name {
  font-weight: 500;
  color: #1f2d3d;
}

.device-sub {
  font-size: 12px;
  color: #868e96;
}

.text-muted {
  color: #adb5bd;
}

.deadline {
  font-size: 13px;
  color: #495057;
}

:deep(.el-table .row-pending) {
  --el-table-tr-bg-color: #fff5f5;
}

:deep(.el-table .row-pending:hover > td.el-table__cell) {
  background-color: #ffe8e8 !important;
}

:deep(.el-table .row-done) {
  color: #868e96;
}

.dialog-order {
  padding: 12px 14px;
  margin-bottom: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #1c7ed6;
}

.dialog-order-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.dialog-order-device {
  font-weight: 600;
  color: #1f2d3d;
}

.dialog-order-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #868e96;
  line-height: 1.6;
}

.history-consumed {
  margin-top: 6px;
  font-size: 12px;
  color: #e8590c;
}

.maintainer-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.maintainer-meta {
  font-size: 12px;
  color: #adb5bd;
}

.progress-editor {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding-right: 10px;
}

.progress-presets {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.consume-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.consume-tip {
  font-size: 12px;
  color: #868e96;
}

.consume-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.consume-select {
  flex: 1;
}

.consume-unit {
  width: 32px;
  font-size: 12px;
  color: #868e96;
}

.consume-preview {
  font-size: 12px;
  color: #2f9e44;
}

.detail-block {
  margin-top: 20px;
}

.detail-block-title {
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid #2f9e44;
}

.block-sub {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #868e96;
}

.text-danger {
  color: #e8590c;
  font-weight: 600;
}

.pending-tool {
  font-size: 12px;
  color: #e8590c;
}

.return-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #2f9e44;
}

.return-name {
  font-weight: 600;
  color: #1f2d3d;
}

.return-remain {
  font-size: 13px;
  color: #e8590c;
}

.return-unit {
  margin-left: 8px;
  font-size: 12px;
  color: #868e96;
}

.return-stock {
  width: 100%;
  margin-top: 4px;
  font-size: 12px;
  color: #2f9e44;
}

.log-action {
  font-weight: 500;
  color: #1f2d3d;
}

.log-op {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #868e96;
}

.log-remark {
  margin-top: 2px;
  font-size: 12px;
  color: #868e96;
}

.drawer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f3f5;
}

.drawer-readonly {
  font-size: 12px;
  color: #868e96;
}
</style>
