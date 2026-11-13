<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLoginLogsApi, getOperationLogsApi, getBackupListApi, backupApi, restoreApi, downloadBackupApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const activeTab = ref('login')
const loading = ref(false)

const loginLogs = ref([])
const operationLogs = ref([])

const loginQuery = reactive({ keyword: '', status: '' })
const operationQuery = reactive({ keyword: '', module: '' })

const loginPage = reactive({ page: 1, pageSize: 5 })
const operationPage = reactive({ page: 1, pageSize: 5 })

const backupRecords = ref([])
const backupLoading = ref(false)
const backingUp = ref(false)
const restoring = ref(false)

const modules = ['用户管理', '角色权限', '地块档案', '设备控制', '租户管理']

const loginFiltered = computed(() =>
  loginLogs.value.filter((l) => {
    const matchKeyword = !loginQuery.keyword || l.username.includes(loginQuery.keyword) || l.name.includes(loginQuery.keyword)
    const matchStatus = loginQuery.status === '' || l.status === Number(loginQuery.status)
    return matchKeyword && matchStatus
  }),
)

const loginPaged = computed(() => {
  const start = (loginPage.page - 1) * loginPage.pageSize
  return loginFiltered.value.slice(start, start + loginPage.pageSize)
})

const operationFiltered = computed(() =>
  operationLogs.value.filter((l) => {
    const matchKeyword = !operationQuery.keyword || l.username.includes(operationQuery.keyword) || l.content.includes(operationQuery.keyword)
    const matchModule = !operationQuery.module || l.module === operationQuery.module
    return matchKeyword && matchModule
  }),
)

const operationPaged = computed(() => {
  const start = (operationPage.page - 1) * operationPage.pageSize
  return operationFiltered.value.slice(start, start + operationPage.pageSize)
})

async function loadData() {
  loading.value = true
  try {
    const [login, operation] = await Promise.all([getLoginLogsApi(), getOperationLogsApi()])
    loginLogs.value = login
    operationLogs.value = operation
  } finally {
    loading.value = false
  }
}

// 客户端分页：筛选后若列表变短导致当前页越界，自动回退
watch([() => loginFiltered.value.length, () => loginPage.pageSize], ([len, size]) => {
  const maxPage = Math.max(1, Math.ceil(len / size))
  if (loginPage.page > maxPage) loginPage.page = maxPage
})
watch([() => operationFiltered.value.length, () => operationPage.pageSize], ([len, size]) => {
  const maxPage = Math.max(1, Math.ceil(len / size))
  if (operationPage.page > maxPage) operationPage.page = maxPage
})

async function loadBackups() {
  backupLoading.value = true
  try {
    backupRecords.value = await getBackupListApi()
  } finally {
    backupLoading.value = false
  }
}

async function handleBackup() {
  backingUp.value = true
  try {
    const res = await backupApi()
    await loadBackups()
    ElMessage.success(`备份完成：${res.file}（${res.size}）`)
  } catch (err) {
    ElMessage.error(err.message || '备份失败')
  } finally {
    backingUp.value = false
  }
}

async function handleRestore(row) {
  const target = row || backupRecords.value[0]
  if (!target) {
    ElMessage.warning('暂无可恢复的备份文件，请先执行备份')
    return
  }
  try {
    await ElMessageBox.confirm(
      `将使用备份「${target.file}」覆盖当前数据，覆盖后不可撤销，确定继续吗？`,
      '风险提示',
      { confirmButtonText: '继续恢复', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return
  }
  restoring.value = true
  try {
    const res = await restoreApi(target.id)
    await auth.refreshPermissions()
    await Promise.all([loadData(), loadBackups()])
    ElMessage.success(`数据已恢复到 ${res.time} 的备份：${res.file}`)
  } catch (err) {
    ElMessage.error(err.message || '恢复失败')
  } finally {
    restoring.value = false
  }
}

async function handleDownload(row) {
  try {
    const { file, content } = await downloadBackupApi(row.id)
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = file
    link.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    ElMessage.error(err.message || '下载失败')
  }
}

onMounted(() => {
  loadData()
  loadBackups()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">日志审计与备份</h3>
    </div>

    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登录日志" name="login">
          <div class="toolbar">
            <el-input v-model="loginQuery.keyword" placeholder="用户名 / 姓名" clearable style="width: 220px" @keyup.enter="loginPage.page = 1">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="loginQuery.status" placeholder="登录结果" clearable style="width: 120px">
              <el-option label="成功" :value="1" />
              <el-option label="失败" :value="0" />
            </el-select>
            <el-button type="primary" @click="loginPage.page = 1">查询</el-button>
          </div>
          <el-table v-loading="loading" :data="loginPaged" border stripe>
            <el-table-column prop="username" label="用户名" min-width="110" />
            <el-table-column prop="name" label="姓名" min-width="90" />
            <el-table-column prop="ip" label="IP 地址" min-width="120" />
            <el-table-column prop="location" label="登录地点" min-width="100" />
            <el-table-column prop="browser" label="浏览器" min-width="110" />
            <el-table-column prop="os" label="操作系统" min-width="110" />
            <el-table-column label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" min-width="170" />
          </el-table>
          <el-pagination
            v-model:current-page="loginPage.page"
            v-model:page-size="loginPage.pageSize"
            :total="loginFiltered.length"
            layout="total, sizes, prev, pager, next"
            class="pagination"
          />
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="operation">
          <div class="toolbar">
            <el-input v-model="operationQuery.keyword" placeholder="操作人 / 操作内容" clearable style="width: 220px" @keyup.enter="operationPage.page = 1">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="operationQuery.module" placeholder="功能模块" clearable style="width: 160px">
              <el-option v-for="m in modules" :key="m" :label="m" :value="m" />
            </el-select>
            <el-button type="primary" @click="operationPage.page = 1">查询</el-button>
          </div>
          <el-table v-loading="loading" :data="operationPaged" border stripe>
            <el-table-column prop="username" label="操作人" min-width="100" />
            <el-table-column prop="module" label="功能模块" min-width="110" />
            <el-table-column prop="operation" label="操作类型" min-width="100" />
            <el-table-column prop="content" label="操作内容" min-width="280" />
            <el-table-column prop="ip" label="IP 地址" min-width="120" />
            <el-table-column prop="time" label="时间" min-width="170" />
          </el-table>
          <el-pagination
            v-model:current-page="operationPage.page"
            v-model:page-size="operationPage.pageSize"
            :total="operationFiltered.length"
            layout="total, sizes, prev, pager, next"
            class="pagination"
          />
        </el-tab-pane>

        <el-tab-pane label="数据备份" name="backup">
          <div class="backup-actions">
            <el-button type="primary" :loading="backingUp" @click="handleBackup">
              <el-icon><Download /></el-icon>立即备份
            </el-button>
            <el-button type="warning" :loading="restoring" :disabled="!backupRecords.length" @click="handleRestore()">
              <el-icon><RefreshLeft /></el-icon>恢复最近备份
            </el-button>
            <span class="backup-tip">备份内容为当前全库数据快照，最多保留 10 份</span>
          </div>
          <el-table
            v-loading="backupLoading"
            :data="backupRecords"
            border
            stripe
            empty-text="暂无备份文件，请点击「立即备份」生成"
          >
            <el-table-column prop="file" label="备份文件" min-width="280" />
            <el-table-column prop="time" label="备份时间" min-width="180" />
            <el-table-column prop="size" label="文件大小" min-width="120" />
            <el-table-column label="操作" width="160">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
                <el-button link type="warning" @click="handleRestore(row)">恢复</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.backup-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.backup-tip {
  color: #909399;
  font-size: 12px;
}
</style>