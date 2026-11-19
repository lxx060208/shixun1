<script setup>
import { reactive, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmRecordsApi, saveFarmRecordApi, deleteFarmRecordApi, getMyFarmOrdersApi, getFarmMaterialsApi } from '@/api'
import { farmOperationTypes, farmPlotNameList, farmers } from '@/api/mock'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
// 当前登录账号姓名：农事台账只展示指派给本人（当前账号）的农事工单
const myName = computed(() => auth.userInfo?.name || '')
// 系统管理员可维护全部台账记录，工作人员仅能编辑本人记录且无删除权限
const isAdmin = computed(() => auth.userInfo?.roleCode === 'admin')
// 执行人可选项：管理员可为任意人员录入，工作人员仅能为本人打卡
const workerOptions = computed(() => {
  if (isAdmin.value) return farmers
  if (!myName.value) return []
  const mine = farmers.find((f) => f.name === myName.value)
  return mine ? [mine] : [{ id: 'self', name: myName.value }]
})

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ keyword: '' })

// 我的农事工单：管理员指派给当前账号的工单及状态
const orderStatusOptions = ['已派单', '进行中', '已完成']
const orderLoading = ref(false)
const myOrders = ref([])
const myOrderTotal = ref(0)
const myOrderPage = ref(1)
const myOrderPageSize = ref(5)
const orderStatusCounts = ref({})
const orderFilters = reactive({ status: '', keyword: '' })
const punchRef = ref(null)

const submitting = ref(false)
const formRef = ref()
const imageFiles = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')
const isEdit = ref(false)
// 消耗农资：从农资库存中选择本次作业实际使用的物资/工具，提交后自动出库
const materialCategories = ['肥料', '农药', '种子', '种苗', '工具', '其他']
const materialCategory = ref('')
const materialOptions = ref([])
const consumption = ref([])
const materialMap = computed(() => {
  const map = {}
  materialOptions.value.forEach((m) => {
    map[m.name] = m
  })
  return map
})

// 按分类分组展示农资/工具，便于快速查找所需物资
const materialGroups = computed(() => {
  const groups = new Map()
  materialOptions.value.forEach((m) => {
    if (materialCategory.value && m.category !== materialCategory.value) return
    if (!groups.has(m.category)) groups.set(m.category, [])
    groups.get(m.category).push(m)
  })
  const ordered = materialCategories.filter((c) => groups.has(c))
  const rest = [...groups.keys()].filter((c) => !materialCategories.includes(c))
  return [...ordered, ...rest].map((c) => ({ category: c, list: groups.get(c) }))
})

function materialUnit(name) {
  return materialMap.value[name]?.unit || ''
}

// 本次消耗预览：自动汇总为物料记录文本
const consumedPreview = computed(() =>
  consumption.value
    .filter((c) => c.material && Number(c.quantity) > 0)
    .map((c) => `${c.material} ${c.quantity}${materialUnit(c.material)}`)
    .join('，')
)

function addConsumption() {
  consumption.value.push({ material: '', quantity: 1 })
}

function removeConsumption(index) {
  consumption.value.splice(index, 1)
}

function resetConsumption(list = []) {
  const rows = list.length ? list : [{ material: '', quantity: 1 }]
  consumption.value = rows.map((c) => ({ material: c.material, quantity: Number(c.quantity) || 0 }))
}

async function loadMaterialOptions() {
  try {
    const res = await getFarmMaterialsApi({ page: 1, pageSize: 999 })
    materialOptions.value = res.list
  } catch (e) {
    /* 库存选项加载失败不阻断打卡 */
  }
}
const form = reactive({
  id: '',
  orderNo: '',
  plot: '',
  taskType: '',
  worker: '',
  workHours: 1,
  materials: '',
  remark: '',
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

// 不同工单状态使用不同颜色的状态标签（待派单灰 / 已派单蓝 / 进行中橙 / 已完成绿）
function orderStatusClass(status) {
  return {
    待派单: 'status-tag--pending',
    已派单: 'status-tag--assigned',
    进行中: 'status-tag--doing',
    已完成: 'status-tag--done',
  }[status] || 'status-tag--pending'
}

async function loadMyOrders() {
  orderLoading.value = true
  try {
    const res = await getMyFarmOrdersApi({ ...orderFilters, page: myOrderPage.value, pageSize: myOrderPageSize.value })
    myOrders.value = res.list
    myOrderTotal.value = res.total
    orderStatusCounts.value = res.statusCounts || {}
    const maxPage = Math.max(1, Math.ceil(res.total / myOrderPageSize.value))
    if (myOrderPage.value > maxPage) {
      myOrderPage.value = maxPage
      return loadMyOrders()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载我的工单失败')
  } finally {
    orderLoading.value = false
  }
}

function searchMyOrders() {
  myOrderPage.value = 1
  loadMyOrders()
}

function resetMyOrderFilters() {
  orderFilters.status = ''
  orderFilters.keyword = ''
  myOrderPage.value = 1
  loadMyOrders()
}

function handleMyOrderPageChange(p) {
  myOrderPage.value = p
  loadMyOrders()
}

function handleMyOrderSizeChange(s) {
  myOrderPageSize.value = s
  myOrderPage.value = 1
  loadMyOrders()
}

// 依据工单信息预填打卡表单，便于被指派人直接执行并回填台账
function punchFromOrder(row) {
  resetForm()
  Object.assign(form, {
    orderNo: row.orderNo,
    plot: row.plot,
    taskType: row.taskType,
    worker: row.assignee || myName.value,
  })
  ElMessage.success('已带入工单信息，请补充工时与现场照片后提交')
  punchRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function load() {
  loading.value = true
  try {
    const res = await getFarmRecordsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value))
    if (page.value > maxPage) {
      page.value = maxPage
      return load()
    }
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
  Object.assign(form, {
    id: '',
    orderNo: '',
    plot: '',
    taskType: '',
    // 工作人员执行人固定为本人，避免替他人打卡
    worker: isAdmin.value ? '' : myName.value,
    workHours: 1,
    materials: '',
    remark: '',
  })
  imageFiles.value = []
  resetConsumption()
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
    // 本次消耗的农资/工具：空行忽略；数量与库存先在前端校验
    const consumed = consumption.value
      .filter((c) => c.material)
      .map((c) => ({ material: c.material, quantity: Number(c.quantity) || 0 }))
    if (consumed.some((c) => c.quantity <= 0)) {
      ElMessage.warning('请输入正确的农资消耗数量')
      return
    }
    const lack = consumed.find((c) => {
      const m = materialMap.value[c.material]
      return m && c.quantity > Number(m.stock)
    })
    if (lack) {
      const m = materialMap.value[lack.material]
      ElMessage.warning(`农资「${m.name}」库存不足（当前 ${m.stock}${m.unit}），请先在农资库存管理中入库`)
      return
    }
    // 物料记录优先使用消耗明细汇总，无消耗时保留原文本
    const consumedText = consumed.map((c) => `${c.material} ${c.quantity}${materialUnit(c.material)}`).join('，')
    const materials = consumedText || form.materials.trim()
    const images = imageFiles.value.map((f) => f.url).filter(Boolean)
    submitting.value = true
    try {
      const res = await saveFarmRecordApi({ ...form, materials, consumed, images })
      const stockTip = consumed.length ? `，已同步扣减 ${consumed.length} 项农资库存` : ''
      // 打卡提交后工单状态由接口自动同步，此处提示工作人员
      if (res?.orderStatus) {
        ElMessage.success(`打卡成功，农事工单状态已同步为「${res.orderStatus}」${stockTip}`)
      } else {
        ElMessage.success((isEdit.value ? '台账记录已更新' : '打卡成功，已记入台账') + stockTip)
      }
      resetForm()
      load()
      loadMyOrders()
      loadMaterialOptions()
    } catch (e) {
      ElMessage.error(e.message || '保存失败')
    } finally {
      submitting.value = false
    }
  })
}

function openEdit(row) {
  if (!row.editable) {
    ElMessage.warning('只能修改本人提交的打卡记录')
    return
  }
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    orderNo: row.orderNo,
    plot: row.plot,
    taskType: row.taskType,
    worker: row.worker,
    workHours: row.workHours,
    materials: row.materials,
    remark: row.remark || '',
  })
  resetConsumption(row.consumed || [])
  imageFiles.value = (row.images || []).map((url, i) => ({ name: `photo-${i + 1}`, url }))
}

async function removeRecord(row) {
  if (!row.deletable) {
    ElMessage.warning('打卡台账记录仅系统管理员可删除')
    return
  }
  // 已完成工单的台账删除后工单状态会同步回退，删除前明确提示
  const tip =
    row.orderStatus === '已完成'
      ? `该记录对应工单「${row.orderNo}」已完成，删除后工单状态将同步回退为「进行中」，确定删除吗？`
      : '确定要删除该条打卡台账记录吗？'
  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    const res = await deleteFarmRecordApi(row.id)
    const stockTip = row.consumed?.length ? `，已回补 ${row.consumed.length} 项农资库存` : ''
    if (res?.orderStatus) {
      ElMessage.success(`台账记录已删除，工单「${res.orderNo}」状态已同步回退为「${res.orderStatus}」${stockTip}`)
    } else {
      ElMessage.success(`台账记录已删除${stockTip}`)
    }
    load()
    loadMyOrders()
    loadMaterialOptions()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

// 跨标签页同步：管理员在其他标签页指派工单后，本页台账与工单列表自动刷新
function handleBizStoreChange(e) {
  if (e.key === 'samp_biz_store_v1') {
    loadMyOrders()
    load()
    loadMaterialOptions()
  }
}

onMounted(() => {
  loadMyOrders()
  load()
  loadMaterialOptions()
  window.addEventListener('storage', handleBizStoreChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleBizStoreChange)
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">农事执行打卡与台账</h2>
      <span class="page-desc">查看指派给本账号的农事工单与状态，现场拍照打卡并沉淀农事台账</span>
    </div>

    <el-card shadow="never" class="my-order-card">
      <template #header>
        <div class="card-header">
          <span class="table-title">我的农事工单<span class="record-count">当前账号 {{ myName || '未登录' }} · 共 {{ myOrderTotal }} 单</span></span>
          <div class="order-status-summary">
            <el-tag v-for="s in orderStatusOptions" :key="s" :class="orderStatusClass(s)" size="small">{{ s }} {{ orderStatusCounts[s] || 0 }}</el-tag>
          </div>
        </div>
      </template>

      <div class="order-filter">
        <el-input v-model="orderFilters.keyword" placeholder="工单编号 / 标题 / 地块 / 任务类型" clearable style="width: 260px" @keyup.enter="searchMyOrders" @clear="searchMyOrders" />
        <el-select v-model="orderFilters.status" placeholder="全部状态" clearable style="width: 140px" @change="searchMyOrders">
          <el-option v-for="s in orderStatusOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-button @click="resetMyOrderFilters">重置</el-button>
      </div>

      <el-table v-loading="orderLoading" :data="myOrders" stripe empty-text="当前账号暂无被指派的农事工单">
        <el-table-column prop="orderNo" label="工单编号" width="140" />
        <el-table-column prop="title" label="任务标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column prop="taskType" label="任务类型" width="90" align="center" />
        <el-table-column prop="deadline" label="截止日期" width="110" align="center" />
        <el-table-column label="工单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :class="orderStatusClass(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="打卡情况" min-width="150" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.recorded" type="success" size="small" effect="plain">已打卡 {{ row.recordTime }}</el-tag>
            <el-tag v-else type="info" size="small" effect="plain">未打卡</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="punchFromOrder(row)">{{ row.recorded ? '再打卡' : '去打卡' }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="myOrderTotal"
          :current-page="myOrderPage"
          :page-size="myOrderPageSize"
          :page-sizes="[5, 10, 20]"
          @current-change="handleMyOrderPageChange"
          @size-change="handleMyOrderSizeChange"
        />
      </div>
    </el-card>

    <el-card ref="punchRef" shadow="never" class="punch-card">
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
              <el-select v-model="form.worker" placeholder="请选择执行人" :disabled="!isAdmin" style="width: 100%">
                <el-option v-for="f in workerOptions" :key="f.id" :label="f.name" :value="f.name" />
              </el-select>
              <div v-if="!isAdmin" class="upload-tip">工作人员仅能为本人打卡，执行人已固定为当前账号</div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="工时(h)">
              <el-input-number v-model="form.workHours" :min="0.5" :step="0.5" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="18">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="描述农事执行结果，如：完成 2 亩追肥，作物长势正常，未发现病虫害" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="物料记录">
          <div class="consumption-box">
            <div class="consumption-toolbar">
              <el-select v-model="materialCategory" placeholder="全部分类" clearable size="small" style="width: 120px">
                <el-option v-for="c in materialCategories" :key="c" :label="c" :value="c" />
              </el-select>
              <el-button size="small" type="primary" plain @click="addConsumption"><el-icon><Plus /></el-icon>添加物资 / 工具</el-button>
              <span class="toolbar-tip">从农资库存中选择本次执行消耗的物资与工具</span>
            </div>
            <div v-for="(c, i) in consumption" :key="i" class="consumption-row">
              <el-select v-model="c.material" filterable placeholder="选择物资 / 工具" style="width: 280px">
                <el-option-group v-for="g in materialGroups" :key="g.category" :label="g.category">
                  <el-option v-for="m in g.list" :key="m.id" :label="m.name" :value="m.name">
                    <span class="option-name">{{ m.name }}</span>
                    <span class="option-stock">{{ m.spec || '—' }} · 库存 {{ m.stock }}{{ m.unit }}</span>
                  </el-option>
                </el-option-group>
              </el-select>
              <el-input-number v-model="c.quantity" :min="0.1" :precision="1" :controls="false" style="width: 110px" />
              <span class="consumption-unit">{{ materialUnit(c.material) }}</span>
              <el-button link type="danger" size="small" @click="removeConsumption(i)">移除</el-button>
            </div>
            <div v-if="!consumption.length" class="consumption-empty">暂未添加物资或工具，点击「添加物资 / 工具」选择</div>
            <div v-if="consumedPreview" class="consumed-preview">本单物料：{{ consumedPreview }}</div>
            <div class="upload-tip">提交后自动从库存扣减所选物资与工具；库存不足会提示，请先在「农资库存管理」入库。</div>
          </div>
        </el-form-item>

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
        <el-table-column label="工单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.orderStatus" :class="orderStatusClass(row.orderStatus)" size="small">{{ row.orderStatus }}</el-tag>
            <span v-else class="op-none">无关联工单</span>
          </template>
        </el-table-column>
        <el-table-column prop="plot" label="地块" min-width="150" show-overflow-tooltip />
        <el-table-column label="任务类型" width="90" align="center">
          <template #default="{ row }"><el-tag :type="taskType2(row.taskType)" size="small" effect="dark">{{ row.taskType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="worker" label="执行人" width="90" align="center" />
        <el-table-column label="工时(h)" width="80" align="center">
          <template #default="{ row }">{{ row.workHours }}</template>
        </el-table-column>
        <el-table-column prop="materials" label="物料记录" min-width="200" show-overflow-tooltip />
        <el-table-column label="消耗农资" min-width="220">
          <template #default="{ row }">
            <template v-if="row.consumed && row.consumed.length">
              <el-tag v-for="c in row.consumed" :key="c.material" size="small" effect="plain" class="consumed-tag">{{ c.material }} ×{{ c.quantity }}{{ c.unit }}</el-tag>
            </template>
            <span v-else class="op-none">未登记</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.remark">{{ row.remark }}</span>
            <span v-else class="op-none">无</span>
          </template>
        </el-table-column>
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
            <el-button v-if="row.editable" link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="row.deletable" link type="danger" size="small" @click="removeRecord(row)">删除</el-button>
            <span v-if="!row.editable && !row.deletable" class="op-none">仅查看</span>
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

.my-order-card {
  margin-bottom: 16px;
}

.punch-card {
  margin-bottom: 16px;
}

.order-status-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.order-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.op-none {
  font-size: 12px;
  color: #adb5bd;
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

.consumption-box {
  width: 100%;
}

.consumption-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.toolbar-tip {
  font-size: 12px;
  color: #adb5bd;
}

.consumption-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.consumption-unit {
  width: 28px;
  font-size: 12px;
  color: #868e96;
}

.option-name {
  margin-right: 12px;
}

.option-stock {
  float: right;
  font-size: 12px;
  color: #adb5bd;
}

.consumption-empty {
  font-size: 12px;
  color: #adb5bd;
  padding: 2px 0 4px;
}

.consumed-preview {
  margin: 2px 0 6px;
  font-size: 12px;
  color: #2f9e44;
}

.consumed-tag {
  margin: 2px 4px 2px 0;
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