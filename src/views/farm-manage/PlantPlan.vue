<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmPlansApi, saveFarmPlanApi, deleteFarmPlanApi } from '@/api'
import { farmOperationTypes, farmPlotNameList, farmCrops, farmers } from '@/api/mock'

const statusOptions = ['未开始', '进行中', '已完成']

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ operationType: '', keyword: '' })

const dialogVisible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()
const dateRange = ref([])
const form = reactive({
  id: '',
  planName: '',
  plot: '',
  crop: '',
  operationType: '',
  executor: '',
  status: '未开始',
})

const rules = {
  planName: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  plot: [{ required: true, message: '请选择地块', trigger: 'change' }],
  operationType: [{ required: true, message: '请选择农事类型', trigger: 'change' }],
}

function opType(type) {
  return { 播种: 'success', 移栽: 'primary', 施肥: 'warning', 打药: 'danger', 除草: 'info', 采收: 'success' }[type] || 'info'
}

function statusType(status) {
  return { 未开始: 'info', 进行中: 'warning', 已完成: 'success' }[status] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmPlansApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
  } catch (e) {
    ElMessage.error(e.message || '加载种植计划失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function resetFilters() {
  filters.operationType = ''
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

function openCreate() {
  isEdit.value = false
  Object.assign(form, { id: '', planName: '', plot: '', crop: '', operationType: '', executor: '', status: '未开始' })
  dateRange.value = []
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    planName: row.planName,
    plot: row.plot,
    crop: row.crop,
    operationType: row.operationType,
    executor: row.executor,
    status: row.status,
  })
  dateRange.value = [row.startDate, row.endDate]
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!dateRange.value || dateRange.value.length !== 2) {
      ElMessage.warning('请选择计划起止日期')
      return
    }
    saving.value = true
    try {
      await saveFarmPlanApi({ ...form, startDate: dateRange.value[0], endDate: dateRange.value[1] })
      ElMessage.success(isEdit.value ? '种植计划已更新' : '种植计划已创建')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function removePlan(row) {
  try {
    await ElMessageBox.confirm(`确定要删除计划「${row.planName}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmPlanApi(row.id)
    ElMessage.success('种植计划已删除')
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
      <h2 class="page-title">种植计划管理</h2>
      <span class="page-desc">播种、移栽、施肥、打药、除草、采收等全周期农事计划编排</span>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="计划名称 / 地块 / 作物 / 执行人" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="农事类型">
              <el-select v-model="filters.operationType" placeholder="全部类型" clearable style="width: 100%">
                <el-option v-for="o in farmOperationTypes" :key="o" :label="o" :value="o" />
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
          <span class="table-title">种植计划<span class="record-count">共 {{ total }} 条</span></span>
          <el-button type="primary" size="small" @click="openCreate"><el-icon><Plus /></el-icon>新建计划</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="planName" label="计划名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column prop="crop" label="作物" width="80" align="center" />
        <el-table-column label="农事类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="opType(row.operationType)" size="small" effect="dark">{{ row.operationType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="起止日期" width="190">
          <template #default="{ row }">
            <div class="date-range">{{ row.startDate }} ~ {{ row.endDate }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="executor" label="执行人" width="90" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removePlan(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑种植计划' : '新建种植计划'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
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
            <el-form-item label="作物">
              <el-select v-model="form.crop" placeholder="请选择作物" style="width: 100%">
                <el-option v-for="c in farmCrops" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="农事类型" prop="operationType">
              <el-select v-model="form.operationType" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="o in farmOperationTypes" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行人">
              <el-select v-model="form.executor" placeholder="请选择执行人" clearable style="width: 100%">
                <el-option v-for="f in farmers" :key="f.id" :label="f.name" :value="f.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="起止日期" required>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
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

.date-range {
  font-size: 12px;
  color: #5c6470;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>