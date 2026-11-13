<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmHarvestApi, saveFarmHarvestApi, deleteFarmHarvestApi } from '@/api'
import { farmCrops, farmPlotNameList } from '@/api/mock'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const stats = reactive({ totalQuantity: 0, batchCount: 0, gradeARate: 0, plotCount: 0 })

const filters = reactive({ keyword: '', crop: '' })

const dialogVisible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  batchNo: '',
  plot: '',
  crop: '',
  harvestDate: '',
  gradeA: 0,
  gradeB: 0,
  gradeC: 0,
})

const rules = {
  batchNo: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  plot: [{ required: true, message: '请选择地块', trigger: 'change' }],
  crop: [{ required: true, message: '请选择作物', trigger: 'change' }],
  harvestDate: [{ required: true, message: '请选择采收日期', trigger: 'change' }],
}

const formTotal = computed(() => Number(form.gradeA) + Number(form.gradeB) + Number(form.gradeC))

function batchQuantity(row) {
  return (Number(row.gradeA) || 0) + (Number(row.gradeB) || 0) + (Number(row.gradeC) || 0)
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmHarvestApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(stats, res.stats)
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value))
    if (page.value > maxPage) {
      page.value = maxPage
      return load()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载产量数据失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function resetFilters() {
  filters.keyword = ''
  filters.crop = ''
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

function genBatchNo() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `SH${ymd}${String(Math.floor(Math.random() * 90) + 10)}`
}

function openCreate() {
  isEdit.value = false
  Object.assign(form, { id: '', batchNo: genBatchNo(), plot: '', crop: '', harvestDate: '', gradeA: 0, gradeB: 0, gradeC: 0 })
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    batchNo: row.batchNo,
    plot: row.plot,
    crop: row.crop,
    harvestDate: row.harvestDate,
    gradeA: row.gradeA,
    gradeB: row.gradeB,
    gradeC: row.gradeC,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveFarmHarvestApi({ ...form })
      ElMessage.success(isEdit.value ? '采收批次已更新' : '采收批次已登记')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function removeBatch(row) {
  try {
    await ElMessageBox.confirm(`确定要删除采收批次「${row.batchNo}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmHarvestApi(row.id)
    ElMessage.success('采收批次已删除')
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
      <h2 class="page-title">采收与产量管理</h2>
      <span class="page-desc">采收批次登记、分级产量记录与产量统计分析</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success">{{ stats.totalQuantity.toLocaleString() }}<span class="unit">kg</span></div>
          <div class="stat-label">累计总产量</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.batchCount }}</div>
          <div class="stat-label">采收批次数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ stats.gradeARate }}<span class="unit">%</span></div>
          <div class="stat-label">特级果占比</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value warning">{{ stats.plotCount }}</div>
          <div class="stat-label">参与地块数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="批次号 / 地块 / 作物" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="作物">
              <el-select v-model="filters.crop" placeholder="全部作物" clearable style="width: 100%">
                <el-option v-for="c in farmCrops" :key="c" :label="c" :value="c" />
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
          <span class="table-title">采收批次<span class="record-count">共 {{ total }} 批</span></span>
          <el-button type="primary" size="small" @click="openCreate"><el-icon><Plus /></el-icon>登记采收</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="batchNo" label="批次号" width="150" />
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column prop="crop" label="作物" width="80" align="center" />
        <el-table-column prop="harvestDate" label="采收日期" width="110" align="center" />
        <el-table-column label="总产量(kg)" width="110" align="right">
          <template #default="{ row }"><b>{{ batchQuantity(row).toLocaleString() }}</b></template>
        </el-table-column>
        <el-table-column label="分级记录(kg)" min-width="230">
          <template #default="{ row }">
            <div class="grade-cell">
              <el-tag type="warning" size="small" effect="plain">特级 {{ row.gradeA }}</el-tag>
              <el-tag type="success" size="small" effect="plain">一级 {{ row.gradeB }}</el-tag>
              <el-tag type="info" size="small" effect="plain">二级 {{ row.gradeC }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="登记时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeBatch(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采收批次' : '登记采收批次'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNo">
              <el-input v-model="form.batchNo" placeholder="自动生成，可手改" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采收日期" prop="harvestDate">
              <el-date-picker v-model="form.harvestDate" type="date" placeholder="请选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地块" prop="plot">
              <el-select v-model="form.plot" placeholder="请选择地块" style="width: 100%">
                <el-option v-for="p in farmPlotNameList" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作物" prop="crop">
              <el-select v-model="form.crop" placeholder="请选择作物" style="width: 100%">
                <el-option v-for="c in farmCrops" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="特级(kg)">
              <el-input-number v-model="form.gradeA" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="一级(kg)">
              <el-input-number v-model="form.gradeB" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="二级(kg)">
              <el-input-number v-model="form.gradeC" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="total-line">合计产量：<b>{{ formTotal.toLocaleString() }} kg</b></div>
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

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.2;
}

.stat-value.success {
  color: #2f9e44;
}

.stat-value.primary {
  color: #1c7ed6;
}

.stat-value.warning {
  color: #e8a33d;
}

.unit {
  font-size: 13px;
  font-weight: 400;
  color: #868e96;
  margin-left: 4px;
}

.stat-label {
  font-size: 13px;
  color: #868e96;
  margin-top: 4px;
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

.grade-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.total-line {
  text-align: right;
  font-size: 15px;
  color: #1f2d3d;
  margin-top: 8px;
}

.total-line b {
  color: #2f9e44;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>