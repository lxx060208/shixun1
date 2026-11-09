<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCustomersApi, saveCustomerApi, deleteCustomerApi, getCustomerOrdersApi } from '@/api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const analysis = reactive({ totalCustomers: 0, aLevelCount: 0, repeatCount: 0, repurchaseRate: 0 })

const filters = reactive({ keyword: '', level: '', type: '' })
const levelOptions = ['A', 'B', 'C']
const typeOptions = ['企业', '合作社', '个人']

const dialogVisible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  name: '',
  type: '企业',
  level: 'C',
  contact: '',
  phone: '',
  address: '',
  remark: '',
})

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入客户地址', trigger: 'blur' }],
}

const recordVisible = ref(false)
const currentCustomer = ref(null)
const records = ref([])
const recordsLoading = ref(false)

const recordsSummary = computed(() => {
  const paid = records.value.filter((r) => r.status !== '待支付')
  const amount = paid.reduce((sum, r) => sum + r.amount, 0)
  return {
    count: paid.length,
    amount: amount.toFixed(2),
    avg: paid.length ? (amount / paid.length).toFixed(2) : '0.00',
    total: records.value.length,
  }
})

function money(n) {
  return (Number(n) || 0).toFixed(2)
}

function levelType(level) {
  return { A: 'danger', B: 'warning', C: 'info' }[level] || 'info'
}

function statusType(status) {
  return { 待支付: 'warning', 已发货: 'primary', 已完成: 'success' }[status] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getCustomersApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(analysis, res.analysis)
  } catch (e) {
    ElMessage.error(e.message || '加载客户档案失败')
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
  filters.level = ''
  filters.type = ''
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
  Object.assign(form, { id: '', name: '', type: '企业', level: 'C', contact: '', phone: '', address: '', remark: '' })
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    level: row.level,
    contact: row.contact,
    phone: row.phone,
    address: row.address,
    remark: row.remark,
  })
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveCustomerApi({ ...form })
      ElMessage.success(isEdit.value ? '客户档案已更新' : '客户档案已建立')
      dialogVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function openRecords(row) {
  currentCustomer.value = row
  recordVisible.value = true
  recordsLoading.value = true
  try {
    records.value = await getCustomerOrdersApi(row.id)
  } catch (e) {
    ElMessage.error(e.message || '加载采购记录失败')
  } finally {
    recordsLoading.value = false
  }
}

async function removeCustomer(row) {
  try {
    await ElMessageBox.confirm(`确定要删除客户「${row.name}」的档案吗？`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteCustomerApi(row.id)
    ElMessage.success('客户档案已删除')
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
      <h2 class="page-title">客户档案管理</h2>
      <span class="page-desc">客户信息建档、采购记录查询、客户分级与复购分析</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ analysis.totalCustomers }}</div>
          <div class="stat-label">客户总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value danger">{{ analysis.aLevelCount }}</div>
          <div class="stat-label">A 级客户</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success">{{ analysis.repeatCount }}</div>
          <div class="stat-label">复购客户</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ analysis.repurchaseRate }}%</div>
          <div class="stat-label">客户复购率</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="客户名称 / 联系人 / 电话 / 地址" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="等级">
              <el-select v-model="filters.level" placeholder="全部等级" clearable style="width: 100%">
                <el-option v-for="l in levelOptions" :key="l" :label="l + ' 级'" :value="l" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
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
          <span class="table-title">客户档案<span class="record-count">共 {{ total }} 位</span></span>
          <el-button type="primary" size="small" @click="openCreate">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="客户名称" min-width="190" show-overflow-tooltip />
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">{{ row.type }}</template>
        </el-table-column>
        <el-table-column label="等级" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系人 / 电话" min-width="160">
          <template #default="{ row }">
            <div>{{ row.contact }}</div>
            <div class="sub-text">{{ row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="有效采购次数" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.repeat" type="success" size="small" effect="plain">{{ row.purchaseCount }} 次</el-tag>
            <span v-else>{{ row.purchaseCount }} 次</span>
          </template>
        </el-table-column>
        <el-table-column label="累计采购额" width="120" align="right">
          <template #default="{ row }">￥{{ money(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column label="最近采购" width="150">
          <template #default="{ row }">{{ row.lastOrderTime || '—' }}</template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openRecords(row)">采购记录</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeCustomer(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户档案' : '新增客户档案'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="form.name" placeholder="企业 / 合作社 / 个人名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户类型">
              <el-select v-model="form.type" style="width: 100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户等级">
              <el-select v-model="form.level" style="width: 100%">
                <el-option label="A 级（核心客户）" value="A" />
                <el-option label="B 级（稳定客户）" value="B" />
                <el-option label="C 级（普通客户）" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="客户地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="客户偏好、结算方式、配送要求等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="recordVisible" title="客户采购记录" size="640px">
      <template v-if="currentCustomer">
        <div class="customer-brief">
          <div class="brief-name">
            {{ currentCustomer.name }}
            <el-tag :type="levelType(currentCustomer.level)" size="small" effect="dark">{{ currentCustomer.level }} 级</el-tag>
          </div>
          <div class="brief-meta">{{ currentCustomer.contact }} · {{ currentCustomer.phone }} · {{ currentCustomer.type }}</div>
        </div>

        <el-row :gutter="12" class="record-summary">
          <el-col :span="8"><div class="mini-card"><b>{{ recordsSummary.count }}</b><span>有效采购次数</span></div></el-col>
          <el-col :span="8"><div class="mini-card"><b>￥{{ recordsSummary.amount }}</b><span>累计采购额</span></div></el-col>
          <el-col :span="8"><div class="mini-card"><b>￥{{ recordsSummary.avg }}</b><span>平均单笔金额</span></div></el-col>
        </el-row>

        <el-table v-loading="recordsLoading" :data="records" size="small" stripe max-height="420">
          <el-table-column prop="orderNo" label="订单号" width="140" />
          <el-table-column prop="product" label="农产品" min-width="150" show-overflow-tooltip />
          <el-table-column label="数量" width="90" align="right">
            <template #default="{ row }">{{ row.qty }} {{ row.unit }}</template>
          </el-table-column>
          <el-table-column label="金额" width="100" align="right">
            <template #default="{ row }">￥{{ money(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="下单时间" width="145" />
        </el-table>
      </template>
    </el-drawer>
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

.stat-value.danger {
  color: #e03131;
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

.sub-text {
  font-size: 12px;
  color: #868e96;
  margin-top: 2px;
}

.customer-brief {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
}

.brief-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.brief-meta {
  font-size: 12px;
  color: #868e96;
  margin-top: 6px;
}

.record-summary {
  margin-bottom: 16px;
}

.mini-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.mini-card b {
  display: block;
  font-size: 18px;
  color: #e8590c;
}

.mini-card span {
  font-size: 12px;
  color: #868e96;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
