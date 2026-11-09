<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrdersApi,
  createOrderApi,
  updateOrderStatusApi,
  shipOrderApi,
  getCustomersApi,
  getProductsApi,
} from '@/api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ keyword: '', status: '', customerId: '', dateRange: [] })
const statusOptions = ['待支付', '已发货', '已完成']
const stats = reactive({ pending: 0, shipped: 0, finished: 0, amount: 0 })

const customerOptions = ref([])
const productOptions = ref([])

const createVisible = ref(false)
const creating = ref(false)
const orderFormRef = ref()
const orderForm = reactive({ customerId: '', productId: '', qty: 1, remark: '' })

const shipVisible = ref(false)
const shipping = ref(false)
const shipFormRef = ref()
const shipForm = reactive({ logisticsCompany: '顺丰速运', logisticsNo: '' })
const shipOrder = ref(null)

const detailVisible = ref(false)
const orderDetail = ref(null)

const logisticsOptions = ['顺丰速运', '京东物流', '德邦快递', '中通快递']

const orderRules = {
  customerId: [{ required: true, message: '请选择下单客户', trigger: 'change' }],
  productId: [{ required: true, message: '请选择农产品', trigger: 'change' }],
  qty: [{ required: true, message: '请输入采购数量', trigger: 'blur' }],
}

const shipRules = {
  logisticsCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  logisticsNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
}

const selectedProduct = computed(() => productOptions.value.find((p) => p.id === orderForm.productId))
const orderAmount = computed(() => {
  const product = selectedProduct.value
  if (!product) return 0
  return Math.round(product.price * (Number(orderForm.qty) || 0) * 100) / 100
})

const timelineItems = computed(() => {
  const o = orderDetail.value
  if (!o) return []
  const items = [{ label: '客户下单', time: o.createTime, desc: `订单 ${o.orderNo} 创建成功，等待支付`, type: 'primary' }]
  if (o.payTime) items.push({ label: '支付完成', time: o.payTime, desc: `订单金额 ￥${money(o.amount)} 已确认到账`, type: 'success' })
  if (o.shipTime) {
    items.push({ label: '订单发货', time: o.shipTime, desc: `${o.logisticsCompany}　运单号 ${o.logisticsNo}`, type: 'warning' })
  }
  if (o.finishTime) items.push({ label: '订单完成', time: o.finishTime, desc: '客户已收货，交易完成', type: 'success' })
  return items
})

function money(n) {
  return (Number(n) || 0).toFixed(2)
}

function statusType(status) {
  return { 待支付: 'warning', 已发货: 'primary', 已完成: 'success' }[status] || 'info'
}

function levelType(level) {
  return { A: 'danger', B: 'warning', C: 'info' }[level] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getOrdersApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(stats, res.stats)
  } catch (e) {
    ElMessage.error(e.message || '加载订单列表失败')
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    const [customers, products] = await Promise.all([
      getCustomersApi({ page: 1, pageSize: 999 }),
      getProductsApi({ status: '上架', page: 1, pageSize: 999 }),
    ])
    customerOptions.value = customers.list
    productOptions.value = products.list
  } catch (e) {
    ElMessage.error(e.message || '加载客户或农产品数据失败')
  }
}

function search() {
  page.value = 1
  load()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  filters.customerId = ''
  filters.dateRange = []
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
  Object.assign(orderForm, { customerId: '', productId: '', qty: 1, remark: '' })
  createVisible.value = true
}

async function submitCreate() {
  if (!orderFormRef.value) return
  await orderFormRef.value.validate(async (valid) => {
    if (!valid) return
    creating.value = true
    try {
      const order = await createOrderApi({ ...orderForm })
      ElMessage.success(`订单 ${order.orderNo} 已创建，当前状态为待支付`)
      createVisible.value = false
      page.value = 1
      load()
    } catch (e) {
      ElMessage.error(e.message || '创建订单失败')
    } finally {
      creating.value = false
    }
  })
}

function openShip(row) {
  shipOrder.value = row
  Object.assign(shipForm, { logisticsCompany: '顺丰速运', logisticsNo: '' })
  shipVisible.value = true
}

async function submitShip() {
  if (!shipFormRef.value || !shipOrder.value) return
  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return
    shipping.value = true
    try {
      await shipOrderApi(shipOrder.value.id, { ...shipForm })
      ElMessage.success(`订单 ${shipOrder.value.orderNo} 已发货`)
      shipVisible.value = false
      load()
    } catch (e) {
      ElMessage.error(e.message || '发货失败')
    } finally {
      shipping.value = false
    }
  })
}

async function finishOrder(row) {
  try {
    await ElMessageBox.confirm(`确认订单 ${row.orderNo} 已完成收货吗？`, '完成订单', {
      confirmButtonText: '确认完成',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await updateOrderStatusApi(row.id, '已完成')
    ElMessage.success('订单已完成')
    load()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

function openDetail(row) {
  orderDetail.value = row
  detailVisible.value = true
}

onMounted(() => {
  load()
  loadOptions()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
      <span class="page-desc">客户下单登记，订单状态流转（待支付 / 已发货 / 已完成）与查询</span>
    </div>

    <div class="order-summary">
      <div class="summary-item">
        <span class="summary-label">待支付</span>
        <span class="summary-value warn">{{ stats.pending }}<i>单</i></span>
      </div>
      <div class="summary-item">
        <span class="summary-label">已发货</span>
        <span class="summary-value primary">{{ stats.shipped }}<i>单</i></span>
      </div>
      <div class="summary-item">
        <span class="summary-label">已完成</span>
        <span class="summary-value success">{{ stats.finished }}<i>单</i></span>
      </div>
      <div class="summary-item">
        <span class="summary-label">已支付销售额</span>
        <span class="summary-value">￥{{ money(stats.amount) }}</span>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="80px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="订单号 / 客户 / 农产品 / 运单号" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6">
            <el-form-item label="客户">
              <el-select v-model="filters.customerId" placeholder="全部客户" clearable filterable style="width: 100%">
                <el-option v-for="c in customerOptions" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="6">
            <el-form-item label="下单日期">
              <el-date-picker
                v-model="filters.dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
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
          <span class="table-title">订单列表<span class="record-count">共 {{ total }} 单</span></span>
          <el-button type="primary" size="small" @click="openCreate">
            <el-icon><Plus /></el-icon>
            新建订单
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="orderNo" label="订单号" width="145" />
        <el-table-column label="客户" min-width="190">
          <template #default="{ row }">
            <div class="customer-cell">
              <el-tag :type="levelType(row.customerLevel)" size="small" effect="dark">{{ row.customerLevel }}</el-tag>
              <span>{{ row.customer }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="农产品 / 规格" min-width="170">
          <template #default="{ row }">
            <div>{{ row.product }}</div>
            <div class="sub-text">{{ row.productSpec }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="95" align="right">
          <template #default="{ row }">{{ row.qty }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">￥{{ money(row.unitPrice) }}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="110" align="right">
          <template #default="{ row }">￥{{ money(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="park" label="所属园区" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="150" />
        <el-table-column label="物流单号" width="160">
          <template #default="{ row }">{{ row.logisticsNo || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === '待支付'" link type="success" size="small" @click="openShip(row)">确认发货</el-button>
            <el-button v-if="row.status === '已发货'" link type="warning" size="small" @click="finishOrder(row)">完成订单</el-button>
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

    <el-dialog v-model="createVisible" title="新建订单" width="560px" destroy-on-close>
      <el-form ref="orderFormRef" :model="orderForm" :rules="orderRules" label-width="90px">
        <el-form-item label="下单客户" prop="customerId">
          <el-select v-model="orderForm.customerId" filterable placeholder="请选择客户" style="width: 100%">
            <el-option v-for="c in customerOptions" :key="c.id" :label="c.name" :value="c.id">
              <span>{{ c.name }}</span>
              <span class="option-sub">{{ c.level }}级 · {{ c.contact }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="农产品" prop="productId">
          <el-select v-model="orderForm.productId" filterable placeholder="请选择农产品" style="width: 100%">
            <el-option v-for="p in productOptions" :key="p.id" :label="p.name" :value="p.id">
              <span>{{ p.name }}</span>
              <span class="option-sub">￥{{ money(p.price) }}/{{ p.unit }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采购数量" prop="qty">
          <el-input-number v-model="orderForm.qty" :min="1" :max="selectedProduct ? selectedProduct.stock : 99999" style="width: 200px" />
          <span v-if="selectedProduct" class="stock-tip">库存 {{ selectedProduct.stock }} {{ selectedProduct.unit }}</span>
        </el-form-item>
        <el-form-item label="订单金额">
          <span class="amount-tip">￥{{ money(orderAmount) }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="orderForm.remark" type="textarea" :rows="2" placeholder="填写配送要求、发票需求等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建订单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="shipVisible" title="登记发货" width="520px" destroy-on-close>
      <div v-if="shipOrder" class="ship-info">
        <div>订单号：{{ shipOrder.orderNo }}</div>
        <div>客户：{{ shipOrder.customer }}</div>
        <div>农产品：{{ shipOrder.product }} × {{ shipOrder.qty }} {{ shipOrder.unit }}</div>
        <div>订单金额：￥{{ money(shipOrder.amount) }}</div>
      </div>
      <el-form ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="90px">
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-select v-model="shipForm.logisticsCompany" style="width: 100%">
            <el-option v-for="l in logisticsOptions" :key="l" :label="l" :value="l" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsNo">
          <el-input v-model="shipForm.logisticsNo" placeholder="请输入快递运单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipping" @click="submitShip">确认发货</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="订单详情" size="460px">
      <template v-if="orderDetail">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="订单号">{{ orderDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ orderDetail.customer }}（{{ orderDetail.customerLevel }}级）</el-descriptions-item>
          <el-descriptions-item label="农产品">{{ orderDetail.product }}</el-descriptions-item>
          <el-descriptions-item label="规格 / 数量">{{ orderDetail.productSpec }} / {{ orderDetail.qty }} {{ orderDetail.unit }}</el-descriptions-item>
          <el-descriptions-item label="单价 / 金额">￥{{ money(orderDetail.unitPrice) }} / ￥{{ money(orderDetail.amount) }}</el-descriptions-item>
          <el-descriptions-item label="所属园区">{{ orderDetail.park }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusType(orderDetail.status)" size="small" effect="plain">{{ orderDetail.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="物流信息">
            {{ orderDetail.logisticsCompany ? orderDetail.logisticsCompany + ' ' + orderDetail.logisticsNo : '尚未发货' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ orderDetail.remark || '—' }}</el-descriptions-item>
        </el-descriptions>
        <div class="timeline-title">订单流转记录</div>
        <el-timeline>
          <el-timeline-item
            v-for="(item, idx) in timelineItems"
            :key="idx"
            :timestamp="item.time"
            :type="item.type"
          >
            <div class="timeline-label">{{ item.label }}</div>
            <div class="timeline-desc">{{ item.desc }}</div>
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.order-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  flex: 1;
  min-width: 150px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 14px 18px;
}

.summary-label {
  display: block;
  font-size: 13px;
  color: #868e96;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.summary-value i {
  font-size: 12px;
  font-style: normal;
  color: #868e96;
  margin-left: 3px;
  font-weight: 400;
}

.summary-value.warn {
  color: #e8590c;
}

.summary-value.primary {
  color: #1c7ed6;
}

.summary-value.success {
  color: #2f9e44;
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

.customer-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-text {
  font-size: 12px;
  color: #868e96;
  margin-top: 2px;
}

.option-sub {
  float: right;
  font-size: 12px;
  color: #868e96;
}

.stock-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #868e96;
}

.amount-tip {
  font-size: 18px;
  font-weight: 700;
  color: #e8590c;
}

.ship-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 18px;
  line-height: 1.9;
  font-size: 13px;
  color: #495057;
}

.timeline-title {
  font-weight: 600;
  margin: 20px 0 14px;
  color: #1f2d3d;
}

.timeline-label {
  font-weight: 600;
  color: #1f2d3d;
}

.timeline-desc {
  font-size: 12px;
  color: #868e96;
  margin-top: 2px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
