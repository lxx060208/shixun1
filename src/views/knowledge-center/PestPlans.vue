<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPestPlansApi } from '@/api'

const route = useRoute()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({ keyword: '', type: '' })
const stats = reactive({ total: 0, disease: 0, insect: 0, drugs: 0 })
const typeOptions = ['病害', '虫害']

const detailVisible = ref(false)
const current = ref(null)

function typeTag(type) {
  return type === '病害' ? 'danger' : 'warning'
}

function severityTag(severity) {
  return { 高: 'danger', 中: 'warning', 低: 'info' }[severity] || 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await getPestPlansApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    Object.assign(stats, res.stats)
  } catch (e) {
    ElMessage.error(e.message || '加载防治方案失败')
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
  filters.type = ''
  page.value = 1
  load()
}

function quickType(type) {
  filters.type = filters.type === type ? '' : type
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

function openDetail(item) {
  current.value = item
  detailVisible.value = true
}

onMounted(() => {
  if (route.query.keyword) filters.keyword = route.query.keyword
  load()
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">病虫害防治方案库</h2>
      <span class="page-desc">为每种病虫害提供对应防治方案、推荐用药、物理与生物防治方法</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ stats.total }}</div>
          <div class="stat-label">防治方案（套）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ stats.disease }}</div>
          <div class="stat-label">病害防治方案（套）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value orange">{{ stats.insect }}</div>
          <div class="stat-label">虫害防治方案（套）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value green">{{ stats.drugs }}</div>
          <div class="stat-label">推荐用药（种）</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="9">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="病虫害名称 / 别名 / 作物 / 防治原则" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="5">
            <el-form-item label="类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="18" :md="10">
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

      <div class="quick-tabs">
        <span class="quick-label">快速查看：</span>
        <el-button size="small" :type="filters.type === '病害' ? 'danger' : ''" plain @click="quickType('病害')">病害方案</el-button>
        <el-button size="small" :type="filters.type === '虫害' ? 'warning' : ''" plain @click="quickType('虫害')">虫害方案</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="table-title">防治方案清单</span>
          <span class="record-count">共 {{ total }} 套方案</span>
        </div>
      </template>

      <el-table :data="list" stripe>
        <el-table-column prop="name" label="病虫害" min-width="130">
          <template #default="{ row }">
            <span class="pest-name">{{ row.name }}</span>
            <span class="pest-alias">{{ row.alias }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small" effect="dark">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="crops" label="危害作物" min-width="150" show-overflow-tooltip />
        <el-table-column prop="severity" label="风险程度" width="100">
          <template #default="{ row }">
            <el-tag :type="severityTag(row.severity)" size="small" effect="plain">{{ row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plan.principle" label="防治原则" min-width="240" show-overflow-tooltip />
        <el-table-column label="推荐用药" width="100" align="center">
          <template #default="{ row }">{{ row.plan.drugs.length }} 种</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看方案</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && !list.length" description="未找到匹配的防治方案" />
    </el-card>

    <el-card v-if="total" shadow="never" class="pagination-card">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-drawer v-model="detailVisible" title="防治方案详情" size="620px">
      <template v-if="current">
        <div class="detail-head">
          <div class="detail-name">{{ current.name }}</div>
          <div class="detail-tags">
            <el-tag :type="typeTag(current.type)" size="small" effect="dark">{{ current.type }}</el-tag>
            <el-tag :type="severityTag(current.severity)" size="small" effect="plain">{{ current.severity }}风险</el-tag>
          </div>
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="别名">{{ current.alias }}</el-descriptions-item>
          <el-descriptions-item label="危害作物">{{ current.crops }}</el-descriptions-item>
          <el-descriptions-item label="发生季节">{{ current.season }}</el-descriptions-item>
          <el-descriptions-item label="易发区域">{{ current.region }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">防治原则</div>
        <div class="section-text">{{ current.plan.principle }}</div>
        <div class="section-title">农业防治</div>
        <div class="section-text">{{ current.plan.agri }}</div>
        <div class="section-title">物理防治</div>
        <div class="section-text">{{ current.plan.physical }}</div>
        <div class="section-title">生物防治</div>
        <div class="section-text">{{ current.plan.biological }}</div>

        <div class="section-title">化学防治 · 推荐用药</div>
        <el-table :data="current.plan.drugs" size="small" border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="药剂名称" min-width="170" />
          <el-table-column prop="dosage" label="用量与用法" min-width="200" />
          <el-table-column prop="interval" label="安全间隔期" width="130" />
        </el-table>

        <div class="section-title">注意事项</div>
        <div class="section-text note">{{ current.plan.note }}</div>
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
  color: #e03131;
}

.stat-value.orange {
  color: #e8590c;
}

.stat-value.primary {
  color: #1c7ed6;
}

.stat-value.green {
  color: #2f9e44;
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

.quick-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
}

.quick-label {
  font-size: 13px;
  color: #868e96;
}

.table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
}

.record-count {
  font-size: 13px;
  color: #868e96;
}

.pest-name {
  font-weight: 600;
  color: #1f2d3d;
}

.pest-alias {
  font-size: 12px;
  color: #adb5bd;
  margin-left: 6px;
}

.pagination-card :deep(.el-card__body) {
  display: flex;
  justify-content: flex-end;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.detail-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
}

.detail-tags {
  display: flex;
  gap: 8px;
}

.section-title {
  font-weight: 600;
  color: #1f2d3d;
  margin: 18px 0 8px;
  padding-left: 8px;
  border-left: 3px solid #40c057;
}

.section-text {
  font-size: 13px;
  line-height: 1.8;
  color: #495057;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 14px;
}

.section-text.note {
  background: #fff9db;
  color: #a06a00;
}
</style>
