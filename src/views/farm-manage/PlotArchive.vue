<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmPlotsApi, saveFarmPlotApi, deleteFarmPlotApi } from '@/api'
import { farmCrops, farmSoilTypes, farmers } from '@/api/mock'

const parks = ['南山智慧农业示范园', '清水有机蔬菜基地', '花溪生态果园']

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const summary = reactive({ totalArea: 0, inUseCount: 0 })

const filters = reactive({ keyword: '', crop: '' })

const dialogVisible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  plotCode: '',
  name: '',
  area: null,
  crop: '',
  location: '南山智慧农业示范园',
  soilType: '壤土',
  owner: '',
  coverImage: '',
  status: 1,
})

const rules = {
  plotCode: [{ required: true, message: '请输入地块编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
  area: [{ required: true, message: '请输入地块面积', trigger: 'blur' }],
  crop: [{ required: true, message: '请选择种植作物', trigger: 'change' }],
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmPlotsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(summary, { totalArea: res.totalArea, inUseCount: res.inUseCount })
  } catch (e) {
    ElMessage.error(e.message || '加载地块档案失败')
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

function openCreate() {
  isEdit.value = false
  Object.assign(form, { id: '', plotCode: '', name: '', area: null, crop: '', location: '南山智慧农业示范园', soilType: '壤土', owner: '', coverImage: '', status: 1 })
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    plotCode: row.plotCode,
    name: row.name,
    area: row.area,
    crop: row.crop,
    location: row.location,
    soilType: row.soilType,
    owner: row.owner,
    coverImage: row.coverImage,
    status: row.status,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveFarmPlotApi({ ...form })
      ElMessage.success(isEdit.value ? '地块档案已更新' : '地块档案已建档')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function removePlot(row) {
  try {
    await ElMessageBox.confirm(`确定要删除地块「${row.name}」的档案吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmPlotApi(row.id)
    ElMessage.success('地块档案已删除')
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
      <h2 class="page-title">地块档案管理</h2>
      <span class="page-desc">地块基础信息建档、面积作物维护与在档状态管理</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">地块总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success">{{ summary.totalArea }}</div>
          <div class="stat-label">总面积（亩）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ summary.inUseCount }}</div>
          <div class="stat-label">使用中地块</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="地块编码 / 名称 / 位置 / 负责人" clearable @keyup.enter="search" />
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
          <span class="table-title">地块档案<span class="record-count">共 {{ total }} 块</span></span>
          <el-button type="primary" size="small" @click="openCreate"><el-icon><Plus /></el-icon>新建设备地块</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="plotCode" label="编码" width="80" />
        <el-table-column label="地块名称" min-width="180">
          <template #default="{ row }">
            <div class="plot-cell">
              <div v-if="row.coverImage" class="plot-thumb">
                <el-image :src="row.coverImage" fit="cover" class="thumb-img">
                  <template #error><el-icon><Crop /></el-icon></template>
                </el-image>
              </div>
              <div v-else class="plot-thumb placeholder"><el-icon><Crop /></el-icon></div>
              <span class="plot-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="面积(亩)" width="90" align="center">
          <template #default="{ row }">{{ row.area }}</template>
        </el-table-column>
        <el-table-column label="作物" width="90" align="center">
          <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.crop }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="location" label="位置园区" min-width="180" show-overflow-tooltip />
        <el-table-column prop="soilType" label="土壤类型" width="90" align="center" />
        <el-table-column prop="owner" label="负责人" width="90" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '使用中' : '闲置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="建档时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removePlot(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑地块档案' : '新建地块档案'" width="620px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="地块编码" prop="plotCode">
              <el-input v-model="form.plotCode" placeholder="如 A-01" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地块名称" prop="name">
              <el-input v-model="form.name" placeholder="如 A-01 大田" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面积(亩)" prop="area">
              <el-input-number v-model="form.area" :min="1" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作物" prop="crop">
              <el-select v-model="form.crop" placeholder="请选择作物" style="width: 100%">
                <el-option v-for="c in farmCrops" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="位置园区">
              <el-select v-model="form.location" style="width: 100%">
                <el-option v-for="p in parks" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="土壤类型">
              <el-select v-model="form.soilType" style="width: 100%">
                <el-option v-for="s in farmSoilTypes" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人">
              <el-select v-model="form.owner" placeholder="请选择负责人" clearable style="width: 100%">
                <el-option v-for="f in farmers" :key="f.id" :label="f.name" :value="f.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用状态">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="使用中" inactive-text="闲置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地块图片">
          <el-input v-model="form.coverImage" placeholder="可填写图片 URL，留空显示占位图标" />
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

.plot-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plot-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.plot-thumb.placeholder {
  background: #e9f7ef;
  color: #2f9e44;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.thumb-img {
  width: 100%;
  height: 100%;
}

.thumb-img :deep(.el-image__error) {
  background: #e9f7ef;
  color: #2f9e44;
}

.plot-name {
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>