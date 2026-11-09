<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { getAlarmHistoryApi } from '@/api'

const loading = ref(false)
const exporting = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filters = reactive({
  keyword: '',
  level: '',
  status: '',
  source: '',
  park: '',
  dateRange: ['2026-10-23', '2026-11-05'],
})

const levelOptions = ['严重', '警告', '提示']
const statusOptions = ['待处置', '已确认', '已处置', '已归档']
const sourceOptions = ['环境告警', '设备告警', '安防告警']
const parkOptions = ['南山智慧农业示范园', '清水有机蔬菜基地', '花溪生态果园']

function levelType(level) {
  return { 严重: 'danger', 警告: 'warning', 提示: 'info' }[level] || 'info'
}

function statusType(status) {
  return { 待处置: 'danger', 已确认: 'warning', 已处置: 'success', 已归档: 'info' }[status] || 'info'
}

function buildParams() {
  return {
    keyword: filters.keyword,
    level: filters.level,
    status: filters.status,
    source: filters.source,
    park: filters.park,
    dateRange: filters.dateRange || [],
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getAlarmHistoryApi({ ...buildParams(), page: page.value, pageSize: pageSize.value })
    list.value = res.list
    total.value = res.total
  } catch (e) {
    ElMessage.error(e.message || '查询告警历史失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function reset() {
  filters.keyword = ''
  filters.level = ''
  filters.status = ''
  filters.source = ''
  filters.park = ''
  filters.dateRange = ['2026-10-23', '2026-11-05']
  page.value = 1
  load()
}

function handleSizeChange(size) {
  pageSize.value = size
  page.value = 1
  load()
}

function handleCurrentChange(p) {
  page.value = p
  load()
}

async function exportExcel() {
  exporting.value = true
  try {
    const res = await getAlarmHistoryApi({ ...buildParams(), page: 1, pageSize: 9999 })
    if (!res.list.length) {
      ElMessage.warning('当前筛选条件下没有可导出的告警记录')
      return
    }
    const rows = res.list.map((a) => ({
      告警编号: a.id,
      告警对象: a.device,
      所属园区: a.park,
      地块: a.plot,
      告警来源: a.source,
      告警类型: a.type,
      告警级别: a.level,
      当前值: a.value,
      触发阈值: a.threshold,
      告警时间: a.time,
      当前状态: a.status,
      处置人: a.handler || '—',
      告警时长分钟: a.durationMin,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 16 }, { wch: 22 }, { wch: 22 }, { wch: 18 }, { wch: 12 },
      { wch: 16 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 20 },
      { wch: 10 }, { wch: 10 }, { wch: 12 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '告警历史')
    XLSX.writeFile(wb, `告警历史查询_${new Date().toISOString().slice(0, 10)}.xlsx`)
    ElMessage.success(`已导出 ${rows.length} 条告警记录`)
  } catch (e) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">告警历史查询与导出</h2>
      <span class="page-desc">多条件筛选近 14 日告警记录，支持分页查询与 Excel 导出</span>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filters" label-width="80px" class="filter-form">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="时间范围">
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
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="关键字">
              <el-input v-model="filters.keyword" placeholder="告警编号 / 对象 / 类型" clearable @keyup.enter="search" />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="4">
            <el-form-item label="级别">
              <el-select v-model="filters.level" placeholder="全部级别" clearable style="width: 100%">
                <el-option v-for="l in levelOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="4">
            <el-form-item label="状态">
              <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 100%">
                <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-form-item label="告警来源">
              <el-select v-model="filters.source" placeholder="全部来源" clearable style="width: 100%">
                <el-option v-for="s in sourceOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6">
            <el-form-item label="所属园区">
              <el-select v-model="filters.park" placeholder="全部园区" clearable style="width: 100%">
                <el-option v-for="p in parkOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="12">
            <el-form-item label-width="0" class="filter-buttons">
              <el-button type="primary" @click="search">
                <el-icon><Search /></el-icon>
                查询
              </el-button>
              <el-button @click="reset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="table-title">告警历史记录<span class="record-count">共 {{ total }} 条</span></span>
          <el-button type="success" size="small" :loading="exporting" @click="exportExcel">
            <el-icon><Download /></el-icon>
            导出 Excel
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="id" label="告警编号" width="135" />
        <el-table-column prop="device" label="告警对象" min-width="160" show-overflow-tooltip />
        <el-table-column prop="park" label="所属园区" min-width="170" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="100" align="center" />
        <el-table-column prop="type" label="告警类型" min-width="140" show-overflow-tooltip />
        <el-table-column label="级别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="dark">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前值 / 阈值" min-width="150">
          <template #default="{ row }">{{ row.value }} / {{ row.threshold }}</template>
        </el-table-column>
        <el-table-column prop="time" label="告警时间" width="165" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处置人" width="90" align="center">
          <template #default="{ row }">{{ row.handler || '—' }}</template>
        </el-table-column>
        <el-table-column label="告警时长" width="95" align="center">
          <template #default="{ row }">{{ row.durationMin ? row.durationMin + ' 分钟' : '—' }}</template>
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
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
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

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
