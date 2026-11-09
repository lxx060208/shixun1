<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductsApi, saveProductApi, toggleProductStatusApi, deleteProductApi } from '@/api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const summary = reactive({ onShelf: 0, offShelf: 0, lowStock: 0 })

const filters = reactive({ keyword: '', category: '', status: '', park: '' })
const categoryOptions = ['蔬菜', '水果', '粮食', '禽蛋']
const gradeOptions = ['A级', 'B级', 'C级']
const statusOptions = ['上架', '下架']
const parkOptions = ['南山智慧农业示范园', '清水有机蔬菜基地', '花溪生态果园']

const dialogVisible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()

const emptyForm = () => ({
  id: '',
  name: '',
  category: '蔬菜',
  variety: '',
  grade: 'A级',
  spec: '',
  unit: 'kg',
  price: undefined,
  stock: 0,
  park: '南山智慧农业示范园',
  status: '上架',
  image: '',
  description: '',
})
const form = reactive(emptyForm())

const rules = {
  name: [{ required: true, message: '请输入农产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择所属品类', trigger: 'change' }],
  variety: [{ required: true, message: '请输入品种', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入包装规格', trigger: 'blur' }],
  price: [{ required: true, message: '请输入销售单价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  park: [{ required: true, message: '请选择所属园区', trigger: 'change' }],
}

function statusType(status) {
  return status === '上架' ? 'success' : 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getProductsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    summary.onShelf = res.onShelf
    summary.offShelf = res.offShelf
    summary.lowStock = res.lowStock
  } catch (e) {
    ElMessage.error(e.message || '加载农产品列表失败')
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
  filters.category = ''
  filters.status = ''
  filters.park = ''
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
  Object.assign(form, emptyForm())
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    category: row.category,
    variety: row.variety,
    grade: row.grade,
    spec: row.spec,
    unit: row.unit,
    price: row.price,
    stock: row.stock,
    park: row.park,
    status: row.status,
    image: row.image,
    description: row.description,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveProductApi({ ...form })
      ElMessage.success(isEdit.value ? '农产品信息已更新' : '农产品已录入')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function toggleStatus(row) {
  const target = row.status === '上架' ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定要${target}「${row.name}」吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await toggleProductStatusApi(row.id, target)
    ElMessage.success(`「${row.name}」已${target}`)
    load()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function removeProduct(row) {
  try {
    await ElMessageBox.confirm(`确定要删除「${row.name}」的农产品档案吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteProductApi(row.id)
    ElMessage.success('农产品已删除')
    load()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">农产品上架管理</h2>
      <span class="page-desc">维护农产品基础信息、规格价格与上下架状态</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ summary.onShelf }}</div>
          <div class="stat-label">在售农产品（款）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ summary.offShelf }}</div>
          <div class="stat-label">已下架农产品（款）</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value warn">{{ summary.lowStock }}</div>
          <div class="stat-label">低库存预警（库存 &lt; 200）</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="80px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="编号 / 名称 / 品种 / 规格" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="品类">
              <el-select v-model="filters.category" placeholder="全部品类" clearable style="width: 100%">
                <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="所属园区">
              <el-select v-model="filters.park" placeholder="全部园区" clearable style="width: 100%">
                <el-option v-for="p in parkOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="0" class="filter-buttons">
              <el-button type="primary" @click="search">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="resetFilters">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">农产品列表<span class="record-count">共 {{ total }} 款</span></span>
          <el-button type="primary" size="small" @click="openCreate">
            <el-icon><Plus /></el-icon>
            录入农产品
          </el-button>
        </div>
      </template>

      <el-table :data="list" stripe>
        <el-table-column label="图片" width="70" align="center">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" fit="cover" class="thumb" />
            <div v-else class="thumb thumb-empty">
              <el-icon><Goods /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="农产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="category" label="品类" width="80" align="center" />
        <el-table-column label="品种 / 等级" min-width="120">
          <template #default="{ row }">{{ row.variety }} / {{ row.grade }}</template>
        </el-table-column>
        <el-table-column prop="spec" label="包装规格" width="100" />
        <el-table-column label="单价" width="110" align="right">
          <template #default="{ row }">￥{{ row.price.toFixed(2) }} / {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="库存" width="100" align="right">
          <template #default="{ row }">
            <span :class="{ 'stock-low': row.stock < 200 }">{{ row.stock }} {{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="近14日销量" width="110" align="right">
          <template #default="{ row }">{{ row.monthSales }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column prop="park" label="所属园区" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link :type="row.status === '上架' ? 'warning' : 'success'" size="small" @click="toggleStatus(row)">
              {{ row.status === '上架' ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" size="small" @click="removeProduct(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑农产品' : '录入农产品'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="农产品名称" prop="name">
              <el-input v-model="form.name" placeholder="如：南山有机番茄" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属品类" prop="category">
              <el-select v-model="form.category" style="width: 100%">
                <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种" prop="variety">
              <el-input v-model="form.variety" placeholder="如：番茄" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级">
              <el-select v-model="form.grade" style="width: 100%">
                <el-option v-for="g in gradeOptions" :key="g" :label="g" :value="g" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包装规格" prop="spec">
              <el-input v-model="form.spec" placeholder="如：5kg/箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售单位">
              <el-select v-model="form.unit" style="width: 100%">
                <el-option label="千克（kg）" value="kg" />
                <el-option label="盒" value="盒" />
                <el-option label="袋" value="袋" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售单价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属园区" prop="park">
              <el-select v-model="form.park" style="width: 100%">
                <el-option v-for="p in parkOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上架状态">
              <el-radio-group v-model="form.status">
                <el-radio value="上架">上架</el-radio>
                <el-radio value="下架">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="图片链接">
              <el-input v-model="form.image" placeholder="选填，填写后可展示农产品图片" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="产品描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="填写种植方式、口感特点、配送要求等" />
            </el-form-item>
          </el-col>
        </el-row>
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
  color: #2f9e44;
  line-height: 1.2;
}

.stat-value.warn {
  color: #e8590c;
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

.thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: block;
  margin: 0 auto;
}

.thumb-empty {
  background: #f1f3f5;
  color: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-low {
  color: #e8590c;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
