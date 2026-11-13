<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPestsApi } from '@/api'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(8)

const filters = reactive({ keyword: '', type: '', crop: '', severity: '' })
const crops = ref([])
const counts = reactive({ diseaseCount: 0, insectCount: 0 })
const typeOptions = ['病害', '虫害']
const severityOptions = ['高', '中', '低']

const detailVisible = ref(false)
const current = ref(null)

function typeTag(type) {
  return type === '病害' ? 'danger' : 'warning'
}

function severityTag(severity) {
  return { 高: 'danger', 中: 'warning', 低: 'info' }[severity] || 'info'
}

function cropLabel(crops) {
  return crops.split('、').join(' · ')
}

async function load() {
  loading.value = true
  try {
    const res = await getPestsApi({ ...filters, page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
    crops.value = res.crops
    counts.diseaseCount = res.diseaseCount
    counts.insectCount = res.insectCount
    const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value))
    if (page.value > maxPage) {
      page.value = maxPage
      return load()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载病虫害图库失败')
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
  filters.crop = ''
  filters.severity = ''
  page.value = 1
  load()
}

function quickType(type) {
  filters.type = type
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

function goPlan() {
  router.push({ path: '/knowledge/pest-plans', query: { keyword: current.value.name } })
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">病虫害知识库</h2>
      <span class="page-desc">病害、虫害图库，收录名称、形态特征、危害症状与发生规律</span>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value">{{ counts.diseaseCount }}</div>
          <div class="stat-label">病害图鉴（种）</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value orange">{{ counts.insectCount }}</div>
          <div class="stat-label">虫害图鉴（种）</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="never" class="stat-card">
          <div class="stat-value primary">{{ counts.diseaseCount + counts.insectCount }}</div>
          <div class="stat-label">图鉴总数（种）</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="70px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="名称 / 别名 / 作物 / 症状" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="类型">
              <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 100%">
                <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="4">
            <el-form-item label="作物">
              <el-select v-model="filters.crop" placeholder="全部作物" clearable filterable style="width: 100%">
                <el-option v-for="c in crops" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="3">
            <el-form-item label="程度">
              <el-select v-model="filters.severity" placeholder="全部" clearable style="width: 100%">
                <el-option v-for="s in severityOptions" :key="s" :label="s + '风险'" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="18" :md="5">
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
        <el-button size="small" :type="filters.type === '病害' ? 'danger' : ''" plain @click="quickType('病害')">病害图鉴</el-button>
        <el-button size="small" :type="filters.type === '虫害' ? 'warning' : ''" plain @click="quickType('虫害')">虫害图鉴</el-button>
      </div>
    </el-card>

    <el-row :gutter="16">
      <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="pest-card" @click="openDetail(item)">
          <div class="pest-cover" :class="item.type === '病害' ? 'disease' : 'insect'">
            <el-icon :size="34" color="#fff"><component :is="item.type === '病害' ? 'Crop' : 'Aim'" /></el-icon>
            <span class="pest-id">{{ item.id }}</span>
          </div>
          <div class="pest-body">
            <div class="pest-head">
              <span class="pest-name">{{ item.name }}</span>
              <el-tag :type="typeTag(item.type)" size="small" effect="dark">{{ item.type }}</el-tag>
            </div>
            <div class="pest-alias">别名：{{ item.alias }}</div>
            <div class="pest-crop">{{ cropLabel(item.crops) }}</div>
            <div class="pest-foot">
              <el-tag :type="severityTag(item.severity)" size="small" effect="plain">{{ item.severity }}风险</el-tag>
              <span class="pest-season">{{ item.season }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !list.length" description="未找到匹配的病虫害" />

    <el-card v-if="total" shadow="never" class="pagination-card">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[8, 16, 24]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-drawer v-model="detailVisible" title="病虫害详情" size="520px">
      <template v-if="current">
        <div class="detail-head">
          <div class="detail-name">{{ current.name }}</div>
          <div class="detail-tags">
            <el-tag :type="typeTag(current.type)" size="small" effect="dark">{{ current.type }}</el-tag>
            <el-tag :type="severityTag(current.severity)" size="small" effect="plain">{{ current.severity }}风险</el-tag>
          </div>
        </div>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="别名">{{ current.alias }}</el-descriptions-item>
          <el-descriptions-item label="危害作物">{{ cropLabel(current.crops) }}</el-descriptions-item>
          <el-descriptions-item label="发生季节">{{ current.season }}</el-descriptions-item>
          <el-descriptions-item label="易发区域">{{ current.region }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">形态特征</div>
        <div class="section-text">{{ current.feature }}</div>
        <div class="section-title">危害症状</div>
        <div class="section-text">{{ current.symptom }}</div>
        <div class="section-title">发生规律</div>
        <div class="section-text">{{ current.rule }}</div>

        <div class="drawer-footer">
          <el-button type="primary" @click="goPlan">
            <el-icon><FirstAidKit /></el-icon>
            查看防治方案
          </el-button>
        </div>
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

.pest-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.09);
}

.pest-card :deep(.el-card__body) {
  padding: 0;
}

.pest-cover {
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #fff;
}

.pest-cover.disease {
  background: linear-gradient(135deg, #ff6b6b, #e03131);
}

.pest-cover.insect {
  background: linear-gradient(135deg, #ffa94d, #e8590c);
}

.pest-id {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 11px;
  opacity: 0.75;
}

.pest-body {
  padding: 12px 14px 14px;
}

.pest-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pest-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2d3d;
}

.pest-alias {
  font-size: 12px;
  color: #868e96;
  margin-top: 6px;
}

.pest-crop {
  font-size: 12px;
  color: #495057;
  margin-top: 6px;
  height: 34px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pest-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.pest-season {
  font-size: 12px;
  color: #adb5bd;
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

.drawer-footer {
  margin-top: 24px;
  text-align: right;
}
</style>
