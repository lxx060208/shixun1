<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFarmMaterialsApi,
  saveFarmMaterialApi,
  adjustFarmStockApi,
  deleteFarmMaterialApi,
  getFarmPurchasesApi,
  saveFarmPurchaseApi,
  deleteFarmPurchaseApi,
} from '@/api'
import { farmMaterials, farmers } from '@/api/mock'

const categories = ['肥料', '农药', '种子', '其他']
const activeTab = ref('stock')

/* ---- 库存 ---- */
const stockLoading = ref(false)
const stockList = ref([])
const stockTotal = ref(0)
const lowStockCount = ref(0)
const page = ref(1)
const pageSize = ref(10)
const stockFilters = reactive({ keyword: '', category: '' })

const materialDialog = ref(false)
const adjustDialog = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const materialFormRef = ref()
const materialForm = reactive({ id: '', name: '', category: '肥料', spec: '', unit: '袋', stock: 0, threshold: 10, location: '' })
const adjustForm = reactive({ id: '', name: '', currentStock: 0, unit: '', type: 'in', quantity: 0 })

const materialRules = {
  name: [{ required: true, message: '请输入农资名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
}

/* ---- 采购 ---- */
const purchaseLoading = ref(false)
const purchaseList = ref([])
const purchaseTotal = ref(0)
const totalAmount = ref(0)
const purchasePage = ref(1)
const purchasePageSize = ref(10)
const purchaseKeyword = ref('')

const purchaseDialog = ref(false)
const purchaseSaving = ref(false)
const purchaseFormRef = ref()
const purchaseForm = reactive({ id: '', purchaseNo: '', material: '', supplier: '', quantity: 0, unit: '袋', unitPrice: 0, purchaser: '' })

const purchaseRules = {
  material: [{ required: true, message: '请选择农资', trigger: 'change' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
}

const purchaseAmount = computed(() => Number((purchaseForm.quantity * purchaseForm.unitPrice).toFixed(2)) || 0)

async function loadStock() {
  stockLoading.value = true
  try {
    const res = await getFarmMaterialsApi({ ...stockFilters, page: page.value, pageSize: pageSize.value })
    stockList.value = res.list
    stockTotal.value = res.total
    lowStockCount.value = res.lowStockCount
  } catch (e) {
    ElMessage.error(e.message || '加载库存失败')
  } finally {
    stockLoading.value = false
  }
}

function searchStock() {
  page.value = 1
  loadStock()
}

function resetStockFilters() {
  stockFilters.keyword = ''
  stockFilters.category = ''
  page.value = 1
  loadStock()
}

function handlePageChange(p) {
  page.value = p
  loadStock()
}

function handleSizeChange(s) {
  pageSize.value = s
  page.value = 1
  loadStock()
}

function openCreateMaterial() {
  isEdit.value = false
  Object.assign(materialForm, { id: '', name: '', category: '肥料', spec: '', unit: '袋', stock: 0, threshold: 10, location: '' })
  materialDialog.value = true
}

function openEditMaterial(row) {
  isEdit.value = true
  Object.assign(materialForm, { id: row.id, name: row.name, category: row.category, spec: row.spec, unit: row.unit, stock: row.stock, threshold: row.threshold, location: row.location })
  materialDialog.value = true
}

async function submitMaterial() {
  if (!materialFormRef.value) return
  await materialFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveFarmMaterialApi({ ...materialForm })
      ElMessage.success(isEdit.value ? '农资已更新' : '农资已入库建档')
      materialDialog.value = false
      loadStock()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

function openAdjust(row) {
  Object.assign(adjustForm, { id: row.id, name: row.name, currentStock: row.stock, unit: row.unit, type: 'in', quantity: 0 })
  adjustDialog.value = true
}

async function submitAdjust() {
  if (!adjustForm.quantity || adjustForm.quantity <= 0) {
    ElMessage.warning('请输入正确数量')
    return
  }
  saving.value = true
  try {
    await adjustFarmStockApi(adjustForm.id, { type: adjustForm.type, quantity: adjustForm.quantity })
    ElMessage.success(adjustForm.type === 'in' ? '入库成功' : '出库成功')
    adjustDialog.value = false
    loadStock()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    saving.value = false
  }
}

async function removeMaterial(row) {
  try {
    await ElMessageBox.confirm(`确定要删除农资「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmMaterialApi(row.id)
    ElMessage.success('农资已删除')
    loadStock()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

/* ---- 采购记录 ---- */
async function loadPurchases() {
  purchaseLoading.value = true
  try {
    const res = await getFarmPurchasesApi({ keyword: purchaseKeyword.value, page: purchasePage.value, pageSize: purchasePageSize.value })
    purchaseList.value = res.list
    purchaseTotal.value = res.total
    totalAmount.value = res.totalAmount
  } catch (e) {
    ElMessage.error(e.message || '加载采购记录失败')
  } finally {
    purchaseLoading.value = false
  }
}

function searchPurchases() {
  purchasePage.value = 1
  loadPurchases()
}

function handlePurchasePageChange(p) {
  purchasePage.value = p
  loadPurchases()
}

function handlePurchaseSizeChange(s) {
  purchasePageSize.value = s
  purchasePage.value = 1
  loadPurchases()
}

function genPurchaseNo() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `CG${ymd}${String(Math.floor(Math.random() * 90) + 10)}`
}

function onMaterialChange(name) {
  const m = farmMaterials.find((i) => i.name === name)
  if (m) purchaseForm.unit = m.unit
}

function openCreatePurchase() {
  Object.assign(purchaseForm, { id: '', purchaseNo: genPurchaseNo(), material: '', supplier: '', quantity: 0, unit: '袋', unitPrice: 0, purchaser: '' })
  purchaseDialog.value = true
}

async function submitPurchase() {
  if (!purchaseFormRef.value) return
  await purchaseFormRef.value.validate(async (valid) => {
    if (!valid) return
    purchaseSaving.value = true
    try {
      await saveFarmPurchaseApi({ ...purchaseForm, amount: purchaseAmount.value })
      ElMessage.success('采购记录已登记')
      purchaseDialog.value = false
      loadPurchases()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      purchaseSaving.value = false
    }
  })
}

async function removePurchase(row) {
  try {
    await ElMessageBox.confirm(`确定要删除采购记录「${row.purchaseNo}」吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteFarmPurchaseApi(row.id)
    ElMessage.success('采购记录已删除')
    loadPurchases()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadStock()
  loadPurchases()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">农资库存管理</h2>
      <span class="page-desc">农资出入库、低库存预警与采购记录</span>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 库存 -->
      <el-tab-pane label="库存管理" name="stock">
        <el-card shadow="never" class="filter-card">
          <div class="stock-alert">
            <el-alert :type="lowStockCount > 0 ? 'warning' : 'success'" :closable="false" show-icon>
              <template #title>
                当前有 <b>{{ lowStockCount }}</b> 项农资处于低库存状态（库存 ≤ 预警阈值），请及时补货。
              </template>
            </el-alert>
          </div>
          <el-form :model="stockFilters" label-width="70px" class="filter-form">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="12" :md="10">
                <el-form-item label="关键字">
                  <el-input v-model="stockFilters.keyword" placeholder="农资名称 / 规格 / 库位" clearable @keyup.enter="searchStock" />
                </el-form-item>
              </el-col>
              <el-col :xs="12" :sm="6" :md="4">
                <el-form-item label="分类">
                  <el-select v-model="stockFilters.category" placeholder="全部分类" clearable style="width: 100%">
                    <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="24" :md="6">
                <el-form-item label-width="0" class="filter-buttons">
                  <el-button type="primary" @click="searchStock"><el-icon><Search /></el-icon>查询</el-button>
                  <el-button @click="resetStockFilters">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="table-title">库存列表<span class="record-count">共 {{ stockTotal }} 项</span></span>
              <el-button type="primary" size="small" @click="openCreateMaterial"><el-icon><Plus /></el-icon>新增农资</el-button>
            </div>
          </template>

          <el-table v-loading="stockLoading" :data="stockList" stripe>
            <el-table-column prop="name" label="农资名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="80" align="center">
              <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="spec" label="规格" width="110" align="center" />
            <el-table-column label="库存" width="90" align="center">
              <template #default="{ row }">
                <span :class="{ 'low-stock': row.stock <= row.threshold }">{{ row.stock }}</span> {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column prop="threshold" label="预警阈值" width="90" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.stock <= row.threshold" type="danger" size="small">低库存</el-tag>
                <el-tag v-else type="success" size="small">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="库位" width="120" align="center" />
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column label="操作" width="210" fixed="right">
              <template #default="{ row }">
                <el-button link type="success" size="small" @click="openAdjust(row)">入库/出库</el-button>
                <el-button link type="primary" size="small" @click="openEditMaterial(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="removeMaterial(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="stockTotal"
              :current-page="page"
              :page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 采购记录 -->
      <el-tab-pane label="采购记录" name="purchase">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="table-title">采购记录<span class="record-count">累计采购额 ¥{{ totalAmount.toLocaleString() }}</span></span>
              <div class="purchase-header-right">
                <el-input v-model="purchaseKeyword" placeholder="采购单号 / 农资 / 供应商" clearable style="width: 240px" @keyup.enter="searchPurchases" @clear="searchPurchases">
                  <template #append>
                    <el-button @click="searchPurchases"><el-icon><Search /></el-icon></el-button>
                  </template>
                </el-input>
                <el-button type="primary" size="small" @click="openCreatePurchase"><el-icon><Plus /></el-icon>登记采购</el-button>
              </div>
            </div>
          </template>

          <el-table v-loading="purchaseLoading" :data="purchaseList" stripe>
            <el-table-column prop="purchaseNo" label="采购单号" width="150" />
            <el-table-column prop="material" label="农资名称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="supplier" label="供应商" min-width="160" show-overflow-tooltip />
            <el-table-column label="数量" width="100" align="center">
              <template #default="{ row }">{{ row.quantity }} {{ row.unit }}</template>
            </el-table-column>
            <el-table-column label="单价(¥)" width="100" align="right">
              <template #default="{ row }">{{ row.unitPrice }}</template>
            </el-table-column>
            <el-table-column label="金额(¥)" width="120" align="right">
              <template #default="{ row }"><b>{{ row.amount }}</b></template>
            </el-table-column>
            <el-table-column prop="purchaser" label="采购人" width="90" align="center" />
            <el-table-column prop="purchaseTime" label="采购时间" width="160" />
            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="removePurchase(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="purchaseTotal"
              :current-page="purchasePage"
              :page-size="purchasePageSize"
              :page-sizes="[10, 20, 50]"
              @current-change="handlePurchasePageChange"
              @size-change="handlePurchaseSizeChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑农资 -->
    <el-dialog v-model="materialDialog" :title="isEdit ? '编辑农资' : '新增农资'" width="560px" destroy-on-close>
      <el-form ref="materialFormRef" :model="materialForm" :rules="materialRules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="农资名称" prop="name">
              <el-input v-model="materialForm.name" placeholder="请输入农资名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="materialForm.category" style="width: 100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格">
              <el-input v-model="materialForm.spec" placeholder="如 50kg/袋" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="materialForm.unit" placeholder="袋 / 瓶 / 卷" />
            </el-form-item>
          </el-col>
          <el-col v-if="!isEdit" :span="12">
            <el-form-item label="初始库存">
              <el-input-number v-model="materialForm.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预警阈值">
              <el-input-number v-model="materialForm.threshold" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库位">
              <el-input v-model="materialForm.location" placeholder="如 南山农资库" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="materialDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitMaterial">保存</el-button>
      </template>
    </el-dialog>

    <!-- 出入库 -->
    <el-dialog v-model="adjustDialog" title="农资出入库" width="440px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="农资">
          <span class="adjust-name">{{ adjustForm.name }}（当前库存 {{ adjustForm.currentStock }} {{ adjustForm.unit }}）</span>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-radio-group v-model="adjustForm.type">
            <el-radio value="in">入库</el-radio>
            <el-radio value="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="adjustForm.quantity" :min="0.1" :precision="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitAdjust">确认</el-button>
      </template>
    </el-dialog>

    <!-- 登记采购 -->
    <el-dialog v-model="purchaseDialog" title="登记采购记录" width="560px" destroy-on-close>
      <el-form ref="purchaseFormRef" :model="purchaseForm" :rules="purchaseRules" label-width="90px">
        <el-form-item label="采购单号">
          <el-input v-model="purchaseForm.purchaseNo" placeholder="自动生成，可手改" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="农资名称" prop="material">
              <el-select v-model="purchaseForm.material" placeholder="请选择农资" style="width: 100%" @change="onMaterialChange">
                <el-option v-for="m in farmMaterials" :key="m.id" :label="m.name" :value="m.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="purchaseForm.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="purchaseForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单位">
              <el-input v-model="purchaseForm.unit" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="单价(¥)">
              <el-input-number v-model="purchaseForm.unitPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购人">
              <el-select v-model="purchaseForm.purchaser" placeholder="请选择采购人" clearable style="width: 100%">
                <el-option v-for="f in farmers" :key="f.id" :label="f.name" :value="f.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金额(¥)">
              <div class="amount-preview">¥ {{ purchaseAmount }}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="purchaseDialog = false">取消</el-button>
        <el-button type="primary" :loading="purchaseSaving" @click="submitPurchase">保存</el-button>
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

.stock-alert {
  margin-bottom: 16px;
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

.low-stock {
  color: #d03050;
  font-weight: 700;
}

.purchase-header-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.adjust-name {
  color: #5c6470;
}

.amount-preview {
  font-size: 18px;
  font-weight: 700;
  color: #2f9e44;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>