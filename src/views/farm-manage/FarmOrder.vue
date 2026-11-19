<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmOrdersApi, createFarmOrderApi, assignFarmOrderApi, updateFarmOrderStatusApi, deleteFarmOrderApi } from '@/api'
import { farmOperationTypes, farmPlotNameList, farmers, taskTypeSpecialtyMap, getFarmPlotPark } from '@/api/mock'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
// 工单下发/指派/状态流转/删除仅系统管理员可操作，其余角色仅可查看
const isAdmin = computed(() => auth.userInfo?.roleCode === 'admin')

const statusOptions = ['待派单', '已派单', '进行中', '已完成']

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ status: '', keyword: '' })

const dialogVisible = ref(false)
const assignVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const assignForm = reactive({ assignee: '' })
const currentOrder = ref(null)

// 当前工单所属园区与要求的专业方向
const currentOrderPark = computed(() => (currentOrder.value ? getFarmPlotPark(currentOrder.value.plot) : ''))
const requiredSpecialty = computed(() => (currentOrder.value ? taskTypeSpecialtyMap[currentOrder.value.taskType] || '' : ''))
// 可指派人员：仅同园区且专业对口（不可跨园区、不可指派非专业人员）
const assignableFarmers = computed(() => {
  if (!currentOrder.value) return []
  return farmers.filter((f) => f.park === currentOrderPark.value && f.specialty === requiredSpecialty.value)
})
const form = reactive({ orderNo: '', title: '', plot: '', taskType: '', deadline: '' })

// 下发时自动指派预览：同园区 + 专业对口人员（实际由接口按未完成工单最少者分配）
const autoAssignPreview = computed(() => {
  if (!form.plot || !form.taskType) return '选择地块与任务类型后，系统将自动指派给对应专业的工作人员'
  const park = getFarmPlotPark(form.plot)
  const specialty = taskTypeSpecialtyMap[form.taskType] || ''
  const candidates = farmers.filter((f) => f.park === park && f.specialty === specialty)
  if (!candidates.length) return `园区「${park}」暂无「${specialty}」专业人员，下发后需手动指派`
  return `园区「${park}」专业「${specialty}」人员：${candidates.map((f) => f.name).join('、')}，将自动指派给任务最少者`
})

const rules = {
  orderNo: [{ required: true, message: '请输入工单编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  plot: [{ required: true, message: '请选择地块', trigger: 'change' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
}

// 不同工单状态使用不同颜色的状态标签（待派单灰 / 已派单蓝 / 进行中橙 / 已完成绿）
function statusClass(status) {
  return {
    待派单: 'status-tag--pending',
    已派单: 'status-tag--assigned',
    进行中: 'status-tag--doing',
    已完成: 'status-tag--done',
  }[status] || 'status-tag--pending'
}

const flowMap = { 待派单: ['已派单'], 已派单: ['进行中'], 进行中: ['已完成'], 已完成: [] }

function nextStatuses(status) {
  return flowMap[status] || []
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmOrdersApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    // 删除末页最后一条记录后自动回退到有效页码，避免显示空表
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value))
    if (page.value > maxPage) {
      page.value = maxPage
      return load()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载工单失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function resetFilters() {
  filters.status = ''
  filters.keyword = ''
  page.value = 1
  load()
}

function handlePageChange(p) {
  page.value = p
  load()
}

function handleSizeChange(s) {
  pageSize.value = s
  page.value = 1
  load()
}

function genOrderNo() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `GD${ymd}${String(Math.floor(Math.random() * 90) + 10)}`
}

function openCreate() {
  Object.assign(form, { orderNo: genOrderNo(), title: '', plot: '', taskType: '', deadline: '' })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await createFarmOrderApi({ ...form })
      ElMessage.success(res.assignee ? `工单已下发，已自动指派给「${res.assignee}」` : '工单已下发，暂无匹配专业人员，请手动指派')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '下发失败')
    } finally {
      saving.value = false
    }
  })
}

function openAssign(row) {
  currentOrder.value = row
  const cur = farmers.find((f) => f.name === row.assignee)
  assignForm.assignee = cur && assignableFarmers.value.some((f) => f.id === cur.id) ? cur.id : ''
  assignVisible.value = true
}

async function submitAssign() {
  if (assignForm.assignee === '' || assignForm.assignee == null) {
    ElMessage.warning('请选择要指派的农户')
    return
  }
  saving.value = true
  try {
    await assignFarmOrderApi(currentOrder.value.id, assignForm.assignee)
    const farmer = farmers.find((f) => f.id === Number(assignForm.assignee))
    ElMessage.success(`已指派给「${farmer?.name || ''}」`)
    assignVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e.message || '指派失败')
  } finally {
    saving.value = false
  }
}

async function changeStatus(row, status) {
  try {
    await updateFarmOrderStatusApi(row.id, status)
    ElMessage.success(`工单「${row.title}」已流转为「${status}」`)
    load()
  } catch (e) {
    ElMessage.warning(e.message || '状态流转失败')
  }
}

async function removeOrder(row) {
  try {
    await ElMessageBox.confirm(`确定要删除工单「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmOrderApi(row.id)
    ElMessage.success('工单已删除')
    load()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">农事工单派单</h2>
      <span class="page-desc">{{ isAdmin ? '下发后按园区与专业自动指派，也可手动调整，工单状态流转闭环管理' : '工单仅系统管理员可下发、指派与流转，当前账号仅可查看' }}</span>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="工单编号 / 标题 / 地块 / 被指派人" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <el-form-item label-width="0" class="filter-buttons">
              <el-button type="primary" @click="search"><el-icon><Search /></el-icon>查询</el-button>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">农事工单<span class="record-count">共 {{ total }} 单</span></span>
          <el-button v-if="isAdmin" type="primary" size="small" @click="openCreate"><el-icon><Plus /></el-icon>下发工单</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="orderNo" label="工单编号" width="150" />
        <el-table-column prop="title" label="任务标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" width="90" align="center" />
        <el-table-column label="指派农户" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.assignee">{{ row.assignee }}</span>
            <el-tag v-else type="info" size="small">未指派</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="110" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :class="statusClass(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isAdmin" label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== '已完成'" link type="primary" size="small" @click="openAssign(row)">{{ row.assignee ? '调整指派' : '手动指派' }}</el-button>
            <el-dropdown v-if="nextStatuses(row.status).length" trigger="click" @command="(s) => changeStatus(row, s)">
              <el-button link type="warning" size="small">
                状态流转<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="s in nextStatuses(row.status)" :key="s" :command="s">流转为「{{ s }}」</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button link type="danger" size="small" @click="removeOrder(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="下发农事工单" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="工单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="自动生成，可手改" />
        </el-form-item>
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="地块" prop="plot">
              <el-select v-model="form.plot" placeholder="请选择地块" style="width: 100%">
                <el-option v-for="p in farmPlotNameList" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="form.taskType" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="o in farmOperationTypes" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.deadline" type="date" placeholder="请选择截止日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="指派方式">
          <div class="assign-auto-tip">{{ autoAssignPreview }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">下发</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignVisible" :title="currentOrder?.assignee ? '手动调整指派' : '手动指派农户'" width="480px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="工单">
          <span class="assign-order">{{ currentOrder?.orderNo }} · {{ currentOrder?.title }}</span>
        </el-form-item>
        <el-form-item label="任务要求">
          <span class="assign-require">任务类型「{{ currentOrder?.taskType }}」→ 专业「{{ requiredSpecialty }}」 · 园区「{{ currentOrderPark }}」</span>
        </el-form-item>
        <el-form-item label="当前指派">
          <span v-if="currentOrder?.assignee" class="assign-order">{{ currentOrder.assignee }}</span>
          <el-tag v-else type="info" size="small">未指派</el-tag>
        </el-form-item>
        <el-form-item label="指派农户">
          <el-select v-model="assignForm.assignee" placeholder="请选择同园区、专业对口人员" style="width: 100%">
            <el-option v-for="f in assignableFarmers" :key="f.id" :label="`${f.name}（${f.specialty}）`" :value="f.id" />
          </el-select>
          <div v-if="!assignableFarmers.length" class="assign-empty">当前园区暂无「{{ requiredSpecialty }}」专业人员，请先补充人员</div>
          <div v-else class="assign-hint">仅可选择同园区、专业对口人员，手动指派将覆盖自动指派结果</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitAssign">确认指派</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  margin-bottom: -18px;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
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

.record-count {
  font-size: 12px;
  color: #868e96;
  margin-left: 10px;
  font-weight: 400;
}

.assign-order {
  color: #1f2d3d;
  font-weight: 500;
}

.assign-require {
  color: #b8860b;
  font-size: 12px;
  line-height: 1.6;
}

.assign-empty {
  margin-top: 6px;
  font-size: 12px;
  color: #f56c6c;
}

.assign-auto-tip {
  font-size: 12px;
  line-height: 1.6;
  color: #1c7ed6;
}

.assign-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #adb5bd;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>