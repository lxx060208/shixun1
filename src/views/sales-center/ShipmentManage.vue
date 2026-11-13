<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getShipmentsApi, shipOrderApi, getOrdersApi } from '@/api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const filters = reactive({ keyword: '', status: '' })
const statusOptions = ['运输中', '已签收', '异常']
const stats = reactive({ total: 0, shipping: 0, signed: 0, abnormal: 0 })

const trackVisible = ref(false)
const currentShipment = ref(null)

const shipVisible = ref(false)
const shipping = ref(false)
const shipFormRef = ref()
const pendingOrders = ref([])
const shipForm = reactive({ orderId: '', logisticsCompany: '顺丰速运', logisticsNo: '' })
const logisticsOptions = ['顺丰速运', '京东物流', '德邦快递', '中通快递']

const shipRules = {
  orderId: [{ required: true, message: '请选择待发货订单', trigger: 'change' }],
  logisticsCompany: [{ required: true, message: '请选择物流公司', trigger: 'change' }],
  logisticsNo: [{ required: true, message: '请输入物流单号', trigger: 'blur' }],
}

const selectedOrder = computed(() => pendingOrders.value.find((o) => o.id === shipForm.orderId))

function money(n) {
  return (Number(n) || 0).toFixed(2)
}

function statusType(status) {
  return { 运输中: 'primary', 已签收: 'success', 异常: 'danger' }[status] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getShipmentsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(stats, res.stats)
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value))
    if (page.value > maxPage) {
      page.value = maxPage
      return load()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载发货单失败')
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
  filters.status = ''
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

async function openShipDialog() {
  try {
    const res = await getOrdersApi({ status: '待支付', page: 1, pageSize: 999 })
    pendingOrders.value = res.list
    if (!res.list.length) {
      ElMessage.info('当前没有待发货的订单')
      return
    }
    Object.assign(shipForm, { orderId: '', logisticsCompany: '顺丰速运', logisticsNo: '' })
    shipVisible.value = true
  } catch (e) {
    ElMessage.error(e.message || '加载待发货订单失败')
  }
}

async function submitShip() {
  if (!shipFormRef.value) return
  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return
    shipping.value = true
    try {
      await shipOrderApi(shipForm.orderId, {
        logisticsCompany: shipForm.logisticsCompany,
        logisticsNo: shipForm.logisticsNo,
      })
      ElMessage.success('发货登记成功，物流轨迹已生成')
      shipVisible.value = false
      page.value = 1
      load()
    } catch (e) {
      ElMessage.error(e.message || '发货登记失败')
    } finally {
      shipping.value = false
    }
  })
}

function openTracking(row) {
  currentShipment.value = row
  trackVisible.value = true
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">发货与物流管理</h2>
      <span class="page-desc">订单发货登记、物流单号录入与发货状态跟踪</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">发货单总数</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ stats.shipping }}</div>
          <div class="stat-label">运输中</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value success">{{ stats.signed }}</div>
          <div class="stat-label">已签收</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value danger">{{ stats.abnormal }}</div>
          <div class="stat-label">物流异常</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="80px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="10">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="发货单号 / 订单号 / 客户 / 物流单号" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="18" :md="10">
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
          <span class="table-title">发货单列表<span class="record-count">共 {{ total }} 条</span></span>
          <el-button type="primary" size="small" @click="openShipDialog">
            <el-icon><Van /></el-icon>
            发货登记
          </el-button>
        </div>
      </template>

      <el-table :data="list" stripe>
        <el-table-column prop="id" label="发货单号" width="150" />
        <el-table-column prop="orderNo" label="关联订单号" width="145" />
        <el-table-column prop="customer" label="客户" min-width="180" show-overflow-tooltip />
        <el-table-column label="农产品 / 数量" min-width="170">
          <template #default="{ row }">{{ row.product }} × {{ row.qty }} {{ row.unit }}</template>
        </el-table-column>
        <el-table-column prop="logisticsCompany" label="物流公司" width="110" />
        <el-table-column prop="logisticsNo" label="物流单号" width="175" />
        <el-table-column prop="shipTime" label="发货时间" width="150" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收货人" width="100">
          <template #default="{ row }">{{ row.receiver }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openTracking(row)">查看轨迹</el-button>
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

    <el-dialog v-model="shipVisible" title="发货登记" width="560px" destroy-on-close>
      <el-form ref="shipFormRef" :model="shipForm" :rules="shipRules" label-width="90px">
        <el-form-item label="发货订单" prop="orderId">
          <el-select v-model="shipForm.orderId" filterable placeholder="选择待发货订单" style="width: 100%">
            <el-option
              v-for="o in pendingOrders"
              :key="o.id"
              :label="`${o.orderNo}　${o.customer}`"
              :value="o.id"
            >
              <span>{{ o.orderNo }}　{{ o.customer }}</span>
              <span class="option-sub">{{ o.product }} × {{ o.qty }}{{ o.unit }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedOrder" label="订单信息">
          <div class="order-brief">
            <span>{{ selectedOrder.product }} × {{ selectedOrder.qty }} {{ selectedOrder.unit }}</span>
            <span class="order-amount">￥{{ money(selectedOrder.amount) }}</span>
          </div>
        </el-form-item>
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

    <el-drawer v-model="trackVisible" title="物流轨迹" size="440px">
      <template v-if="currentShipment">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="发货单号">{{ currentShipment.id }}</el-descriptions-item>
          <el-descriptions-item label="关联订单">{{ currentShipment.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="物流公司">{{ currentShipment.logisticsCompany }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ currentShipment.logisticsNo }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentShipment.receiver }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ currentShipment.address }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusType(currentShipment.status)" size="small" effect="plain">{{ currentShipment.status }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="timeline-title">物流跟踪</div>
        <el-timeline>
          <el-timeline-item
            v-for="(node, idx) in currentShipment.tracking"
            :key="idx"
            :timestamp="node.time"
            :type="idx === 0 ? statusType(currentShipment.status) : 'info'"
            :hollow="idx !== 0"
          >
            <div class="track-desc">{{ node.desc }}</div>
            <div class="track-location">{{ node.location }}</div>
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

.stat-value.primary {
  color: #1c7ed6;
}

.stat-value.success {
  color: #2f9e44;
}

.stat-value.danger {
  color: #e03131;
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

.option-sub {
  float: right;
  font-size: 12px;
  color: #868e96;
}

.order-brief {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 13px;
  color: #495057;
}

.order-amount {
  font-weight: 700;
  color: #e8590c;
}

.timeline-title {
  font-weight: 600;
  margin: 20px 0 14px;
  color: #1f2d3d;
}

.track-desc {
  font-weight: 600;
  color: #1f2d3d;
}

.track-location {
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
