<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmRecordsApi, saveFarmRecordApi, deleteFarmRecordApi } from '@/api'
import { farmOperationTypes, farmPlotNameList, farmers } from '@/api/mock'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ keyword: '' })

const submitting = ref(false)
const formRef = ref()
const imageFiles = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const isEdit = ref(false)
const form = reactive({
  id: '',
  orderNo: '',
  plot: '',
  taskType: '',
  worker: '',
  workHours: 1,
  materials: '',
})

const rules = {
  orderNo: [{ required: true, message: '请输入工单编号', trigger: 'blur' }],
  plot: [{ required: true, message: '请选择地块', trigger: 'change' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  worker: [{ required: true, message: '请选择执行人', trigger: 'change' }],
}

function taskType2(type) {
  return { 播种: 'success', 移栽: 'primary', 施肥: 'warning', 打药: 'danger', 除草: 'info', 采收: 'success' }[type] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmRecordsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
  } catch (e) {
    ElMessage.error(e.message || '加载台账失败')
  } finally {
    loading.value = false
  }
}

function search() {
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

function resetForm() {
  isEdit.value = false
  Object.assign(form, { id: '', orderNo: '', plot: '', taskType: '', worker: '', workHours: 1, materials: '' })
  imageFiles.value = []
}

function onImageChange(uploadFile) {
  const raw = uploadFile.raw
  if (raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadFile.url = e.target.result
    }
    reader.readAsDataURL(raw)
  }
}

function onPreview(uploadFile) {
  previewUrl.value = uploadFile.url
  previewVisible.value = true
}

function onImageRemove(_file, fileList) {
  imageFiles.value = fileList
}

async function submitRecord() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const images = imageFiles.value.map((f) => f.url).filter(Boolean)
    submitting.value = true
    try {
      await saveFarmRecordApi({ ...form, images })
      ElMessage.success(isEdit.value ? '台账记录已更新' : '打卡成功，已记入台账')
      resetForm()
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    orderNo: row.orderNo,
    plot: row.plot,
    taskType: row.taskType,
    worker: row.worker,
    workHours: row.workHours,
    materials: row.materials,
  })
  imageFiles.value = (row.images || []).map((url, i) => ({ name: `photo-${i + 1}`, url }))
}

async function removeRecord(row) {
  try {
    await ElMessageBox.confirm(`确定要删除该条打卡台账记录吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmRecordApi(row.id)
    ElMessage.success('台账记录已删除')
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
      <h2 class="page-title">农事执行打卡与台账</h2>
      <span class="page-desc">现场拍照打卡、工时物料记录、农事全周期台账沉淀</span>
    </div>

    <el-card shadow="never" class="punch-card">
      <template #header>
        <span class="table-title">农事执行打卡{{ isEdit ? '（编辑记录）' : '' }}</span>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="工单编号" prop="orderNo">
              <el-input v-model="form.orderNo" placeholder="如 GD2026110503" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="地块" prop="plot">
              <el-select v-model="form.plot" placeholder="请选择地块" style="width: 100%">
                <el-option v-for="p in farmPlotNameList" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="任务类型" prop="taskType">
              <el-select v-model="form.taskType" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="o in farmOperationTypes" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="执行人" prop="worker">
              <el-select v-model="form.worker" placeholder="请选择执行人" style="width: 100%">
                <el-option v-for="f in farmers" :key="f.id" :label="f.name" :value="f.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="工时(h)">
              <el-input-number v-model="form.workHours" :min="0.5" :step="0.5" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <el-form-item label="物料记录">
              <el-input v-model="form.materials" placeholder="记录使用的物料/农资/机械，如：草莓专用水溶肥 12kg" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="现场拍照">
          <el-upload
            v-model:file-list="imageFiles"
            list-type="picture-card"
            accept="image/*"
            :auto-upload="false"
            :on-change="onImageChange"
            :on-preview="onPreview"
            :on-remove="onImageRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持上传现场照片，本地预览，最多建议 5 张</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitRecord">
            <el-icon><CameraFilled /></el-icon>{{ isEdit ? '保存修改' : '提交打卡' }}
          </el-button>
          <el-button @click="resetForm">清空</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">农事台账<span class="record-count">共 {{ total }} 条</span></span>
          <el-input v-model="filters.keyword" placeholder="工单 / 地块 / 执行人" clearable style="width: 240px" @keyup.enter="search" @clear="search">
            <template #append>
              <el-button @click="search"><el-icon><Search /></el-icon></el-button>
            </template>
          </el-input>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="orderNo" label="工单编号" width="150" />
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column label="任务类型" width="90" align="center">
          <template #default="{ row }"><el-tag :type="taskType2(row.taskType)" size="small" effect="dark">{{ row.taskType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="worker" label="执行人" width="90" align="center" />
        <el-table-column label="工时(h)" width="80" align="center">
          <template #default="{ row }">{{ row.workHours }}</template>
        </el-table-column>
        <el-table-column prop="materials" label="物料记录" min-width="200" show-overflow-tooltip />
        <el-table-column label="现场照片" width="110" align="center">
          <template #default="{ row }">
            <div class="photo-cell">
              <el-image v-if="row.images && row.images.length" :src="row.images[0]" fit="cover" class="photo-thumb" :preview-src-list="row.images" />
              <span class="photo-count">{{ (row.images || []).length }} 张</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="recordTime" label="打卡时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeRecord(row)">删除</el-button>
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

    <el-dialog v-model="previewVisible" title="照片预览" width="480px">
      <img :src="previewUrl" alt="现场照片" class="preview-img" />
    </el-dialog>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.punch-card {
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

.record-count {
  font-size: 12px;
  color: #868e96;
  margin-left: 10px;
  font-weight: 400;
}

.upload-tip {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 8px;
  width: 100%;
}

.photo-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.photo-thumb {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.photo-count {
  font-size: 12px;
  color: #868e96;
}

.preview-img {
  width: 100%;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>