<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmOrdersApi, createFarmOrderApi, assignFarmOrderApi, updateFarmOrderStatusApi, deleteFarmOrderApi } from '@/api'
import { farmOperationTypes, farmPlotNameList, farmers } from '@/api/mock'

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
const form = reactive({ orderNo: '', title: '', plot: '', taskType: '', deadline: '' })

const rules = {
  orderNo: [{ required: true, message: '请输入工单编号', trigger: 'blur' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  plot: [{ required: true, message: '请选择地块', trigger: 'change' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
}

function statusType(status) {
  return { 待派单: 'info', 已派单: 'primary', 进行中: 'warning', 已完成: 'success' }[status] || 'info'
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
      await createFarmOrderApi({ ...form })
      ElMessage.success('工单已下发')
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
  assignForm.assignee = row.assignee || ''
  assignVisible.value = true
}

async function submitAssign() {
  if (!assignForm.assignee) {
    ElMessage.warning('请选择要指派的农户')
    return
  }
  saving.value = true
  try {
    await assignFarmOrderApi(currentOrder.value.id, assignForm.assignee)
    ElMessage.success(`已指派给「${assignForm.assignee}」`)
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
      <span class="page-desc">任务下发、指派农户、工单状态流转闭环管理</span>
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
          <el-button type="primary" size="small" @click="openCreate"><el-icon><Plus /></el-icon>下发工单</el-button>
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
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== '已完成'" link type="primary" size="small" @click="openAssign(row)">指派</el-button>
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
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">下发</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignVisible" title="指派农户" width="440px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="工单">
          <span class="assign-order">{{ currentOrder?.orderNo }} · {{ currentOrder?.title }}</span>
        </el-form-item>
        <el-form-item label="指派农户">
          <el-select v-model="assignForm.assignee" placeholder="请选择农户" style="width: 100%">
            <el-option v-for="f in farmers" :key="f.id" :label="`${f.name}（${f.park}）`" :value="f.name" />
          </el-select>
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>